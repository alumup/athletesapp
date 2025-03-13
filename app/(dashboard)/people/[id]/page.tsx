"use client";
import { useState, useEffect, Key } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { getAccount, getPrimaryContacts } from "@/lib/fetchers/client";
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { fullName } from "@/lib/utils";
import { toast } from "sonner";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import LoadingCircle from "@/components/icons/loading-circle";
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { Button } from "@/components/marketing/Button";
import PersonSheet from "@/components/modal/person-sheet";
import CreateInvoiceModal from "@/components/modal/create-invoice-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

interface PersonPageProps {
  params: { id: string }
}

// Add this interface for better type safety
interface Team {
  id: string
  name: string
  is_active: boolean
  created_at: string
}

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_method: 'stripe' | 'cash' | 'check' | 'other';
  invoice: {
    id: string;
    invoice_number: string;
    description: string;
    status: 'draft' | 'sent' | 'paid' | 'void' | 'overdue';
    due_date: string;
  };
}

// Add these interfaces
interface Invoice {
  id: string
  created_at: string
  amount: number
  status: string
  due_date: string | null
  invoice_number: string | null
  description: string | null
  payments?: Payment[]
  person?: {
    id: string
    first_name: string
    last_name: string
    dependent: boolean
  }
}


// Add this helper function at the top of your file
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default function PersonPage({ params }: PersonPageProps) {
  const supabase = createClient();

  const [person, setPerson] = useState<any>(null);
  const [toRelationships, setToRelationships] = useState<any>(null);
  const [fromRelationships, setFromRelationships] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [profile, setProfile] = useState<boolean>(true);
  const [roster, setRoster] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);

  // Added fetchRoster function
  async function fetchRoster() {
    const { data, error } = await supabase
      .from("rosters")
      .select(`
        *,
        teams (
          id,
          name,
          is_active,
          created_at
        )
      `)
      .eq("person_id", params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setRoster(data.map((entry) => entry.teams));
  }

  // Add this new function to fetch payments
  async function fetchPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          description,
          status,
          due_date
        )
      `)
      .eq('person_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    return data;
  }

  // Update the fetch function
  useEffect(() => {
    async function fetchAllInvoicesAndPayments() {
      setIsLoadingInvoices(true);
      try {
        // First get all relationships
        const { data: relationships, error: relationshipsError } = await supabase
          .from('relationships')
          .select(`
            *,
            from:person_id(*),
            to:relation_id(*)
          `)
          .or(`person_id.eq.${params.id},relation_id.eq.${params.id}`);

        if (relationshipsError) {
          console.error('Error fetching relationships:', relationshipsError);
          return;
        }

        // Get all related person IDs
        const relatedIds = relationships
          ? relationships.map(rel => 
              rel.person_id === params.id ? rel.relation_id : rel.person_id
            )
          : [];

        // Fetch invoices and payments for all related people
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select(`
            *,
            payments (*),
            person:people (
              id,
              first_name,
              last_name,
              dependent
            )
          `)
          .in('person_id', [params.id, ...relatedIds])
          .order('created_at', { ascending: false });

        if (invoicesError) {
          console.error('Error fetching invoices and payments:', invoicesError);
          toast.error('Failed to load payment history');
          return;
        }

        setInvoices(invoicesData || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load payment history');
      } finally {
        setIsLoadingInvoices(false);
      }
    }

    if (params.id) {
      fetchAllInvoicesAndPayments();
    }
  }, [params.id]);

  // Add this console.log to debug
  console.log('Invoices:', invoices);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [
          fetchedPerson,
          fetchedToRelationships,
          fetchedFromRelationships,
          fetchedAccount
        ] = await Promise.all([
          fetchPerson(),
          fetchToRelationships(),
          fetchFromRelationships(),
          getAccount(),
          fetchRoster(),
          fetchPayments()
        ])

        const primaryPeople = await getPrimaryContacts(fetchedPerson)
        const p = await hasProfile({
          ...fetchedPerson,
          primary_contacts: primaryPeople,
        })

        setPerson({ ...fetchedPerson, primary_contacts: primaryPeople })
        setToRelationships(fetchedToRelationships || [])
        setFromRelationships(fetchedFromRelationships || [])
        setAccount(fetchedAccount)
        setProfile(p)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load person data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  async function hasProfile(person: any) {
    let email = "";
    if (person.email) {
      email = person.email;
    } else if (person?.primary_contacts[0]?.email) {
      email = person.primary_contacts[0].email;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error(error);
      return false;
    }

    return data ? true : false;
  }

  async function fetchPerson() {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    return data;
  }

  async function fetchToRelationships() {
    const { data, error } = await supabase
      .from("relationships")
      .select("*,from:person_id(*),to:relation_id(*)")
      .eq("person_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    return data;
  }

  async function fetchFromRelationships() {
    const { data, error } = await supabase
      .from("relationships")
      .select("*,from:person_id(*),to:relation_id(*)")
      .eq("relation_id", params.id);

    if (error) {
      console.error(error);
      return;
    }

    console.log('fetchFromRelationships', data)

    return data;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingCircle />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col space-y-0.5">
          <h1 className="font-cal truncate text-base font-bold sm:text-3xl md:text-xl">
            {person?.name || fullName(person)}
          </h1>
          <p className="text-stone-500">{person?.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <PersonSheet 
            person={person}
            fromRelationships={fromRelationships || []}
            mode="edit"
            cta={`Edit ${person?.first_name}`}
            title={`Edit ${person?.first_name}`}
            description="Edit this person"
            account={account}
          />
          <Button 
            onClick={() => setInvoiceModalOpen(true)}
            variant="outline"
            color="primary"
            className="w-full"
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Updated Tabs Section with new styling */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="flex h-10 items-center gap-2 w-full justify-start">
          <TabsTrigger 
            value="teams"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "data-[state=active]:bg-[#212121] data-[state=active]:text-[#fafafa] data-[state=active]:border-none",
              "data-[state=inactive]:border data-[state=inactive]:border-input data-[state=inactive]:bg-background data-[state=inactive]:hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Teams
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "data-[state=active]:bg-[#212121] data-[state=active]:text-[#fafafa] data-[state=active]:border-none",
              "data-[state=inactive]:border data-[state=inactive]:border-input data-[state=inactive]:bg-background data-[state=inactive]:hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Payments
          </TabsTrigger>
            <TabsTrigger 
            value="relationships"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "data-[state=active]:bg-[#212121] data-[state=active]:text-[#fafafa] data-[state=active]:border-none",
              "data-[state=inactive]:border data-[state=inactive]:border-input data-[state=inactive]:bg-background data-[state=inactive]:hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Relationships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1" />
                  Active
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-gray-300 mr-1" />
                  Inactive
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {roster.length > 0 ? (
                <div className="space-y-3">
                  {roster.map((team: Team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        "hover:bg-muted/50 hover:border-muted-foreground/25",
                        "group relative"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className={cn(
                            "h-2 w-2 rounded-full",
                            team.is_active ? "bg-emerald-500" : "bg-gray-300"
                          )} 
                        />
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={team.is_active ? "default" : "secondary"}>
                          {team.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No teams found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoices & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex justify-center py-8">
                  <LoadingCircle />
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupBy(invoices, 'person_id' as keyof Invoice)).map(([personId, personInvoices]) => {
                    const person = personInvoices[0]?.person;
                    return (
                      <div key={personId} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {person?.first_name} {person?.last_name}
                            {personId === params.id && " (Primary)"}
                          </h3>
                          <Badge variant="outline">
                            Total: {formatCurrency(
                              personInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
                            )}
                          </Badge>
                        </div>
                        
                        {personInvoices.map((invoice: Invoice) => (
                          <div key={invoice.id} className="border rounded-lg p-4">
                            {/* Invoice Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium">
                                  {invoice.description || `Invoice #${invoice.invoice_number}`}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Created {new Date(invoice.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant={
                                    invoice.status === 'paid' 
                                      ? 'default' 
                                      : invoice.status === 'sent' 
                                      ? 'default' 
                                      : 'secondary'
                                  }
                                >
                                  {invoice.status}
                                </Badge>
                                <span className="font-medium">
                                  {formatCurrency(invoice.amount)}
                                </span>
                              </div>
                            </div>

                            {/* Payments Section */}
                            {invoice.payments && invoice.payments.length > 0 && (
                              <div className="mt-4 border-t pt-4">
                                <h4 className="text-sm font-medium mb-2">Payments</h4>
                                <div className="space-y-2">
                                  {invoice.payments.map((payment: Payment) => (
                                    <div 
                                      key={payment.id} 
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                          {payment.payment_method}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          {new Date(payment.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant={
                                            payment.status === 'succeeded' 
                                              ? 'default' 
                                              : payment.status === 'pending' 
                                              ? 'default' 
                                              : 'destructive'
                                          }
                                        >
                                          {payment.status}
                                        </Badge>
                                        <span className="font-medium">
                                          {formatCurrency(payment.amount)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {invoices.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm text-muted-foreground">No invoices found</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5">
                <div className="col-span-1 space-y-3">
                  {toRelationships?.map(
                    (relation: any, i: Key | null | undefined) => (
                      <div key={i}>
                        <div className="flex items-center space-x-1 rounded border border-stone-200 px-3 py-2">
                          <div className="flex flex-col">
                            <span>{relation.name} of</span>
                            <Link
                              href={`/people/${relation.to.id}`}
                              className="text-sm font-bold"
                            >
                              {relation.to.name || fullName(relation.to)}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  {fromRelationships?.map(
                    (relation: any, i: Key | null | undefined) => (
                      <div key={i} className="mb-10">
                        <div className="flex items-center space-x-1 rounded border border-stone-200 px-3 py-2">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col">
                              <span>{relation.name} is</span>
                              <Link
                                href={`/people/${relation.from.id}`}
                                className="text-sm font-bold"
                              >
                                {relation.from.name || fullName(relation.to)}
                              </Link>
                            </div>
                            <div>
                              {relation.primary ? (
                               <Badge variant="default">Primary</Badge>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateInvoiceModal
        person={person}
        account={account}
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
      />
    </div>
  );
}

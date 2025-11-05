"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  TrashIcon,
  MixerHorizontalIcon,
  EnterIcon
} from "@radix-ui/react-icons";
import EditRosterFeeModal from "@/components/modal/edit-roster-fee-modal";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import SendEmailModal from "@/components/modal/send-email-sheet";
import SendButton from "@/components/modal-buttons/send-button";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, FileText, DollarSign, ExternalLink } from "lucide-react";
import { CreateRosterInvoiceButton } from "@/components/create-roster-invoice-button";
import SendEmailSheet from "@/components/modal/send-email-sheet";

function paymentStatus(person: Person, fees: any, team: any) {
  // First check for successful payments
  if (fees?.payments?.length) {
    const successfulPayment = fees.payments.find(
      (payment: { person_id: string; fee_id: string; status: string }) =>
        payment.person_id === person.id &&
        payment.fee_id === fees.id &&
        payment.status === "succeeded"
    );
    
    if (successfulPayment) {
      return "succeeded";
    }
  }

  // Then check for existing invoices
  const rosterId = team.rosters?.find((r: any) => r.person_id === person.id)?.id;
  const hasInvoice = person.invoices?.some(
    invoice => invoice.roster_id === rosterId && invoice.status === "draft"
  );

  if (hasInvoice) {
    return "invoiced";
  }

  return "unpaid";
}

function renderStatusSpan(status: string) {
  let statusColor: string;
  switch (status) {
    case "succeeded":
      statusColor = "text-green-900 bg-green-100 border border-green-200";
      break;
    case "incomplete":
      statusColor = "text-yellow-900 bg-yellow-100 border border-yellow-200";
      break;
    case "pending":
      statusColor = "text-blue-900 bg-blue-100 border border-blue-200";
      break;
    case "failed":
      statusColor = "text-red-900 bg-red-100 border border-red-200";
      break;
    case "invoiced":
      statusColor = "text-purple-900 bg-purple-100 border border-purple-200";
      break;
    default:
      statusColor = "text-gray-900 bg-gray-100 border border-gray-200";
      status = "unpaid";
      break;
  }
  return (
    <span className={`rounded-md px-2 py-1 text-[10px] ${statusColor} uppercase`}>
      {status}
    </span>
  );
}

export type Person = {
  id: string;
  fees: {
    id: string;
    amount: number;
    payments: Array<{
      id: string;
      person_id: string;
      status: string;
      date: string;
      invoice_id?: string;
      payment_intent_id?: string;
    }>;
  };
  invoices?: Array<{
    id: string;
    status: string;
    roster_id: string;
  }>;
  first_name: string;
  last_name: string;
  name: string;
  primary_contacts: any;
};

const createColumns = (team: any, onEditFee: (rosterId: string, currentFeeId: string | null, personName: string) => void): ColumnDef<Person>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => (
      <>
        <Link
          href={`/people/${row.original.id}`}
          className="cursor rounded hover:bg-gray-100"
        >
          <span className="flex items-center space-x-2 text-sm text-gray-700">
            <EnterIcon className="h-5 w-5 text-gray-500" />
          </span>
        </Link>
      </>
    ),
  },
  {
    accessorKey: "fees",
    header: "Fee",
    cell: ({ row }: { row: any }) => {
      const fees = row.getValue("fees") as { amount: number; id: string } | undefined;
      const amount = fees?.amount;
      
      return (
        <span className={`rounded px-2 py-1 text-sm ${amount ? 'bg-gray-50 text-gray-700' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          {amount ? `$${amount}` : "No Fee"}
        </span>
      );
    },
  },
  {
    accessorKey: "fees",
    header: "Fee Status",
    cell: ({ row }: { row: any }) => {
      const person = row.original;
      // If no fee is assigned, show N/A
      if (!person.fees || !person.fees.amount) {
        return (
          <span className="rounded-md px-2 py-1 text-[10px] text-gray-900 bg-gray-100 border border-gray-200 uppercase">
            N/A
          </span>
        );
      }
      const status = paymentStatus(person, person.fees, team);
      const statusBadge = renderStatusSpan(status);
      return statusBadge;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => <div>{row.getValue("grade")}</div>,
  },
  {
    accessorKey: "birthdate",
    header: "Birthdate",
    cell: ({ row }) => <div>{row.getValue("birthdate")}</div>,
  },
  {
    accessorKey: "primary_contacts",
    header: "Email",
    cell: ({ row }) => (
      <div className="space-x-2">
        {row.original.primary_contacts.map((contact: any, index: any) => (
          <Link
            key={index}
            href={`/people/${contact?.id}`}
            className="cursor-pointer rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-sm lowercase text-gray-900"
          >
            {contact?.email}
          </Link>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const person = row.original;
      const roster = team.rosters?.find((r: any) => r.person_id === person.id);
      const fees = roster?.fees;
      
      // Find invoice for this roster
      const invoice = person.invoices?.find(inv => inv.roster_id === roster?.id);

      return (
        <div className="flex items-center gap-2">
          {/* Link to Person Page */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 px-2"
            title="View Person"
          >
            <Link href={`/people/${person.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>

          {/* Edit Fee Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditFee(roster?.id, fees?.id || null, person.name)}
            className="h-8 px-3 text-xs"
            title="Edit Fee"
          >
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            Edit Fee
          </Button>

          {/* Invoice/Payment Status Actions */}
          {invoice?.status === "paid" ? (
            <span className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-700">Paid</span>
            </span>
          ) : invoice?.status === "sent" ? (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement send reminder logic
                toast.success('Payment reminder sent');
              }}
              className="h-8 px-3 text-xs text-purple-600 hover:text-purple-700"
            >
              <Mail className="h-3.5 w-3.5 mr-1" />
              Sent
            </Button>
          ) : invoice?.status === "draft" ? (
            <Button 
              variant="outline"
              size="sm"
              disabled
              className="h-8 px-3 text-xs text-gray-500"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Draft
            </Button>
          ) : fees?.amount ? (
            // Show create invoice button only if fee is assigned
            <CreateRosterInvoiceButton 
              rosterId={roster?.id}
              athleteName={`${person.first_name} ${person.last_name}`}
              teamName={team?.name}
              amount={roster?.fees?.amount}
              guardianEmail={person.primary_contacts?.[0]?.email}
              accountId={team.account_id}
              stripeAccountId={team.accounts?.stripe_id}
              person_id={person.id}
            />
          ) : null}
        </div>
      );
    }
  }
];

export function TeamTable({
  data,
  team,
  account,
}: {
  data: Person[];
  team: any;
  account: any;
}) {
  const router = useRouter();
  const { refresh } = router;
  const supabase = createClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  // State for edit fee modal
  const [editFeeModalOpen, setEditFeeModalOpen] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string>("");
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [editingPersonName, setEditingPersonName] = useState<string>("");

  const handleEditFee = (rosterId: string, currentFeeId: string | null, personName: string) => {
    setEditingRosterId(rosterId);
    setEditingFeeId(currentFeeId);
    setEditingPersonName(personName);
    setEditFeeModalOpen(true);
  };

  const table = useReactTable({
    data,
    columns: createColumns(team, handleEditFee),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    console.log('Table Data:', data);
    data.forEach(person => {
      console.log('Person:', {
        name: person.name,
        fees: person.fees,
        paymentStatus: paymentStatus(person, person.fees, team)
      });
    });
  }, [data]);

  useEffect(() => {
    // Set the initial page size
    table.setPageSize(30);
  }, [table]); //

  // const handleDeleteSelected = () => {
  //   const people = selectedRows.map((row) => row.original);
  //   // Logic to delete selected rows
  // };

  const handleRemoveSelected = async () => {
    const people = selectedRows.map((row) => row.original);

    people.forEach(async (person: any) => {
      const { error } = await supabase
        .from("rosters")
        .delete()
        .eq("team_id", team.id)
        .eq("person_id", person.id);

      if (error) {
        console.log("ERROR REMOVING PERSON", error);
      }
    });

    // Show a toast notification

    refresh();
    table.toggleAllPageRowsSelected(false);
    toast.success("Selected players have been removed successfully.");
  };

  // Check if any row is selected
  const isAnyRowSelected = table?.getSelectedRowModel()?.rows?.length > 0;

  const selectedRows = table.getSelectedRowModel().rows;

  const people = selectedRows.map((row) => row.original);

  return (
    <>
      <EditRosterFeeModal
        open={editFeeModalOpen}
        onOpenChange={setEditFeeModalOpen}
        rosterId={editingRosterId}
        currentFeeId={editingFeeId}
        personName={editingPersonName}
      />
      <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto flex items-center justify-between"
            >
              <MixerHorizontalIcon className="mr-2 h-4 w-4" /> View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id + Math.random()}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isAnyRowSelected && (
        <div className="mb-2 flex justify-between space-x-4 py-2">
          <div className="flex items-center space-x-2">
            <SendEmailSheet
              people={people}
              account={account}
              cta="Send Email"
              onClose={() => table.toggleAllRowsSelected(false)}
            />  
          </div>
          <Button
            onClick={handleRemoveSelected}
            variant="outline"
            className="text-red-500"
          >
            <TrashIcon className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id + Math.random()}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id + Math.random()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id + Math.random()}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id + Math.random()}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  <div className="mt-2 flex flex-col items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    <span className="ml-2">Fetching team...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}

"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Invoice {
  id: string
  created_at: string
  amount: number
  status: string
  due_date: string | null
  invoice_number: string | null
  description: string | null
  person: {
    id: string
    first_name: string
    last_name: string
    email: string
    dependent: boolean
  } | null
  roster: {
    id: string
    team: {
      id: string
      name: string
    }
  } | null
  payments: Array<{
    id: string
    amount: number
    status: string
    created_at: string
  }> | null
}

interface InvoicesClientProps {
  invoices: Invoice[]
  accountId: string
}

type SortField = "created_at" | "amount" | "status" | "due_date" | "person"
type SortDirection = "asc" | "desc"

export default function InvoicesClient({ invoices, accountId }: InvoicesClientProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [resendingInvoiceId, setResendingInvoiceId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Calculate statistics
  const stats = useMemo(() => {
    const total = invoices.length
    const sent = invoices.filter(inv => inv.status === "sent").length
    const paid = invoices.filter(inv => inv.status === "paid").length
    const draft = invoices.filter(inv => inv.status === "draft").length
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const paidAmount = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const pendingAmount = invoices
      .filter(inv => inv.status === "sent")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0)

    return {
      total,
      sent,
      paid,
      draft,
      totalAmount,
      paidAmount,
      pendingAmount,
    }
  }, [invoices])

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(inv => {
        const personName = inv.person
          ? `${inv.person.first_name} ${inv.person.last_name}`.toLowerCase()
          : ""
        const email = inv.person?.email?.toLowerCase() || ""
        const description = inv.description?.toLowerCase() || ""
        const invoiceNumber = inv.invoice_number?.toLowerCase() || ""

        return (
          personName.includes(query) ||
          email.includes(query) ||
          description.includes(query) ||
          invoiceNumber.includes(query)
        )
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0
          break
        case "person":
          aValue = a.person ? `${a.person.first_name} ${a.person.last_name}` : ""
          bValue = b.person ? `${b.person.first_name} ${b.person.last_name}` : ""
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [invoices, searchQuery, statusFilter, sortField, sortDirection])

  // Paginate the filtered invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredInvoices.slice(startIndex, endIndex)
  }, [filteredInvoices, currentPage, pageSize])

  const totalPages = Math.ceil(filteredInvoices.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sent: "default",
      paid: "outline",
    }

    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      sent: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      paid: "bg-green-100 text-green-800 hover:bg-green-100",
    }

    return (
      <Badge variant={variants[status] || "default"} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="ml-2 h-4 w-4 inline" />
    ) : (
      <ArrowDownIcon className="ml-2 h-4 w-4 inline" />
    )
  }

  const handleResendInvoice = async (invoiceId: string) => {
    setResendingInvoiceId(invoiceId)
    
    try {
      const response = await fetch("/api/invoices/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoiceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend invoice")
      }

      toast.success("Invoice email resent successfully!")
      router.refresh() // Refresh to update the UI with new metadata
    } catch (error: any) {
      console.error("Error resending invoice:", error)
      toast.error(error.message || "Failed to resend invoice")
    } finally {
      setResendingInvoiceId(null)
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status === "sent" &&
      invoice.due_date &&
      new Date(invoice.due_date) < new Date()
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.draft} draft, {stats.sent} sent, {stats.paid} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Across all invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{stats.paid} invoices paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${stats.pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{stats.sent} invoices sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, invoice number, or description..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1) // Reset to first page when filtering
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            Complete list of all invoices with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("created_at")}
                      className="hover:bg-transparent p-0"
                    >
                      Date <SortIcon field="created_at" />
                    </Button>
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("person")}
                      className="hover:bg-transparent p-0"
                    >
                      Recipient <SortIcon field="person" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("amount")}
                      className="hover:bg-transparent p-0"
                    >
                      Amount <SortIcon field="amount" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("status")}
                      className="hover:bg-transparent p-0"
                    >
                      Status <SortIcon field="status" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("due_date")}
                      className="hover:bg-transparent p-0"
                    >
                      Due Date <SortIcon field="due_date" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {new Date(invoice.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.invoice_number || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.person ? (
                          <div>
                            <div className="font-medium">
                              {invoice.person.first_name} {invoice.person.last_name}
                              {invoice.person.dependent && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Dependent
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.person.email}
                            </div>
                            {invoice.roster?.team && (
                              <div className="text-xs text-muted-foreground">
                                Team: {invoice.roster.team.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={invoice.description || ""}>
                          {invoice.description || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.due_date ? (
                          <div>
                            {new Date(invoice.due_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {isOverdue(invoice) && (
                              <div className="text-xs text-red-600 font-medium">Overdue</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status === "sent" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvoice(invoice.id)}
                            disabled={resendingInvoiceId === invoice.id}
                            className={`${
                              isOverdue(invoice) 
                                ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                          >
                            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                            {resendingInvoiceId === invoice.id ? "Sending..." : "Resend"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} results
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 40, 50].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to first page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to last page</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


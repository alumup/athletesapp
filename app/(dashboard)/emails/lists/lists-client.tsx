"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"
import { formatDistanceToNow } from "date-fns"
import { Mail, Users, ArrowUpDown, Loader2, RefreshCw, Trash2, UserPlus } from "lucide-react"
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
} from "@tanstack/react-table"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface List {
  id: string
  created_at: string
  name: string
  description: string | null
  resend_segment_id: string | null
  list_people: Array<{
    id: string
    people: {
      id: string
      first_name: string
      last_name: string
      email: string
      dependent: boolean
    }
  }>
}

interface Person {
  id: string
  first_name: string
  last_name: string
  email: string
  dependent: boolean
}

interface ListsClientProps {
  lists: List[]
  people: Person[]
  account: any
  accountId: string
}

export default function ListsClient({ lists, people, account, accountId }: ListsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Create list modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [listName, setListName] = useState("")
  const [listDescription, setListDescription] = useState("")

  // Add people modal state
  const [addPeopleModalOpen, setAddPeopleModalOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([])
  const [addPeopleLoading, setAddPeopleLoading] = useState(false)

  // Sync to Resend
  const [syncingListId, setSyncingListId] = useState<string | null>(null)

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const { error } = await supabase
        .from("lists")
        .insert({
          account_id: accountId,
          name: listName,
          description: listDescription || null,
        })

      if (error) throw error

      toast.success("List created successfully")
      setCreateModalOpen(false)
      setListName("")
      setListDescription("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create list")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return

    try {
      const { error } = await supabase.from("lists").delete().eq("id", listId)

      if (error) throw error

      toast.success("List deleted successfully")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete list")
    }
  }

  const handleSyncToResend = async (listId: string) => {
    setSyncingListId(listId)

    try {
      const response = await fetch("/api/lists/sync-to-resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync")
      }

      toast.success(`Synced ${data.synced} contacts to Resend`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to sync to Resend")
    } finally {
      setSyncingListId(null)
    }
  }

  const handleAddPeople = async () => {
    if (!selectedListId || selectedPeopleIds.length === 0) return

    setAddPeopleLoading(true)

    try {
      const { error } = await supabase
        .from("list_people")
        .insert(
          selectedPeopleIds.map((personId) => ({
            list_id: selectedListId,
            person_id: personId,
          }))
        )

      if (error) throw error

      toast.success(`Added ${selectedPeopleIds.length} people to list`)
      setAddPeopleModalOpen(false)
      setSelectedPeopleIds([])
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to add people")
    } finally {
      setAddPeopleLoading(false)
    }
  }

  // Define columns
  const columns = useMemo<ColumnDef<List>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-transparent p-0"
            >
              List Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground">{row.original.description}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "members",
        header: "Members",
        cell: ({ row }) => {
          const count = row.original.list_people.length
          return (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{count}</span>
              <span className="text-sm text-muted-foreground">
                {count === 1 ? "person" : "people"}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "resend_status",
        header: "Resend Status",
        cell: ({ row }) => {
          const isSynced = !!row.original.resend_segment_id
          return isSynced ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <RefreshCw className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          ) : (
            <Badge variant="secondary">Not Synced</Badge>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedListId(row.original.id)
                setAddPeopleModalOpen(true)
              }}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add People
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSyncToResend(row.original.id)}
              disabled={syncingListId === row.original.id}
            >
              {syncingListId === row.original.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteList(row.original.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [syncingListId]
  )

  const table = useReactTable({
    data: lists,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase()
      return (
        row.original.name.toLowerCase().includes(searchValue) ||
        row.original.description?.toLowerCase().includes(searchValue) ||
        false
      )
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  useEffect(() => {
    table.setPageSize(25)
  }, [table])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = lists.length
    const synced = lists.filter((list) => list.resend_segment_id).length
    const totalMembers = lists.reduce((acc, list) => acc + list.list_people.length, 0)
    const avgMembersPerList = total > 0 ? Math.round(totalMembers / total) : 0

    return {
      total,
      synced,
      totalMembers,
      avgMembersPerList,
    }
  }, [lists])

  // Filter people not already in the selected list
  const availablePeople = useMemo(() => {
    if (!selectedListId) return people

    const selectedList = lists.find((l) => l.id === selectedListId)
    if (!selectedList) return people

    const existingPeopleIds = selectedList.list_people.map((lp) => lp.people.id)
    return people.filter((p) => !existingPeopleIds.includes(p.id))
  }, [selectedListId, lists, people])

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateList}>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>
                  Create a segment for organizing and sending broadcasts to specific groups
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Basketball Parents"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this list for?"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create List
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lists</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Segments created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced to Resend</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.synced}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.synced / stats.total) * 100) : 0}% synced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all lists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMembersPerList}</div>
            <p className="text-xs text-muted-foreground">Per list</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find lists by name or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lists..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Lists ({table.getFilteredRowModel().rows.length})</CardTitle>
          <CardDescription>
            Manage your segments for sending broadcasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        {lists.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8">
                            <Mail className="h-12 w-12 text-muted-foreground/50" />
                            <p className="font-medium">No lists created yet</p>
                            <p className="text-sm text-muted-foreground">
                              Create your first list to start organizing people
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No lists match your search</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} list(s)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add People Modal */}
      <Dialog open={addPeopleModalOpen} onOpenChange={setAddPeopleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add People to List</DialogTitle>
            <DialogDescription>
              Select people to add to this list. Already added members are not shown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto max-h-[50vh]">
            {availablePeople.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                All people are already in this list
              </p>
            ) : (
              <div className="space-y-2">
                {availablePeople.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-md"
                  >
                    <Checkbox
                      id={person.id}
                      checked={selectedPeopleIds.includes(person.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPeopleIds([...selectedPeopleIds, person.id])
                        } else {
                          setSelectedPeopleIds(
                            selectedPeopleIds.filter((id) => id !== person.id)
                          )
                        }
                      }}
                    />
                    <label
                      htmlFor={person.id}
                      className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>
                        {person.first_name} {person.last_name}
                        {person.dependent && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Dependent
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{person.email}</div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddPeopleModalOpen(false)
                setSelectedPeopleIds([])
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPeople}
              disabled={addPeopleLoading || selectedPeopleIds.length === 0}
            >
              {addPeopleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {selectedPeopleIds.length} {selectedPeopleIds.length === 1 ? "Person" : "People"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


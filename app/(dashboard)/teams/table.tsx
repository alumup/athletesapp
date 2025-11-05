"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  TrashIcon,
  MixerHorizontalIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";

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
import { getPrimaryContact } from "@/lib/fetchers/client";
import SendEmailSheet from "@/components/modal/send-email-sheet"

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export type Team = {
  id: string;
  name: string;
  is_active: boolean;
  rosters: any;
  staff: {
    people: {
      name: string;
    };
  }[];
};

const columns: ColumnDef<Team>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="flex w-fit items-center gap-1">
          {isActive ? (
            <>
              <CheckCircledIcon className="h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <CrossCircledIcon className="h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      if (value === "active") return row.getValue(id) === true;
      if (value === "inactive") return row.getValue(id) === false;
      return true;
    },
  },
  {
    accessorKey: "staff",
    header: "Staff",
    cell: ({ row }) => {
      const staff = row.original.staff;
      if (staff && staff.length > 0 && staff[0].people) {
        return <div>{staff[0].people.name}</div>;
      }
      return <div className="text-gray-400">No staff</div>;
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/teams/${row.original.id}`}
        className="cursor rounded p-1 hover:bg-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <ArrowRightIcon className="h-5 w-5 text-gray-700" />
      </Link>
    ),
  },
];

export function TeamTable({ data, account }: { data: Team[]; account: any }) {
  const router = useRouter();
  const { refresh } = useRouter();
  const supabase = createClient();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Navigate to team detail page
  const navigateToTeam = useCallback((teamId: string) => {
    router.push(`/teams/${teamId}`);
  }, [router]);

  // Define handler functions before table initialization
  const handleToggleStatus = async (teamId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("teams")
      .update({ is_active: !currentStatus })
      .eq("id", teamId);

    if (error) {
      toast.error("Failed to update team status");
      return;
    }

    refresh();
    toast.success(`Team ${!currentStatus ? "activated" : "archived"} successfully`);
  };

  const table = useReactTable({
    data,
    columns,
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
    // Set the initial page size
    table.setPageSize(30);
  }, []);

  const handleDeleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    // Logic to delete selected rows
    await Promise.all(
      selectedRows.map((row) => {
        return supabase.from("teams").delete().eq("id", row.original.id);
      }),
    );

    // Show a toast notification
    table.toggleAllRowsSelected(false);
    refresh();
    toast.success("Selected teams have been deleted successfully.");
  };

  const handleArchiveSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    await Promise.all(
      selectedRows.map((row) => {
        return supabase.from("teams").update({ is_active: false }).eq("id", row.original.id);
      }),
    );

    table.toggleAllRowsSelected(false);
    refresh();
    toast.success("Selected teams have been archived successfully.");
  };

  const handleActivateSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    await Promise.all(
      selectedRows.map((row) => {
        return supabase.from("teams").update({ is_active: true }).eq("id", row.original.id);
      }),
    );

    table.toggleAllRowsSelected(false);
    refresh();
    toast.success("Selected teams have been activated successfully.");
  };

  // Check if any row is selected
  const isAnyRowSelected = table?.getSelectedRowModel()?.rows?.length > 0;

  const selectedRows = table.getSelectedRowModel().rows;

  const [primaryContacts, setPrimaryContacts] = useState<any>([]);

  useEffect(() => {
    const fetchPrimaryContacts = async () => {
      const selectedPeople = selectedRows.flatMap(
        (team) => team.original.rosters,
      );
      const people = selectedPeople.flatMap((roster) => roster.people);
      const primaryContactsPromises = people.map(async (person) => {
        const primaryContact = await getPrimaryContact(person);
        return {
          ...person,
          primary_contacts: primaryContact,
        };
      });
      const primaryContacts = await Promise.all(primaryContactsPromises);
      setPrimaryContacts(primaryContacts);
    };
    fetchPrimaryContacts();
  }, [selectedRows]);

  // const teams = selectedRows.map((row) => row.original);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
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
            <Button variant="outline" className="flex items-center justify-between">
              Filter: {(table.getColumn("is_active")?.getFilterValue() as string) || "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!table.getColumn("is_active")?.getFilterValue()}
              onCheckedChange={() => table.getColumn("is_active")?.setFilterValue(undefined)}
            >
              All Teams
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={table.getColumn("is_active")?.getFilterValue() === "active"}
              onCheckedChange={() => table.getColumn("is_active")?.setFilterValue("active")}
            >
              Active Only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={table.getColumn("is_active")?.getFilterValue() === "inactive"}
              onCheckedChange={() => table.getColumn("is_active")?.setFilterValue("inactive")}
            >
              Inactive Only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                    key={column.id}
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
              people={primaryContacts}
              account={account}
              cta="Send Email"
              onClose={() => table.toggleAllRowsSelected(false)}
            />
            <Button
              onClick={handleActivateSelected}
              variant="outline"
              className="text-green-600"
            >
              <CheckCircledIcon className="mr-2 h-4 w-4" /> Activate
            </Button>
            <Button
              onClick={handleArchiveSelected}
              variant="outline"
              className="text-orange-600"
            >
              <CrossCircledIcon className="mr-2 h-4 w-4" /> Archive
            </Button>
          </div>
          <Button
            onClick={handleDeleteSelected}
            variant="outline"
            className="text-red-500"
          >
            <TrashIcon className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  onClick={() => navigateToTeam(row.original.id)}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
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
  );
}

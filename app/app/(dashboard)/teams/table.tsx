"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import {
  TrashIcon,
  MixerHorizontalIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";

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
import SendEmailModal from "@/components/modal/send-email-modal";
import SendButton from "@/components/modal-buttons/send-button";

import { useRouter } from "next/navigation";

export type Person = {
  id: string;
  name: string;
  rosters: any;
};

const columns: ColumnDef<Person>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "coach",
    header: "Coach",
    cell: ({ row }) => <div>{row.getValue("coach")}</div>,
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => (
      <>
        <Link
          href={`/teams/${row.original.id}`}
          className="cursor rounded hover:bg-gray-100"
        >
          <span className="flex items-center space-x-2 text-sm text-gray-700">
            <ArrowRightIcon className="h-5 w-5" />
          </span>
        </Link>
      </>
    ),
  },
];

export function TeamTable({ data, account }: { data: Person[]; account: any }) {
  const { refresh } = useRouter();
  const supabase = createClientComponentClient();
  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
  }, []); //

  // const navigateTo = (id: any) => {
  //   router.push(`/teams/${id}`)
  // }

  const handleDeleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    // Logic to delete selected rows
    await Promise.all(
      selectedRows.map((row) => {
        return supabase.from("teams").delete().eq("id", row.original.id);
      }),
    );

    // Show a toast notification
    refresh();
    toast.success("Selected teams have been deleted successfully.");
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
      console.log("PRIMARY CONTACTS --------------->", primaryContacts);
      setPrimaryContacts(primaryContacts);
    };
    fetchPrimaryContacts();
  }, [selectedRows]);

  // const teams = selectedRows.map((row) => row.original);

  return (
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
            <SendButton channel="email" cta="Send Email">
              <SendEmailModal
                people={primaryContacts}
                account={account}
                onClose={() => table.toggleAllPageRowsSelected(false)}
              />
            </SendButton>
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
                  // onClick={() => navigateTo(row.original.id)}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={"cursor-pointer hover:bg-gray-50"}
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

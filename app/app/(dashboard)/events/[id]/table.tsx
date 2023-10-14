"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

import {
  TrashIcon,
  ListBulletIcon,
  MixerHorizontalIcon,
  DotsHorizontalIcon,
  Pencil1Icon
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

import SendEmailModal from "@/components/modal/send-email-modal";

import SendButton from "@/components/modal-buttons/send-button";
import IconButton from "@/components/modal-buttons/icon-button";




export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  tags: any;
  email: string;
  grade: string,
  birthdate: string,
  phone: string;
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
    enableSorting: true,
    enableHiding: false,
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
  accessorKey: "actions",
  header: "",
  cell: ({ row }) => 
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor">
          <DotsHorizontalIcon width={18}/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-2">
      
            <Link href={`/people/${row.original.id}`} className="cursor hover:bg-gray-100 rounded">
              <span className="flex items-center space-x-2 text-sm text-gray-700">
                <Pencil1Icon className="mr-2 h-4 w-4" /> Visit
              </span>
            </Link>
      
            <Link href={`/people/${row.original.id}`} className="cursor hover:bg-gray-100 rounded">
            <span className="flex items-center space-x-2 text-sm text-gray-700">
                <TrashIcon className="mr-2 h-4 w-4" /> Delete
              </span>
            </Link>
        
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  }
];




export function EventTable({data, account}: {data: Person[], account: any}) {

 
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );


  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
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

  

    const handleDeleteSelected = () => {
      const selectedRows = table.getSelectedRowModel().rows;
      // Logic to delete selected rows
    };
  
    // Check if any row is selected
    const isAnyRowSelected = table.getSelectedRowModel().rows.length > 0;

    const selectedRows = table.getSelectedRowModel().rows;

    const people = selectedRows.map((row) => row.original);

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
            <Button variant="outline" className="ml-auto flex justify-between items-center">
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
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isAnyRowSelected && (
        <div className="flex justify-between space-x-4 py-2 mb-2">
          <div className="flex items-center space-x-2"> 
            <SendButton channel="email" cta="Send Email">
              <SendEmailModal people={people} account={account} />
            </SendButton>
          </div>
          <Button onClick={handleDeleteSelected} variant="outline" className="text-red-500">
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
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
        <div className="flex-1 text-sm text-muted-foreground">
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
  )
}

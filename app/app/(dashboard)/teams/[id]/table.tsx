"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import {
  TrashIcon,
  MixerHorizontalIcon,
  ArrowRightIcon
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
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";



function paymentStatus(person: any, fees: any) {
  // Check if there is a payment for the fee by the person
  const paymentsForPerson = fees.payments.filter((payment: { person_id: any; }) => payment.person_id === person.id);

  // Sort the payments by date, most recent first
  paymentsForPerson.sort((a: { date: string; }, b: { date: string; }) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Check if any of the payments status are 'succeeded'
  const succeededPayment = paymentsForPerson.find((payment: { status: string; }) => payment.status === 'succeeded');

  // If there is a 'succeeded' payment, return 'succeeded'
  if (succeededPayment) {
    return 'succeeded';
  }

  // If there is no 'succeeded' payment, return the status of the most recent payment
  // If there is no 'succeeded' payment, return the status of the most recent payment and the count of payments
  return paymentsForPerson[0]?.status
}

function renderStatusSpan(status: string) {
  let statusColor: string;
  switch (status) {
    case 'succeeded':
      statusColor = "text-green-900 bg-green-100 border border-green-200";
      break;
    case 'incomplete':
      statusColor = "text-yellow-900 bg-yellow-100 border border-yellow-200";
      break;
    case 'pending':
      statusColor = "text-gray-900 bg-text-100 border border-text-200";
      status
      break;
    case 'failed':
      statusColor = "text-red-900 bg-red-100 border border-red-200";
      break;
    default:
      statusColor = "text-gray-900 bg-gray-100 border border-gray-200";
      status = "unpaid";
      break;
  }
  return <span className={`text-[10px] px-2 py-1 rounded-md ${statusColor} uppercase`}>{status}</span>;
}


export type Person = {
  id: string;
  fees: any;
  first_name: string;
  last_name: string;
  name: string;
  tags: any;
  email: string;
  grade: string,
  birthdate: string,
  phone: string;
  primary_contacts: any
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
    accessorKey: "fees",
    header: "Fee",
    cell: ({ row }: { row: any }) => {
      const fees = row.getValue("fees") as { amount: number } | undefined;
      const amount = fees?.amount;
      return (
        <span className="px-2 py-1 rounded bg-gray-50 text-gray-500">
          ${amount ?? 'N/A'}
        </span>
      );
    },
  },
  {
    accessorKey: "fees",
    header: "Fee Status",
    cell: ({ row }: { row: any }) => {
      const person = row.original;
      const status = paymentStatus(person, person.fees);
      const statusBadge = renderStatusSpan(status)
      return statusBadge
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
            className="px-2 py-1 rounded-full text-sm text-gray-900 bg-gray-100 border border-gray-200 lowercase cursor-pointer"
          >
            {contact?.email}
          </Link>
        ))}
      </div>
    ),
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
      <Link href={`/people/${row.original.id}`} className="cursor hover:bg-gray-100 rounded">
        <span className="flex items-center space-x-2 text-sm text-gray-700">
          <ArrowRightIcon className="h-5 w-5" />
        </span>
      </Link>
    </>
  }
];




export function TeamTable({data, team, account}: {data: Person[], team: any, account: any}) {
  const { refresh } = useRouter();
  const supabase = createClientComponentClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );

  useEffect(() => {
    console.log("DATA", data)
  },[])


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

    // const handleDeleteSelected = () => {
    //   const people = selectedRows.map((row) => row.original);
    //   // Logic to delete selected rows
    // };
  
  const handleRemoveSelected = async () => {
    const people = selectedRows.map((row) => row.original);

    people.forEach(async (person: any) => {
      const { error } = await supabase
        .from('rosters')
        .delete()
        .eq('team_id', team.id)
        .eq('person_id', person.id)
      
      if (error) {
        console.log("ERROR REMOVING PERSON", error)
      }
    })

    // Show a toast notification

    refresh();
    table.toggleAllPageRowsSelected(false)
    toast.success('Selected players have been removed successfully.');
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
              <SendEmailModal
                people={people}
                account={account}
                onClose={() => table.toggleAllPageRowsSelected(false)}
              />
            </SendButton>
          </div>
          <Button onClick={handleRemoveSelected} variant="outline" className="text-red-500">
            <TrashIcon className="mr-2 h-4 w-4" /> Remove
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

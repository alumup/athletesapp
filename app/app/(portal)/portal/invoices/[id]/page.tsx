"use client";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const InvoicePage = ({ params }: { params: { id: string } }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `*,
                    rosters:roster_id(*),
                    fees:fee_id(*),
                    profile:person_id(*)`,
        )
        .eq("profile_id", params.id)
        .eq("status", "succeeded");

      if (data && !error) {
        setPayments(data);
      }
    };

    if (params.id) getPayments();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 py-10 shadow">
        <Link href={`/portal`} className="cursor rounded hover:bg-gray-100">
          <span className="flex items-center space-x-2 text-sm text-gray-700">
            <ArrowLeftIcon className="h-8 w-8" />
          </span>
        </Link>
        <div className="mt-10">
          <div className="bg-white p-6  md:mx-auto">
            <ul role="list" className="divide-y divide-gray-100">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Fees
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Amount
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {payments?.map((payment) => (
                            <tr key={payment.id}>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {payment.fees?.name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {payment.profile?.name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  ${payment.fees?.amount}
                                </div>
                              </td>
                              <td className="flex-column flex whitespace-nowrap px-6 py-4">
                                <p className="text-xs leading-5 text-emerald-500">
                                  {payment.status}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;

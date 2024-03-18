"use client";
import { ArrowLeftIcon, PlusIcon } from "@radix-ui/react-icons";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const NewDependent = ({ params }: { params: { id: string } }) => {
  const [dependents, setDependents] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getDependents = async () => {
      const { data, error } = await supabase
        .from("relationships")
        .select("*,from:person_id(*),to:relation_id(*, accounts(*))")
        .eq("person_id", [params.id]);

      if (!error && data) setDependents(data);
    };

    getDependents();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 py-10 shadow">
        <div className="flex items-center justify-between">
          <Link
            href={`/portal/dependents/${params.id}`}
            className="cursor rounded px-6 hover:bg-gray-100"
          >
            <span className="flex items-center space-x-2 text-sm text-gray-700">
              <ArrowLeftIcon className="h-8 w-8" />
            </span>
          </Link>
          <Link
            href={`/portal/dependents/new`}
            className="cursor rounded px-6 hover:bg-gray-100"
          >
            <span className="flex items-center space-x-2 rounded border p-3 text-sm text-gray-700">
              <PlusIcon className="mr-1 h-5 w-5" /> Add New Dependent
            </span>
          </Link>
        </div>
        <div>
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
                              New
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Relationship
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              Account/Program
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {dependents?.map((dependent) => (
                            <tr key={dependent.id}>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {dependent.to?.name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {dependent.name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {dependent.to?.accounts?.name}
                                </div>
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

export default NewDependent;

'use client'
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const InvoicePage = ({ params }: {
    params: { id: string }
}) => {

    const [payments, setPayments] = useState<any[]>([])
    const supabase = createClientComponentClient()

    useEffect(() => {
        const getPayments = async () => {
            const { data, error } = await supabase
                .from("payments")
                .select(`*,
                    rosters:roster_id(*),
                    fees:fee_id(*),
                    profile:person_id(*)`)
                .eq("profile_id", params.id)
                .eq("status", "succeeded")

            if (data && !error) {
                setPayments(data)
            }
        }

        if (params.id) getPayments()
    }, [])



    return (
        <>
            <div className="max-w-4xl mx-auto py-10 px-5 border border-gray-300 rounded-xl shadow bg-white">
                <Link href={`/portal`} className="cursor hover:bg-gray-100 rounded">
                    <span className="flex items-center space-x-2 text-sm text-gray-700">
                        <ArrowLeftIcon className="h-8 w-8" />
                    </span>
                </Link>
                <div className='mt-10'>
                    <div className="bg-white p-6  md:mx-auto">
                        <ul role="list" className="divide-y divide-gray-100">
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Fees
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Amount
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {payments?.map((payment) => (
                                                        <tr key={payment.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{payment.fees?.name}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">{payment.profile?.name}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">${payment.fees?.amount}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap flex flex-column">
                                                                <p className="text-xs leading-5 text-emerald-500">{payment.status}</p>
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
    )

};

export default InvoicePage;

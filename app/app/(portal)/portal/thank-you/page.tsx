'use client'
import { useModal } from '@/components/modal/provider';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';

const ThankYouPage = () => {
    const modal = useModal()

    useEffect(() => {
        const hideModal = async () => {
            if (modal?.isModalOpen) {
                modal?.hide()
            }
        }

        hideModal();
    }, [modal])

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
                        <CheckCircle className='h-35 w-35 mx-auto my-6' />
                        <div className="text-center">
                            <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">Payment Done!</h3>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

};

export default ThankYouPage;

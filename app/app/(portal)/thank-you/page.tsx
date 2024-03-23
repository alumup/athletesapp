"use client";
import { useModal } from "@/components/modal/provider";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ThankYouPage = () => {
  const modal = useModal();
  const router = useRouter();

  useEffect(() => {
    const hideModal = async () => {
      if (modal?.isModalOpen) {
        modal?.hide();
      }
    };

    hideModal();
  }, [modal]);

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-300 bg-white px-5 py-10 shadow">
        <a href={"/portal"} className="cursor  rounded">
          <span className="flex items-center space-x-2 text-sm text-gray-700">
            <ArrowLeftIcon className="h-8 w-8 cursor-pointer hover:bg-gray-100" />
          </span>
        </a>
        <div className="mt-10">
          <div className="bg-white p-6  md:mx-auto">
            <CheckCircle className="h-35 w-35 mx-auto my-6" />
            <div className="text-center">
              <h3 className="text-center text-base font-semibold text-gray-900 md:text-2xl">
                Payment Done!
              </h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;

"use client";

import Uploader from "@/components/video/uploader";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { useModal } from "@/components/modal/provider";

export default function UploadMediaModal({account} : {account: any}) {
  const modal = useModal();

  const closeModal = () => {
    modal?.hide();
  };

  return (
    <div
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Upload Media</h2>
        <Uploader account={account} />
        <button onClick={closeModal} className="absolute top-5 right-5">
          <CrossCircledIcon className="w-6 h-6 text-stone-500 dark:text-stone-400" />
        </button>
      </div>
   
    </div>
  );
}

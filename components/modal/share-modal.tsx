"use client";
// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { Share } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export default function ShareModal({ content }: { content: any }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const onSubmit = async (data: any) => {
    navigator.clipboard
      .writeText(data?.link)
      .then(() => {
        toast("Event link copied to clipboard");
      })
      .catch((error: any) => {
        console.error("Unable to copy sharable link!", error);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="link"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Share Link
          </label>
          <input
            type="text"
            id="link"
            value={content}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("link", { required: true, value: content })}
          />
        </div>
        <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
          <CreateSiteFormButton />
        </div>
      </form>
    </>
  );
}
function CreateSiteFormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? (
        <LoadingDots color="#808080" />
      ) : (
        <div className="flex items-center">
          <Share className="mx-2 h-5 w-5" />
          Share
        </div>
      )}
    </button>
  );
}

"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getAccount } from "@/lib/fetchers/client";
// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import { toast } from "sonner";

export default function AddToStaffModal({
  team,
  onClose,
}: {
  team: any;
  onClose: any;
}) {
  const { refresh } = useRouter();
  const modal = useModal();

  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();



  const onSubmit = async (data: any) => {

    // add the person to staff
    const { error } = await supabase.from("staff").insert([
      {
        team_id: team.id,
        person_id: data.person,
      },
    ]);
    if (error) {
      console.log("FORM ERRORS: ", error);
    } else {
      modal?.hide();
      toast.success("staff member added to team")
      onClose();
      refresh();
      
    }

  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Add to Staff</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="person"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Person
          </label>

          <input
            type="text"
            placeholder="Person ID"
            id="person"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("person")}
          />
          {errors.list && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <CreateStaffButton />
      </div>
    </form>
  );
}


function CreateStaffButton() {
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
      {pending ? <LoadingDots color="#808080" /> : <p>Add to Staff</p>}
    </button>
  );
}

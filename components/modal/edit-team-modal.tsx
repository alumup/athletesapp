"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import { Switch } from "@/components/ui/switch"; // Make sure you have this component

export default function EditTeamModal({ team }: { team?: any }) {
  const { refresh } = useRouter();
  const modal = useModal();

  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const isActive = watch("is_active");

  useEffect(() => {
    if (team) {
      setValue("name", team.name);
      setValue("coach", team.coach);
      setValue("is_active", team.is_active);
    } else {
      // Set default value for new teams
      setValue("is_active", true);
    }
  }, [team, setValue]);

  const onSubmit = async (data: any) => {
    const teamData = {
      name: data.name,
      coach: data.coach,
      is_active: data.is_active,
    };

    let error;
    if (team) {
      // Update existing team
      const { error: updateError } = await supabase
        .from("teams")
        .update(teamData)
        .eq("id", team.id);
      error = updateError;
    } 

    if (error) {
      console.log("FORM ERRORS: ", error);
    } else {
      modal?.hide();
      refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-96 rounded-md bg-white dark:bg-black md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="w-full relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">{team ? "Edit Team" : "New Team"}</h2>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("name", { required: true })}
          />
          {errors.name && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Active
          </label>
        </div>
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <EditTeamFormButton isEditing={!!team} />
      </div>
    </form>
  );
}

function EditTeamFormButton({ isEditing }: { isEditing: boolean }) {
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
      {pending ? <LoadingDots color="#808080" /> : <p>{isEditing ? "Update Team" : "Create Team"}</p>}
    </button>
  );
}

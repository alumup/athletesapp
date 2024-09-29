"use client";
import { formatDateOnly } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {  useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";

export default function EditPerson({ person }: { person: any; account: any }) {
  const supabase = createClient();


  console.log(person);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: person?.first_name || '',
      last_name: person?.last_name || '',
      email: person?.email || '',
      phone: person?.phone || '',
      birthdate: person?.birthdate ? formatDateOnly(person.birthdate) : '',
      grade: person?.grade || '',
      aau_number: person?.aau_number || '',
    },
  });

  const onSubmit = async (data: any) => {
    console.log("Submitting data:", data);
    console.log("Person ID:", person.id);

    try {
      const { error, data: updatedPerson } = await supabase
        .from("people")
        .update({
          name: `${data.first_name} ${data.last_name}`,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate === "" ? null : data.birthdate,
          grade: data.grade,
          aau_number: data.aau_number,
        })
        .eq("id", person.id)
        .select();

      console.log("Supabase response:", { error, updatedPerson });

      if (error) {
        console.error("Supabase error:", error);
        toast.error("There was an error updating the person");
      } else if (updatedPerson && updatedPerson.length > 0) {
        console.log("Updated person:", updatedPerson[0]);
        toast.success(`${data.first_name} updated`);
        reset(data);
      } else {
        console.log("No error, but no updated person returned");
        toast.error("Update may have been successful, but couldn't confirm");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative w-full p-1">
      <div className="relative flex flex-col space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col space-y-2">
            <label
              htmlFor="id"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              ID
            </label>
            <input
              type="text"
              id="id"
              value={person?.id || ''}
              disabled
              className="rounded-md border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
            />
          </div>
          <div className="col-span-1 flex flex-col space-y-2">
            <label
              htmlFor="first_name"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              defaultValue={person?.first_name}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("first_name", { required: true })}
            />
            {errors.first_name && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="col-span-1 flex flex-col space-y-2">
            <label
              htmlFor="last_name"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              defaultValue={person?.last_name}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("last_name", { required: true })}
            />
            {errors.last_name && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            defaultValue={person?.email}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Phone
          </label>
          <input
            type="text"
            id="phone"
            defaultValue={person?.phone}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("phone")}
          />
          {errors.phone && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="birthdate"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Birthdate
          </label>
          <input
            type="date"
            id="birthdate"
            defaultValue={
              person?.birthdate ? formatDateOnly(person?.birthdate) : ""
            }
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("birthdate")}
          />
          {errors.birthdate && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="aau_number"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            AAU Number
          </label>
          <input
            type="text"
            id="aau_number"
            defaultValue={person?.aau_number}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("aau_number", { required: person?.dependent })}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="grade"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Grade (1 thru 12)
          </label>
          <select
            id="grade"
            defaultValue={person?.grade}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("grade")}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
            <option value="Graduated">Graduated</option>
          </select>
          {errors.grade && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>
        <SubmitForm person={person} />
      </div>
    </form>
  );
}

function SubmitForm({ person }: { person: any }) {
  const { pending } = useFormStatus();
  
  return (
    <button
      title="Update person"
      aria-label="Update person"
      type="submit"
      className={cn(
        "flex w-full items-center justify-center space-x-2 rounded border px-3 py-4 text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
          : "border-black bg-black text-white hover:bg-white hover:text-black",
      )}
      disabled={pending}
    >
      {pending ? (
        <LoadingDots color="#808080" />
      ) : (
        <p>Update {person?.first_name}</p>
      )}
    </button>
  );
}

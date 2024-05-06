"use client";
import { formatDateOnly } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";

export default function EditPerson({ person }: { person: any; account: any }) {
  const supabase = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    // Update the person
    const { error } = await supabase
      .from("people")
      .update([
        {
          name: `${data.first_name} ${data.last_name}`,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate === "" ? null : data.birthdate,
          grade: data.grade,
          aau_number: data.aau_number,
        },
      ])
      .eq("id", person.id);

    if (error) {
      console.log("FORM ERRORS: ", error);
      return;
    }

    // Navigate to the person that was edited
    toast.success(`${person.first_name} updated`);
  };

  useEffect(() => {
    if (person.birthdate) {
      console.log(formatDateOnly(person.birthdate));
    }
  }, [person.birthdate]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative w-full p-1">
      <div className="relative flex flex-col space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
function SubmitForm({ person }: any) {
  const { pending } = useFormStatus();
  return (
    <button
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

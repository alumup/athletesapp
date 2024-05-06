"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useFieldArray, useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";

export default function CreateEventModal({
  account,
  team,
  event,
}: {
  account: any;
  team?: any;
  event?: any;
}) {
  const { refresh } = useRouter();
  const modal = useModal();

  const supabase = createClientComponentClient();
  const [fees, setFees] = useState<any>([]);

  useEffect(() => {
    const getFees = async () => {
      const { data } = await supabase
        .from("fees")
        .select("*")
        .eq("account_id", account?.id);

      console.log(data);
      setFees(data);
    };
    getFees();
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();


  const onSubmit = async (data: any) => {
    const { error } = await supabase.from("events").insert([
      {
        account_id: account?.id,
        name: data.name,
        description: data.description,
        team_id: team?.id || event?.teams.id,
        location: {
          name: data.location,
        },
        schedule: {
          start_date: data.start_date,
          end_date: data.end_date || null,
          start_time: data.start_time,
          end_time: data.end_time,
        },
        visibility: data.visibility,
        fees: data.fees || null,
        cover_image: data.cover_image || null,
        date: data.start_date,
        parent_id: event?.id,
      },
    ]);

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
      className="scrollable w-full rounded-md bg-white md:max-w-5xl md:border md:border-gray-300 md:shadow"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">New event</h2>
        <div className="grid grid-cols-2 gap-5">
          {event && (
            <div className="col-span-2 flex flex-col space-y-2">
              <label
                htmlFor="team"
                className="text-sm font-medium text-gray-700 dark:text-stone-300"
              >
                Parent Event
              </label>
              <input
                type="text"
                id="team"
                disabled
                value={event?.name}
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                {...register("team", { required: false, value: event?.id })}
              />
            </div>
          )}

          {team?.id || event?.id && (
            <div className="col-span-2 flex flex-col space-y-2">
              <label
                htmlFor="team"
                className="text-sm font-medium text-gray-700 dark:text-stone-300"
              >
                Team
              </label>
              <input
                type="text"
                id="team"
                disabled
                value={team?.name || event?.teams?.name}
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                {...register("team", { required: false, value: team?.id || event?.teams.id })}
              />
            </div>
          )}

          <div className="col-span-2 flex flex-col space-y-2">
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
          </div>

          <div className="col-span-2 flex flex-col space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Description
            </label>
            <input
              type="text"
              id="description"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("description", { required: true })}
            />
          </div>


          <div className="flex flex-col space-y-2">
            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("location", { required: true })}
            />
          </div>
          {/* <div className="flex flex-col space-y-2">
            <label
              htmlFor="cover_image"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Cover Image
            </label>
            <input
              type="text"
              id="cover_image"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("cover_image", { required: false })}
            />
          </div> */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="start_date"
                className="text-sm font-medium text-gray-700 dark:text-stone-300"
              >
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                {...register("start_date", { required: true })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="end_date"
                className="text-sm font-medium text-gray-700 dark:text-stone-300"
              >
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                {...register("end_date", { required: true })}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="fees"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Fees
            </label>
            <select
              id="fees"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("fees", { required: true })}
            >
              {fees.map((fee: any) => {
                return (
                  <option
                    key={fee.id + Math.random()}
                    value={fee.id}
                  >{`${fee.name} - $${fee.amount}`}</option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="visibility"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Visibility
            </label>
            <select
              id="visibility"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("visibility", { required: true })}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label
              htmlFor={`start_time`}
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Start Time:
            </label>
            <input
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              type="time"
              id={`start_time`}
              {...register(`start_time`)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label
              htmlFor={`end_time`}
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              End Time:
            </label>
            <input
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              type="time"
              id={`end_time`}
              {...register(`end_time`)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <CreateSiteFormButton />
      </div>
    </form>
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
      {pending ? <LoadingDots color="#808080" /> : <p>Create Event</p>}
    </button>
  );
}

"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from 'react-hook-form';
import { useRouter } from "next/navigation";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";


interface List {
  id: number;
  name: string;
}


export default function AddToListModal({people} : {people: any}) {


  const {refresh}= useRouter();
  const modal = useModal();

  const supabase = createClientComponentClient();

  const { register, handleSubmit, formState: { errors } } = useForm();


  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    async function fetchLists() {
      const { data: lists, error } = await supabase
        .from('lists')
        .select('*')
      if (error) {
        console.log("ERROR: ", error)
      } else {
        setLists(lists)
      }
    }
    fetchLists()
  }, [])


  const onSubmit = async (data: any) => {
    console.log("LIST DATA: ", data)
    console.log("PEOPLE: ", people)

    // add every person to the list
    people.forEach(async (person: any) => {
      const { error } = await supabase
        .from('list_people')
        .insert([
         {
            list_id: data.list,
            person_id: person.id,
         }
        ])
      if (error) {
        console.log("FORM ERRORS: ", error)
      } else {
        modal?.hide();
        refresh()
      }
    })
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Add to List</h2>


       {/* Add a select that searches for lists and adds the person to the list */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="list" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            List
          </label>
          <select
            id="list"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("list")}
          >
            {lists.map((list: any) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
          {errors.list && <span className="text-sm text-red-500">This field is required</span>}
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
      {pending ? <LoadingDots color="#808080" /> : <p>Add to List</p>}
    </button>
  );
}

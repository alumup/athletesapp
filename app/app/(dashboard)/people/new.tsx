"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm, useFieldArray } from 'react-hook-form';

// @ts-expect-error
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "@/components/modal/provider";

import { toast } from "sonner";


export default function NewPerson({ account }: { account: any }) {


  const supabase = createClientComponentClient();
  const [tags, setTags] = useState<any>([])
  const [submitting, setSubmitting] = useState<any>(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const modal = useModal()
  const handleTagSelect = (event: any) => {
    const selectedTag = event.target.value;
    setSelectedTags(prevTags => [...prevTags, selectedTag]);
  };

  const handleTagDelete = (tagToDelete: string) => {
    setSelectedTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
  };


  const { register, control, handleSubmit, formState: { errors } } = useForm();
  const { fields, append } = useFieldArray({
    control,
    name: "relationships"
  });

  useEffect(() => {
    const getTags = async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('name')
        .eq('account_id', account.id)

      if (error) {
        console.log("getTags", error)
      }

      if (data) {
        console.log(data)
        setTags(data)
      }
    }

    getTags()
  }, [])


  const onSubmit = async (data: any) => {
    // Create a new person
    setSubmitting(true)
    const { data: newPerson, error: newPersonError } = await supabase
      .from('people')
      .insert([
        {
          account_id: account.id,
          name: data.name,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate === '' ? null : data.birthdate,
          grade: data.grade,
          tags: selectedTags,
        }
      ])
      .select('id')
      .single();

    if (newPersonError) {
      console.log("FORM ERRORS: ", newPersonError);
      return;
    }


    // Add guardians to the new person
    for (const relationship of data.relationships) {
      const { error: addRelationshipError } = await supabase
        .from('relationships')
        .insert([
          {
            person_id: newPerson.id,
            relation_id: relationship.id,
            name: relationship.name,
            primary: relationship.primary,
          }
        ]);

      if (addRelationshipError) {
        console.log("Failed to add relationship: ", addRelationshipError);
      }
    }
    setSubmitting(false)
    modal?.hide()
    toast.success(`Successfully Created Person!`);

  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full"
    >
      <div className="relative flex flex-col space-y-4 p-1">
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:outline-none focus:border-stone-300"
            {...register("name", { required: true })}
          />
          {errors.name && <span className="text-sm text-red-500">This field is required</span>}
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex flex-col space-y-2">
            <label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-stone-300">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
              {...register("first_name", { required: true })}
            />
            {errors.first_name && <span className="text-sm text-red-500">This field is required</span>}
          </div>

          <div className="col-span-1 flex flex-col space-y-2">
            <label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-stone-300">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
              {...register("last_name", { required: true })}
            />
            {errors.last_name && <span className="text-sm text-red-500">This field is required</span>}
          </div>

        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("email", { required: true })}
          />
          {errors.email && <span className="text-sm text-red-500">This field is required</span>}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("phone")}
          />
          {errors.phone && <span className="text-sm text-red-500">This field is required</span>}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="birthdate" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Birthdate
          </label>
          <input
            type="date"
            id="birthdate"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("birthdate")}
          />
          {errors.birthdate && <span className="text-sm text-red-500">This field is required</span>}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="grade" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Grade (1 thru 12)
          </label>
          <select
            id="grade"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("grade")}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
            <option value="Graduated">Graduated</option>
          </select>
          {errors.grade && <span className="text-sm text-red-500">This field is required</span>}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Tags
          </label>

          <div>
            {selectedTags.map((tag, index) => (
              <span key={index} onClick={() => handleTagDelete(tag)} className="cursor-pointer hover:bg-red-500 mr-1 px-3 py-1 text-sm rounded bg-green-500 text-white">
                {tag}
              </span>
            ))}
          </div>


          <select
            onChange={handleTagSelect}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"

          >
            {tags && tags.map((tag: any, index: any) => (
              <option key={index} value={tag.name}>{tag.name}</option>
            ))}
          </select>

        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="relationships" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Relationships
          </label>

          {fields.map((field, index) => (
            <div className="w-full flex flex-col mt-2">
              <select
                id="name"
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
                {...register(`relationships.${index}.name`, { required: true })}
              >
                <option value="Parent">Parent</option>
                <option value="Guardian">Guardian</option>
              </select>
              <input
                key={field.id}
                placeholder="Relationship ID"
                {...register(`relationships.${index}.id`, { required: true })}
                className="mt-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"

                defaultValue={field.id} // make sure to set up defaultValue
              />
              <label>
                <input
                  type="checkbox"
                  {...register(`relationships.${index}.primary`)}
                />
                Primary Contact
              </label>
            </div>
          ))}
          <button
            type="button"
            className="infline-flex text-xs rounded border border-zinc-900 border-zinc-900 px-2 py-2"
            onClick={() => append({ id: "" })}
          >
            Add New Relationship
          </button>
        </div>

      </div>
      <div className="mt-10 flex items-center justify-center rounded-b-lg border-t border-stone-200 bg-stone-50">
        <button
          className={cn(
            "h-10 w-full flex items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
            submitting
              ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
              : "border-black bg-black text-white hover:bg-white hover:text-black",
          )}
          disabled={submitting}
        >
          {submitting ? <LoadingDots color="#808080" /> : <p>Create Person</p>}
        </button>
      </div>
    </form>
  );
}


"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from "next/navigation";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import { fullName } from "@/lib/utils";


export default function EditPersonModal({person, account} : {person: any, account: any}) {
  const {refresh}= useRouter();
  const modal = useModal();
  const supabase = createClientComponentClient();

  const [tags, setTags] = useState<any>([])
  const [selectedTags, setSelectedTags] = useState([]);
  const [relationships, setRelationships] = useState()

  const handleTagSelect = (event: any) => {
    const selectedTag = event.target.value;
    console.log(selectedTag)
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

  const removeRelationship = async (relationshipId: string) => {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', relationshipId);
  
    if (error) {
      console.log("Failed to remove relationship: ", error);
    }
  };

  const onSubmit = async (data: any) => {
    // Update the person
    const { error } = await supabase
      .from('people')
      .update([
        {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate,
          grade: data.grade,
          tags: selectedTags,
        }
      ])
      .eq('id', person.id);
  
    if (error) {
      console.log("FORM ERRORS: ", error);
      return;
    }
  
    // Update the guardians of the person
    for (const relation of data.relationships) {
      const { error: updateRelationshipError } = await supabase
        .from('relationships')
        .upsert([
          {
            person_id: person.id,
            relation_id: relation.id,
          }
        ]);
  
      if (updateRelationshipError) {
        console.log("Failed to update relationship: ", updateRelationshipError);
      }
    }
  
    modal?.hide();
    refresh();
  };

  useEffect(() => {
    const getTags = async () => {
      const {data, error} = await supabase
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

    const getRelationships = async () => {
      const {data: relationships, error: relationshipErrors} =  await supabase
        .from('relationships')
        .select("*,from:person_id(*),to:relation_id(*)")
        .eq('person_id', person.id)
      
        if (relationshipErrors) {
          console.log("RELATIONSHIP ERRORS", relationshipErrors)
        }

        if (relationships) {
          console.log("RRR", relationships)
          setRelationships(relationships)
        }
    }

    getTags()
    getRelationships()
  }, [])

  useEffect(() => {
    const getSelectedTags = async () =>{
      const {data} = await supabase
        .from('people')
        .select('tags')
        .eq('id', person.id)

      if (data) {
        console.log("TAGZZZZ", data[0].tags)
        const tagNames = data[0].tags || [];
        setSelectedTags(tagNames);
      }
    }

    getSelectedTags()
  },[])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Edit {fullName(person)}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 flex flex-col space-y-2">
            <label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-stone-300">
              First Name*
            </label>
            <input
              type="text"
              id="first_name"
              defaultValue={person?.first_name}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
              {...register("first_name", { required: true })}
            />
            {errors.first_name && <span className="text-sm text-red-500">This field is required</span>}
          </div>

          <div className="col-span-1 flex flex-col space-y-2">
            <label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-stone-300">
              Last Name*
            </label>
            <input
              type="text"
              id="last_name"
              defaultValue={person?.last_name}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
              {...register("last_name", { required: true })}
            />
            {errors.last_name && <span className="text-sm text-red-500">This field is required</span>}
          </div>

        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-stone-300">
           Email*
          </label>
          <input
            type="email"
            id="email"
            defaultValue={person?.email}
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
            defaultValue={person?.phone}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("phone", { required: true })}
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
            defaultValue={person?.birthdate}
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
            defaultValue={person?.grade}
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
            {selectedTags?.map((tag, index) => (
              <span key={index} onClick={() => handleTagDelete(tag)} className="cursor-pointer hover:bg-red-500 mr-1 px-3 py-1 text-sm rounded bg-green-500 text-white">
                {tag}
              </span>
            ))}
          </div>

          <select 
            onChange={handleTagSelect} 
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
          >
            {tags && tags?.map((tag: any, index: any) => (
              <option key={index} value={tag.name}>{tag.name}</option>
            ))}
          </select>
         
        </div>


        <div className="flex flex-col space-y-2">
          <label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Relationships
          </label>

          {relationships?.map((relationship: any, i: any) => (
            <div key={i} className="rounded text-sm border border-stone-200 px-3 py-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-1">
                  <span className="">{relationship.to?.first_name}</span>
                  <span className="">{relationship.to?.last_name}</span>
                </div>
                <div>
                  <button onClick={() => removeRelationship(relationship.id)}>X</button>
                </div>
              </div>
            </div>
          ))}

          {fields.map((field, index) => (
            <input
              key={field.id}
              placeholder="Relationship ID"
              {...register(`relationships.${index}.id`, { required: true })}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"

              defaultValue={field.id} // make sure to set up defaultValue
            />
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
      {pending ? <LoadingDots color="#808080" /> : <p>Update Person</p>}
    </button>
  );
}

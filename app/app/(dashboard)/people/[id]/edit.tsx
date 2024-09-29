"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm, useFieldArray } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formatDate = (dateString: any) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0 based index
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export default function EditPerson({
  person,
  account,
}: {
  person: any;
  account: any;
}) {
  const supabase = createClient();

  const [tags, setTags] = useState<any>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [relationships, setRelationships] = useState<any>();

  const handleTagSelect = (event: any) => {
    const selectedTag = event.target.value;
    console.log(selectedTag);
    setSelectedTags((prevTags) => [...prevTags, selectedTag]);
  };

  const handleTagDelete = (tagToDelete: string) => {
    setSelectedTags((prevTags) =>
      prevTags.filter((tag) => tag !== tagToDelete),
    );
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { fields, append } = useFieldArray({
    control,
    name: "relationships",
  });

  const removeRelationship = async (relationshipId: string) => {
    const { error } = await supabase
      .from("relationships")
      .delete()
      .eq("id", relationshipId);

    if (error) {
      console.log("Failed to remove relationship: ", error);
    }
  };

  const onSubmit = async (data: any) => {
    console.log("onSubmit function called with data:", data);
    console.log("Submitting data:", data);
    
    const { error, data: updatedPerson } = await supabase
      .from("people")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone,
        birthdate: data.birthdate === "" ? null : data.birthdate,
        grade: data.grade,
        aau_number: data.aau_number,
        // Add any other fields you want to update
      })
      .eq("id", person.id)
      .select();

    if (error) {
      console.error("Error updating person:", error);
      toast.error("There was an error updating the person");
    } else if (updatedPerson) {
      console.log("Updated person:", updatedPerson);
      toast.success(`${data.first_name} updated`);
      
      // Update tags
      if (selectedTags && selectedTags.length > 0) {
        const { error: tagError } = await supabase
          .from("person_tags")
          .upsert(
            selectedTags.map(tag => ({
              person_id: person.id,
              tag_name: tag
            })),
            { onConflict: 'person_id,tag_name' }
          );
        
        if (tagError) {
          console.error("Error updating tags:", tagError);
          toast.error("There was an error updating tags");
        }
      }

      // Update relationships
      if (data.relationships && data.relationships.length > 0) {
        const { error: relationshipError } = await supabase
          .from("relationships")
          .upsert(
            data.relationships.map((rel: any) => ({
              from_id: person.id,
              to_id: rel.id,
              relationship_type: rel.name,
              is_primary: rel.primary
            })),
            { onConflict: 'from_id,to_id' }
          );
        
        if (relationshipError) {
          toast.error("There was an error updating relationships");
        }
      }
    }
  };

  useEffect(() => {
    const getTags = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("name")
        .eq("account_id", account.id);

      if (error) {
        console.log("getTags", error);
      }

      if (data) {
        console.log(data);
        setTags(data);
      }
    };

    const getRelationships = async () => {
      const { data: relationships, error: relationshipErrors } = await supabase
        .from("relationships")
        .select("*,from:person_id(*),to:relation_id(*)")
        .eq("person_id", person.id);

      if (relationshipErrors) {
        console.log("RELATIONSHIP ERRORS", relationshipErrors);
      }

      if (relationships) {
        setRelationships(relationships);
      }
    };

    getTags();
    getRelationships();
  }, [account.id, person.id, supabase]);

  useEffect(() => {
    const getSelectedTags = async () => {
      const { data } = await supabase
        .from("people")
        .select("tags")
        .eq("id", person.id);

      if (data) {
        const tagNames = data[0].tags || [];
        setSelectedTags(tagNames);
      }
    };

    getSelectedTags();
  }, [person.id, supabase]);

  return (
    <form className="relative flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-1">
        <div className="flex flex-col space-y-4">
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
                Last Name*
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
              Email*
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
              defaultValue={person?.birthdate ? formatDate(person.birthdate) : ""}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("birthdate")}
            />
            {errors.birthdate && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
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

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="tagSelect"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Select Tag
            </label>

            <div>
              {selectedTags?.map((tag, index) => (
                <span
                  key={index}
                  onClick={() => handleTagDelete(tag)}
                  className="mr-1 cursor-pointer rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-red-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            <select
              id="tagSelect"
              onChange={handleTagSelect}
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            >
              {tags &&
                tags?.map((tag: any, index: any) => (
                  <option key={index} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="tags"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Relationships
            </label>

            {relationships?.map((relationship: any, i: any) => (
              <div
                key={i}
                className="rounded border border-stone-200 px-3 py-2 text-sm"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <span className="">{relationship.to?.first_name}</span>
                    <span className="">{relationship.to?.last_name}</span>
                  </div>
                  <div>
                    <button onClick={() => removeRelationship(relationship.id)}>
                      X
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {fields.map((field, index) => (
              <div key={field.id} className="mt-2 flex w-full flex-col">
                <select
                  id={`relationship-name-${index}`}
                  className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                  {...register(`relationships.${index}.name`, { required: true })}
                >
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                </select>
                <input
                  placeholder="Relationship ID"
                  {...register(`relationships.${index}.id`, { required: true })}
                  className="mt-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
                  defaultValue={field.id}
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
              className="inline-flex rounded border border-zinc-900 px-2 py-2 text-xs"
              onClick={() => append({ id: "" })}
            >
              Add New Relationship
            </button>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 left-0 right-0 mt-4 py-4 border-t border-stone-200 dark:border-stone-700">
        <button
          type="button"
          onClick={handleSubmit((data) => {
            console.log("Form submitted", data);
            onSubmit(data);
          })}
          className={cn(
            "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
            "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
          )}
        >
          <p>Update Person</p>
        </button>
      </div>
    </form>
  );
}
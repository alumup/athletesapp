"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";

// import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export default function NewPerson({ account }: { account: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [tags, setTags] = useState<any>([]);
  const [submitting, setSubmitting] = useState<any>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagSelect = (event: any) => {
    const selectedTag = event.target.value;
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

    getTags();
  }, [account.id, supabase]);

  const onSubmit = async (data: any) => {
    // Create a new person
    setSubmitting(true);

    // Continue with creating a new person if email doesn't exist
    const { data: newPerson, error: newPersonError } = await supabase
      .from("people")
      .insert([
        {
          account_id: account.id,
          name: `${data.first_name} ${data.last_name}`,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate === "" ? null : data.birthdate,
          grade: data.grade,
          tags: selectedTags,
          dependent: data.dependent,
        },
      ])
      .select("id")
      .single();

    if (newPersonError) {
      console.log("FORM ERRORS: ", newPersonError);
      return;
    }

    // Add guardians to the new person
    for (const relationship of data.relationships) {
      const { error: addRelationshipError } = await supabase
        .from("relationships")
        .insert([
          {
            person_id: newPerson.id,
            relation_id: relationship.id,
            name: relationship.name,
            primary: relationship.primary,
          },
        ]);

      if (addRelationshipError) {
        console.log("Failed to add relationship: ", addRelationshipError);
      }
    }
    setSubmitting(false);
    toast.success(`Successfully Created Person!`);
    router.push(`/people/${newPerson.id}`);
  };

  return (
    <form 
      id="create-person-form"
      onSubmit={handleSubmit(onSubmit)} 
      className="flex h-full flex-col"
    >
      <div className="relative flex flex-col space-y-4 p-1">
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
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
            {...register("email", { 
              required: true,
              setValueAs: v => v.toLowerCase()
            })}
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
            htmlFor="tags"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Tags
          </label>

          <div>
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                onClick={() => handleTagDelete(tag)}
                className="mr-1 cursor-pointer rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-red-500"
              >
                {tag}
              </span>
            ))}
          </div>

          <label
            htmlFor="tagSelect"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Select Tag
          </label>
          <select
            id="tagSelect"
            onChange={handleTagSelect}
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
          >
            {tags &&
              tags.map((tag: any, index: any) => (
                <option key={index} value={tag.name}>
                  {tag.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-stone-300"
          >
            Dependent
          </label>
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="dependent"
              className="rounded-md border border-stone-200 bg-stone-50 px-2 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("dependent")}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-stone-300">
              True
            </span>
          </div>
          {errors.dependent && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label
            htmlFor="relationships"
            className="text-sm font-bold text-gray-700 dark:text-stone-300"
          >
            Relationships
          </label>
          {fields.map((field, index) => (
            <div key={field.id} className="mt-2 flex w-full flex-col">
              <label
                htmlFor={`relationship-name-${index}`}
                className="text-sm font-medium text-gray-700 dark:text-stone-300"
              >
                Relationship Type
              </label>
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
              <label className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  {...register(`relationships.${index}.primary`)}
                  className="mr-2"
                />
                Primary Contact
              </label>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center justify-center border rounded-md !bg-[#000000] px-2 py-2 text-xs text-white"
            onClick={() => append({ id: "" })}
          >
            Add Relationship <PlusIcon className="ml-1 w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="mt-10 flex items-center justify-center rounded-b-lg border-t border-stone-200 bg-stone-50">
        <button
          title="Create person"
          aria-label="Create person"
          type="submit"
          className={cn(
            "flex h-10 w-full items-center justify-center space-x-2 rounded-md border !bg-[#000000] text-sm text-white transition-all focus:outline-none",
            submitting
              ? "cursor-not-allowed"
              : "cursor-pointer",
          )}
          disabled={submitting}
        >
          {submitting ? <LoadingDots color="#808080" /> : <span>Create Person</span>}
        </button>
      </div>
    </form>
  );
}
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import { fullName } from "@/lib/utils";

interface FormValues {
  first_name: string
  last_name: string
  email: string
  phone: string
  birthdate: string
  grade: string
  aau_number: string
  relationships: {
    id: string
    name: string
    primary: boolean
  }[]
}

const formatDate = (dateString: any) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are 0 based index
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export default function EditPersonModal({
  person,
  account,
}: {
  person: any;
  account: any;
}) {
  const { refresh } = useRouter();
  const modal = useModal();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState<any>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    defaultValues: {
      first_name: person?.first_name || "",
      last_name: person?.last_name || "",
      email: person?.email || "",
      phone: person?.phone || "",
      birthdate: person?.birthdate ? formatDate(person.birthdate) : "",
      grade: person?.grade || "",
      aau_number: person?.aau_number || "",
      relationships: person?.relationships || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "relationships"
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

  useEffect(() => {
    const getSelectedTags = async () => {
      const { data } = await supabase
        .from("people")
        .select("tags")
        .eq("id", person.id);

      if (data) {
        console.log("TAGZZZZ", data[0].tags);
        const tagNames = data[0].tags || [];
        setSelectedTags(tagNames);
      }
    };

    getSelectedTags();
  }, [person.id, supabase]);


  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

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
          tags: selectedTags,
        },
      ])
      .eq("id", person.id);

    if (error) {
      console.log("FORM ERRORS: ", error);
      return;
    }

    // Update the guardians of the person
    for (const relation of data.relationships) {
      const { error: updateRelationshipError } = await supabase
        .from("relationships")
        .upsert([
          {
            person_id: person.id,
            relation_id: relation.id,
            name: relation.name,
            primary: relation.primary,
          },
        ]);

      if (updateRelationshipError) {
        console.log("Failed to update relationship: ", updateRelationshipError);
      }
    }

    modal?.hide();
    refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Edit {person?.name || fullName(person)}
        </h2>
        <div className="max-h-[500px] overflow-y-auto">
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
              <span className="text-sm text-red-500">
                This field is required
              </span>
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
              <span className="text-sm text-red-500">
                This field is required
              </span>
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
                person?.birthdate ? formatDate(person.birthdate) : ""
              }
              className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 focus:border-stone-300 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:focus:border-stone-300"
              {...register("birthdate")}
            />
            {errors.birthdate && (
              <span className="text-sm text-red-500">
                This field is required
              </span>
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
              <span className="text-sm text-red-500">
                This field is required
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="tagSelect"
              className="text-sm font-medium text-gray-700 dark:text-stone-300"
            >
              Tags
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

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded border border-stone-200 px-3 py-2 text-sm"
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <input
                      {...register(`relationships.${index}.name`)}
                      className="border-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register(`relationships.${index}.primary`)}
                    />
                    <button type="button" onClick={() => remove(index)}>
                      X
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="inline-flex rounded border border-zinc-900 px-2 py-2 text-xs"
              onClick={() => append({ id: "", name: "", primary: false })}
            >
              Add New Relationship
            </button>
          </div>
        </div>
      </div>

      <CreateSiteFormButton />
    </form>
  );
}
function CreateSiteFormButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 p-3 md:bg-stone-50  md:px-10">
      <button
        title="Update person"
        aria-label="Update person"
        type="submit"
        className={cn(
          "fixed inset-x-0 bottom-0 flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none md:relative",
          pending
            ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
        )}
        disabled={pending}
      >
        {pending ? <LoadingDots color="#808080" /> : <p>Update Person</p>}
      </button>
    </div>
  );
}
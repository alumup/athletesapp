"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateRegModal({ event }) {
  const [currentPerson, setCurrentPerson] = useState(0);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registrationType: "child",
      numberOfKids: 1,
      people: [
        {
          name: null,
          first_name: null,
          last_name: null,
          gender: null,
          email: null,
          grade: null,
          birthdate: null,
        },
      ],
      self: {
        name: null,
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        grade: null,
        birthdate: null,
      },
    },
  });
  const registrationType = watch("registrationType");
  const numberOfKids = watch("numberOfKids");
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Disable body scroll when modal opens
    document.body.style.overflow = "hidden";

    // Enable body scroll when modal closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onSubmit = async (data) => {
    const people = data.people
      .filter((person) => person.first_name && person.last_name)
      .map((person) => ({
        ...person,
        email: data.self.email,
        phone: data.self.phone,
        dependent: registrationType === "child",
      }));

    // Insert the self person and the child people into the 'people' table
    const { data: savedPeople, error: peopleError } = await supabase
      .from("people")
      .insert([
        ...people.map((person) => ({
          ...person,
          name: `${person.first_name} ${person.last_name}`,
          account_id: "0b2390b7-8da9-44c8-b55e-38d5a29115f2",
        })),
        {
          ...data.self,
          name: `${data.self.first_name} ${data.self.last_name}`,
          account_id: "0b2390b7-8da9-44c8-b55e-38d5a29115f2",
        },
      ])
      .select("*");

    if (peopleError) {
      console.error(peopleError);
      return;
    }

    // Get the id of the self person
    const selfPerson = savedPeople.find((person) => !person.dependent);
    if (!selfPerson) {
      console.error("Self person not found in saved people");
      return;
    }
    const selfId = selfPerson.id;

    // Get the ids of the people who should be considered a child of the person registering
    const childPeopleIds = savedPeople
      .filter((person) => person.dependent)
      .map((person) => person.id);

    // Insert the relationships into the 'relationships' table
    const relationships = childPeopleIds.map((id) => ({
      name: "Parent",
      primary: true,
      person_id: selfId,
      relation_id: id,
    }));

    const { data: savedRelationships, error: relationshipsError } =
      await supabase.from("relationships").insert(relationships);

    if (relationshipsError) {
      console.error(relationshipsError);
      return;
    }

    let participants = savedPeople
      .filter((person) => person.dependent || registrationType === "self")
      .map((person) => ({
        person_id: person.id,
        event_id: event?.id,
      }));

    const { data: savedParticipants, error: participantsError } = await supabase
      .from("participants")
      .insert(participants);

    if (participantsError) {
      console.error(participantsError);
      return;
    }

    setSuccess(true);
    console.log(
      "Saved successfully!",
      savedPeople,
      savedRelationships,
      savedParticipants,
    );
  };
  return (
    <div
      key="modal"
      className="relative h-[calc(100vh-200px)] w-full max-w-lg overflow-y-scroll rounded border border-gray-50 bg-white px-5 pb-0 pt-10 shadow-sm md:h-full md:max-h-[700px]"
    >
      <h1 className="text-2xl font-bold">Register</h1>
      {!success && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 className="mt-5 text-lg">What's your name?</h1>
          <div className="mt-3">
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-2 gap-5">
                <div className="mt-1 flex flex-col">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    className="rounded border border-gray-300 px-3 py-2"
                    {...register(`self.first_name`, { required: true })}
                    placeholder="First Name"
                  />
                  {errors.first_name && (
                    <span className="text-sm text-red-500">
                      This field is required
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-col">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    className="rounded border border-gray-300 px-3 py-2"
                    {...register(`self.last_name`, { required: true })}
                    placeholder="Last Name"
                  />
                  {errors.last_name && (
                    <span className="text-sm text-red-500">
                      This field is required
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-1 flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  className="rounded border border-gray-300 px-3 py-2"
                  {...register(`self.email`, { required: true })}
                  placeholder="Email"
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col">
                <label htmlFor="phone">Phone</label>
                <input
                  className="rounded border border-gray-300 px-3 py-2"
                  {...register(`self.phone`, { required: true })}
                  placeholder="Phone"
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col space-y-2">
            <label className="text-lg">
              Are you registering for yourself or your child?
            </label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              {...register("registrationType")}
            >
              <option value="self">Myself</option>
              <option value="child">Child</option>
            </select>
          </div>

          {registrationType === "child" && (
            <div className="mt-5">
              <label className="text-lg">
                How many kids are you registering for?
              </label>
              <input
                type="number"
                className="w-full rounded border border-gray-300 px-3 py-2"
                {...register("numberOfKids")}
                placeholder="Add Number"
              />
            </div>
          )}

          {registrationType === "self" && (
            <div className=" mt-3">
              <div className="flex flex-col space-y-2">
                <div className="mt-1 flex flex-col">
                  <label htmlFor="Grade">Grade</label>
                  <input
                    className="rounded border border-gray-300 px-3 py-2"
                    type="number"
                    {...register(`self.grade`, { required: true })}
                    placeholder="Grade (number)"
                  />
                  {errors.grade && (
                    <span className="text-sm text-red-500">
                      This field is required
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-col">
                  <label htmlFor="birthdate">Birthdate</label>
                  <input
                    type="date"
                    className="rounded border border-gray-300 px-3 py-2"
                    {...register(`self.birthdate`, { required: true })}
                    placeholder="Birthdate"
                  />
                  {errors.birthdate && (
                    <span className="text-sm text-red-500">
                      This field is required
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {registrationType === "child" &&
            numberOfKids > 0 &&
            Array.from({ length: numberOfKids }).map(
              (_, index) =>
                currentPerson === index && (
                  <>
                    <div
                      key={index}
                      className="mt-3 rounded border border-gray-300 p-2"
                    >
                      <h3>Person {index + 1}</h3>
                      <div className="flex flex-col space-y-2">
                        <div className="grid grid-cols-2 gap-5">
                          <div className="mt-1 flex flex-col">
                            <label htmlFor="first_name">First Name</label>
                            <input
                              className="rounded border border-gray-300 px-3 py-2"
                              {...register(`people[${index}].first_name`, {
                                required: true,
                              })}
                              placeholder="First Name"
                            />
                            {errors.first_name && (
                              <span className="text-sm text-red-500">
                                This field is required
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-col">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                              className="rounded border border-gray-300 px-3 py-2"
                              {...register(`people[${index}].last_name`, {
                                required: true,
                              })}
                              placeholder="Last Name"
                            />
                            {errors.last_name && (
                              <span className="text-sm text-red-500">
                                This field is required
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-1 flex flex-col">
                          <label htmlFor="grade">Grade</label>
                          <input
                            className="rounded border border-gray-300 px-3 py-2"
                            type="number"
                            {...register(`people[${index}].grade`, {
                              required: true,
                            })}
                            placeholder="Grade (number)"
                          />
                          {errors.grade && (
                            <span className="text-sm text-red-500">
                              This field is required
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-col">
                          <label htmlFor="birthdate">Birthdate</label>
                          <input
                            type="date"
                            className="rounded border border-gray-300 px-3 py-2"
                            {...register(`people[${index}].birthdate`, {
                              required: true,
                            })}
                            placeholder="Birthdate"
                          />
                          {errors.birthdate && (
                            <span className="text-sm text-red-500">
                              This field is required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pb-5">
                      <button
                        onClick={() => setCurrentPerson(currentPerson - 1)}
                        disabled={currentPerson === 0}
                        className={`${
                          currentPerson === 0 ? "invisible" : "text-zinc-900"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPerson(currentPerson + 1)}
                        disabled={currentPerson === numberOfKids - 1}
                        className={`${
                          currentPerson === numberOfKids - 1
                            ? "invisible"
                            : "rounded bg-green-400 px-4 py-1 text-zinc-900"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ),
            )}
          <div className="sticky inset-x-0 bottom-0 top-0 border-t border-gray-300 bg-white p-3">
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded bg-zinc-900 px-5 py-3 text-zinc-50"
              >
                Register
              </button>
            </div>
          </div>
        </form>
      )}

      {success && (
        <div className="p-5">
          <h1 className="font-bolt text-lg">You're Registered!</h1>
          <p className="mt-5 font-light">
            Thank you for registering for {event.name}! We will see you on{" "}
            {event.schedule?.start_date} at {event.location?.name}.
          </p>
        </div>
      )}
    </div>
  );
}

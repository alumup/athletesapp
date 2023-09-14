import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useForm, useFieldArray } from 'react-hook-form';
import { useFormData } from "@/providers/form-provider";
import { motion, AnimatePresence } from "framer-motion";
import BackBtn from "@/components/dynamic-form/buttons/back-btn";
import NextBtn from "@/components/dynamic-form/buttons/next-btn";

import {
  BookmarkIcon as Ticket
} from '@radix-ui/react-icons'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

const defaultPerson = { name: "", email: "", phone: "" };

export const Person = ({ initialValues={}, formIndex, formStep, setFormStep, isFirstStep, isLastStep }) => {
  const { formData, setFormValues, event } = useFormData();
  const supabase = createClientComponentClient();
  
  const [current, setCurrent] = useState(0);
  const [person, setPerson] = useState([]);
  const [personCount, setPersonCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const defaultPerson = { name: "", email: "", phone: "" };
  
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { 
      ...initialValues,
      people: [defaultPerson] // Set default person
    },
    mode: "onChange",
  });

  const { fields, append } = useFieldArray({
    control,
    name: "people",
  });






  const savePerson = async (person) => {

    // const { data: existingPerson, error: existingPersonError } = await supabase
    //   .from('people')
    //   .select('*')
    //   .eq('email', person.email)
    //   .maybeSingle();

    // if (existingPersonError) console.log(existingPersonError);
    
    // if (existingPerson) {
    //   console.log(`Person with email ${person.email} already exists in the database.`);
    //   return;
    // }

    // const { data: newPerson, error: insertError } = await supabase
    //   .from('people')
    //   .insert({account_id: 'iiii',  ...person})
    //   .select('*')
    //   .single();

    // if (insertError) console.log(insertError);
    
    // if (newPerson) {
    //  const { data: ticket, error: ticketError } = await supabase
    //     .from('people')
    //     .insert({account_id: 'iiii'})
    //     .select('*')
    //     .single();

    //   if (ticketError) console.log(ticketError);

      
      
    // }

    console.log("PERSON", person)
  }

  const nextPerson = () => {
    setLoading(true);
    const currentPerson = getValues().people[current];
  
    if (Object.values(currentPerson).every(Boolean)) {
      savePerson(currentPerson).then(() => {
        setCurrent(current + 1);
        setLoading(false);
      });
    } else {
      Object.keys(currentPerson).forEach((key) => {
        if (!currentPerson[key]) {
          setError(`people.${current}.${key}`, {
            type: "manual",
            message: "This field is required",
          });
        }
      });
      setLoading(false);
    }
  };
  
  const onSubmit = (values) => {
    setLoading(true);
    setFormValues(values, formIndex);

    savePerson(values.people[current]).then(() => {
      setFormStep(formStep + 1);
      setLoading(false);
    });
  };
  
  return (
    <div className="w-full h-auto">
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-xl md:text-2xl leading-6 text-gray-700">Person</p>
          <p className="text-sm md:text-base leading-6 text-gray-500 mb-5 font-light">
            You can buy up to 4 tickets. We will assign the tickets you buy together as a group in our 4-man scramble.
          </p>
          <div className="border border-gray-200 p-3 rounded">

            <AnimatePresence mode="wait">
              <motion.div 
                key={current}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                {fields[current] && (
                  <div className="flex flex-col w-full my-3">
                    <div className="mt-3 flex flex-col w-full">
                      <label htmlFor={`people.${current}.name`} className="text-xs">Name</label>
                      <input
                        {...register(`people.${current}.name`, {required: true})}
                        placeholder="name"
                        className="mt-1 p-3 border border-gray-300 rounded-md placeholder:text-gray-300"
                        defaultValue={fields[current]?.name} // make sure to set up defaultValue
                        onChange={(e) => {
                          if (e.target.value) {
                            clearErrors(`people.${current}.name`);
                          }
                        }}
                      />

                      {/* include error handling */}
                      {errors.people && errors.people[current]?.name  && (
                        <p className="text-red-400 mt-1 text-xs">Name is required</p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col w-full">
                      <label htmlFor={`people.${current}.email`} className="text-xs">Email</label>
                      <input
                        {...register(`people.${current}.email`, {required: true})}
                        placeholder="email"
                        className="mt-1 p-3 border border-gray-300 rounded-md placeholder:text-gray-300"
                        defaultValue={fields[current]?.email} // make sure to set up defaultValue
                        onChange={(e) => {
                          if (e.target.value) {
                            clearErrors(`people.${current}.email`);
                          }
                        }}
                      />

                      {/* include error handling */}
                      {errors.people && errors.people[current]?.email  && (
                        <p className="text-red-400 mt-1 text-xs">Email is required</p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col w-full">
                      <label htmlFor={`people.${current}.phone`} className="text-xs">Phone</label>
                      <input
                        {...register(`people.${current}.phone`, {required: true})}
                        placeholder="phone"
                        className="mt-1 p-3 border border-gray-300 rounded-md placeholder:text-gray-300"
                        defaultValue={fields[current]?.phone} // make sure to set up defaultValue
                        onChange={(e) => {
                          if (e.target.value) {
                            clearErrors(`people.${current}.phone`);
                          }
                        }}
                      />

                      {/* include error handling */}
                      {errors.people && errors.people[current]?.phone  && (
                        <p className="text-red-400 mt-1 text-xs">Phone is required</p>
                      )}
                    </div>

                    {/* Other fields here */}
                    
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="fixed md:relative bottom-0 inset-x-0 flex items-center justify-between bg-white p-5 border-t border-gray-200 shadow-sm">
            {current > 0 && (
              <button
                onClick={() => setCurrent(current - 1)}
                type="button"
                className="text-sm text-[#212121]"
              >
                Back
              </button>
            )}
            {!isFirstStep && current === 0  && <BackBtn step={formStep} setFormStep={setFormStep} cta="Back"/>}
            
            {current !== 0 && (
              <button
                onClick={nextPerson}
                type="button"
                className="bg-[#77dd77] text-[#212121] px-5 py-2 rounded text-sm whitespace-nowrap"
              >
                Next Person
              </button>
            )}
            {!isLastStep && current === 0 && (
              <NextBtn cta={loading ? "Loading..." : "Next"} />
            )}

          </div>
        </form>
      </div>
    </div>
  );
};

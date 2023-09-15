'use client'
import {useEffect, useState} from 'react'
import { useForm } from 'react-hook-form';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CreateRegModal({ event }) {
  const [currentPerson, setCurrentPerson] = useState(0);
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, watch, formState: { errors }} = useForm({
    defaultValues: {
      registrationType: 'child',
      numberOfKids: 1,
      people: [{name: null, gender: null, email: null, grade: null, birthdate: null }],
      self: {
        name: null,
        email: null,
        phone: null,
        grade: null,
        birthdate: null, 
      }
    }
  });
  const registrationType = watch("registrationType");
  const numberOfKids = watch("numberOfKids");
  const supabase = createClientComponentClient();

  

  useEffect(() => {
    // Disable body scroll when modal opens
    document.body.style.overflow = 'hidden';

    // Enable body scroll when modal closes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const onSubmit = async (data) => {
    // Insert the self person and the child people into the 'people' table
    const { data: savedPeople, error: peopleError } = await supabase
      .from('people')
      .insert([
        ...data.people.map((person) => ({ ...person, account_id: '0b2390b7-8da9-44c8-b55e-38d5a29115f2' })),
        { ...data.self, account_id: '0b2390b7-8da9-44c8-b55e-38d5a29115f2'}
      ])
      .select('*');
  
    if (peopleError) {
      console.error(peopleError);
      return;
    }
  
    // Get the id of the self person
    const selfPerson = savedPeople.find((person) => person.email === data.self.email);
    if (!selfPerson) {
      console.error('Self person not found in saved people');
      return;
    }
    const selfId = selfPerson.id;
  
    // Get the ids of the child people
    const childPeopleIds = savedPeople
      .filter((person) => person.email !== data.self.email)
      .map((person) => person.id);
  
    // Insert the relationships into the 'relationships' table
    const relationships = childPeopleIds.map((id) => ({
      name: 'Parent',
      person_id: selfId,
      relation_id: id
    }));
  
    const { data: savedRelationships, error: relationshipsError } = await supabase
      .from('relationships')
      .insert(relationships);
  
    if (relationshipsError) {
      console.error(relationshipsError);
      return;
    }
  
    // Insert the people as participants into the 'participants' table
    const participants = savedPeople.map((person) => ({
      person_id: person.id,
      event_id: '24ffc200-a21e-494d-bbb6-92fe641776d7'
    }));
  
    const { data: savedParticipants, error: participantsError } = await supabase
      .from('participants')
      .insert(participants);
  
    if (participantsError) {
      console.error(participantsError);
      return;
    }
    
    setSuccess(true)
    console.log('Saved successfully!', savedPeople, savedRelationships, savedParticipants);
  };
  return (
    <div key="modal" className="relative h-[calc(100vh-200px)] md:max-h-[700px] md:h-full overflow-y-scroll bg-white border border-gray-50 shadow-sm rounded px-5 pt-10 pb-20 max-w-lg w-full">
      <h1 className="text-2xl font-bold">Register</h1>
      {!success && (
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="mt-5 text-lg">What's your name?</h1>
        <div className="mt-3">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col mt-1">
              <label htmlFor='name'>Name</label>
              <input 
                className="border border-gray-300 px-3 py-2 rounded"
                {...register(`self.name`, {required: true})} placeholder="Name" 
              />
               {errors.name && <span className="text-sm text-red-500">This field is required</span>}
            </div>
            <div className="flex flex-col mt-1">
              <label htmlFor='email'>Email</label>
              <input 
                className="border border-gray-300 px-3 py-2 rounded"
                {...register(`self.email`, {required: true})} placeholder="Email"
              />
               {errors.email && <span className="text-sm text-red-500">This field is required</span>}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col space-y-2">
          <label className="text-lg">Are you registering for yourself or your child?</label>
          <select 
            className="border border-gray-300 rounded px-3 py-2 w-full"
            {...register("registrationType")}>
            <option value="self">Myself</option>
            <option value="child">Child</option>
          </select>
        </div>

        {registrationType === 'child' && (
          <div className="mt-5">
            <label className="text-lg">How many kids are you registering for?</label>
            <input
              type="number"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              {...register("numberOfKids")}
              placeholder="Add Number"
            />
          </div>
        )}

        {registrationType === 'self' && (
          <div className=" mt-3">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col mt-1">
                <label htmlFor='Grade'>Grade</label>
                <input 
                  className="border border-gray-300 px-3 py-2 rounded"
                  {...register(`self.grade`, {required: true})} placeholder="Grade" 
                />
                 {errors.grade && <span className="text-sm text-red-500">This field is required</span>}
              </div>
              <div className="flex flex-col mt-1">
                <label htmlFor='birthdate'>Birthdate</label>
                <input 
                  className="border border-gray-300 px-3 py-2 rounded"
                  {...register(`self.birthdate`, {required: true})} placeholder="Email"
                />
                 {errors.birthdate && <span className="text-sm text-red-500">This field is required</span>}
              </div>
            </div>
          </div>
        )}
       

      
        {(registrationType === 'child' && numberOfKids > 0) && Array.from({ length: numberOfKids }).map((_, index) => (
          currentPerson === index && (
            <>
            <div key={index} className="border border-gray-300 rounded p-2 mt-3">
              <h3>Person {index + 1}</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col mt-1">
                  <label htmlFor='name'>Name</label>
                  <input 
                    className="border border-gray-300 px-3 py-2 rounded"
                    {...register(`people[${index}].name`, {required: true})} placeholder="Name" 
                  />
                   {errors.phone && <span className="text-sm text-red-500">This field is required</span>}
                </div>
                {/* <div className="flex flex-col mt-1">
                  <label htmlFor='email'>Email</label>
                  <input 
                    className="border border-gray-300 px-3 py-2 rounded"
                    {...register(`people[${index}].email`)} placeholder="Email"
                  />
                </div> */}
                <div className="flex flex-col mt-1">
                  <label htmlFor='grade'>Grade</label>
                  <input 
                    className="border border-gray-300 px-3 py-2 rounded"
                    {...register(`people[${index}].grade`, {required: true})} placeholder="Grade" 
                  />
                   {errors.phone && <span className="text-sm text-red-500">This field is required</span>}
                </div>
                <div className="flex flex-col mt-1">
                  <label htmlFor='birthdate'>Birthdate</label>
                  <input 
                    type="date"
                    className="border border-gray-300 px-3 py-2 rounded"
                    {...register(`people[${index}].birthdate`, {required: true})} placeholder="Birthdate"
                  />
                   {errors.birthdate && <span className="text-sm text-red-500">This field is required</span>}
                </div>
              </div>
            </div>
          
          <div className="flex justify-between items-center mt-3">
            <button 
              onClick={() => setCurrentPerson(currentPerson - 1)} 
              disabled={currentPerson === 0}
              className={`${currentPerson === 0 ? 'invisible' : 'text-zinc-900'}`}
              >  
                Previous
            </button>
            <button 
              onClick={() => setCurrentPerson(currentPerson + 1)} 
              disabled={currentPerson === numberOfKids - 1}
              className={`${currentPerson === numberOfKids - 1 ? 'invisible' : 'bg-green-400 text-zinc-900 rounded px-4 py-1'}`}
              >
                Next
              </button>
          </div>
          </>
          )
        ))}
        <div className="fixed bottom-0 inset-x-0 bg-white p-3 border-t border-gray-300">
          <button type="submit" className="bg-zinc-900 text-zinc-50 px-5 py-3 rounded">Register</button>
        </div>
      </form>
      )}

      {success && (
        <h1>Thank You</h1>
      )}
    </div>
  )
}

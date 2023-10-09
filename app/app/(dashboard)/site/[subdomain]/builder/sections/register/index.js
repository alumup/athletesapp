'use client'
import React, { useEffect, useState } from 'react';

import GenericButton from "@/components/modal-buttons/generic-button";
import CreateRegModal from '@/components/modal/reg-modal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LinkButton from '@/components/modal-buttons/link-button';
import ScheduleModal from '@/components/modal/schedule-modal';

function Register({ id, data }) {
  const [event, setEvent] = useState(null)
  const supabase = createClientComponentClient();

  useEffect(() => {
    console.log("EVENTZZZZZ: ", data)
  },[data])

  // useEffect(() => {
  //   console.log("DATA IN REGISTER", data)
  //   const getEvent = async () => {
  //     const {data: event} = await supabase
  //       .from('events')
  //       .select('*')
  //       .eq('id', data?.event?.value)
  //       .single()

  //     setEvent(event)

  //   }

  //   getEvent()
  // }, [data])


  return (

    <div className={id}>
      <div className={`flex flex-col justify-center items-center px-5 py-10 min-h-[300px] h-full relative group ${data?.theme?.value === 'dark' ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-300'}`}>
          <h1 className={`font-primary uppercase text-3xl md:text-6xl font-bold text-center ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-300'}`}>{data?.title?.value}</h1>
          <div className="mt-5 w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
            <h2 className={`font-secondary font-light text-md md:text-base text-center ${data?.theme?.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-light`}>{data?.subtitle?.value}</h2>
          </div>
          <div className="mt-5 flex items-center justify-center space-x-2">
            <GenericButton cta="Register for Tryouts">
              <CreateRegModal event={event}/>
            </GenericButton>
          </div>
          <div className="max-w-2xl mx-auto">
            <LinkButton cta={"See Schedule"}>
              <ScheduleModal event={event} />
            </LinkButton>
          </div>
      </div>
    </div>
  );
}

export default Register;
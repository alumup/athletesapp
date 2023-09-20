'use client'
import React, { useEffect, useState } from 'react';
import { usePageData } from "@/providers/page-provider";
import CustomComponentEditor from '../editor';
import GenericButton from "@/components/modal-buttons/generic-button";
import CreateRegModal from '@/components/modal/reg-modal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LinkButton from '@/components/modal-buttons/link-button';
import ScheduleModal from '@/components/modal/schedule-modal';

function Register({ id }) {
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState(null)
  const {site, liveMode, pageState, setPageState } = usePageData(); // Use the hook
  const supabase = createClientComponentClient();


  
  const [componentData, setComponentData] = useState(() => {
    const pageDataComponent = pageState?.components.find(comp => comp.id === id);

    if (pageDataComponent?.properties && Object.keys(pageDataComponent.properties).length !== 0) {
      return pageDataComponent.properties;
    } else {
      return {
        theme: {
          label: 'Theme',
          type: 'select',
          options: ['light', 'dark'],
          value: 'light'
        },
        title: {
          type: 'text',
          label: 'Title',
          value: 'Example Banner Text',
        },
        subtitle: {
          type: 'text',
          label: 'Subtitle',
          value: 'This is the subtitle',
        },
        event : {
          type: 'text',
          label: 'Event ID',
          value: '24ffc200-a21e-494d-bbb6-92fe641776d7'
        },
        primaryCta: {
          type: 'button',
          label: 'Primary CTA',
          properties: {
            text: {
              type: 'text',
              label: 'CTA',
              value: 'Click Me'
            },
            href: {
              type: 'input',
              label: 'Link',
              value: '/about'
            }
          },
        },
      };
    }
  });

  useEffect(() => {
    const updatedComponents = pageState?.components.map(comp => 
      comp.id === id ? { ...comp, properties: componentData } : comp
    );
    setPageState(prevState => ({ ...prevState, components: updatedComponents }));
  }, [id, componentData, setPageState]);

  useEffect(() => {
    const getEvent = async () => {
      const {data, error} = await supabase
        .from('events')
        .select('*')
        .eq('id', componentData?.event?.value)
        .single()

      setEvent(data)
      console.log("EVENT", data)
    }

    getEvent()
  }, [componentData])

  const handleEdit = (updatedData) => {
    setComponentData(updatedData);
    setIsEditing(false);
  };


  return (

    <div>
      {isEditing ? (
       <CustomComponentEditor componentData={componentData} setComponentData={setComponentData} onEdit={handleEdit} />
      ) : (
        <div className={`flex flex-col justify-center items-center px-5 py-10 min-h-[300px] h-full relative group ${componentData.theme.value === 'dark' ? 'bg-gray-50 dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-300'}`}>
            <h1 className={`font-primary uppercase text-3xl md:text-6xl font-bold text-center ${componentData.theme.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-300'}`}>{componentData.title.value}</h1>
            <div className="mt-5 w-full max-w-2xl mx-auto flex flex-col items-center justify-center">
              <h2 className={`font-secondary font-light text-md md:text-base text-center ${componentData.theme.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-light`}>{componentData.subtitle.value}</h2>
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

          {!liveMode && (
            <div className="invisible group-hover:visible absolute cursor h-full w-full bg-red-300/30 z-40 flex justify-center items-end p-5 transition-all ease-in-out"> 
              <button onClick={() => setIsEditing(true)} className="font-bold text-xs uppercase">Edit Component</button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default Register;
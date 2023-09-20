'use client'
import React, { useEffect, useState } from 'react';
import { usePageData } from "@/providers/page-provider";
import CustomComponentEditor from '../editor';
import Link from 'next/link'

function Banner({ id }) {
  const [isEditing, setIsEditing] = useState(false);
  const {liveMode, pageState, setPageState } = usePageData(); // Use the hook



  
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
            <h1 className={`text-2xl uppercase ${componentData.theme.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-300'}`}>{componentData.title.value}</h1>
            <h2 className={`mt-5 md:mt-10 text-base ${componentData.theme.value === 'dark' ? 'text-base-200 dark:text-base-100' : 'text-base-700 dark:text-base-500'} font-light`}>{componentData.subtitle.value}</h2>
            <div className="mt-2 flex items-center justify-center space-x-2">
              {componentData.primaryCta && (
                <Link href={componentData.primaryCta.properties.href.value} className="bg-primary text-primary-content rounded px-3 py-2">{componentData.primaryCta.properties.text.value}</Link>
              )}
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

export default Banner;

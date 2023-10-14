'use client'
import React, { useEffect, useState } from 'react';
import { usePageData } from "@/providers/page-provider";
import CustomComponentEditor from './editor';
import { sectionsConfig } from '@/app/app/(dashboard)/site/[subdomain]/builder/sections/sections-config';
import { useParams } from 'next/navigation';
function EditableComponent({ id, Component, defaultData, componentType }) {

  const [isEditing, setIsEditing] = useState(false);
  const [componentData, setComponentData] = useState(defaultData);
  const { pageState, setPageState } = usePageData(); // Use the hook
  const params = useParams();

  useEffect(() => {
    const folder = sectionsConfig[params.subdomain]?.includes(componentType) ? 'private' : 'public';
    import(`@/app/app/(dashboard)/site/[subdomain]/builder/sections/${folder}/${componentType}/schema`)
      .then((schemaModule) => {
        schemaModule.getSchema((schema) => {
          setComponentData(prevData => ({ ...schema, ...prevData }));
        });
      }, params.domain)
      .catch((error) => {
        console.log('Failed to load schema', error);
      });
  }, []);
  useEffect(() => {
    const updatedComponents = pageState?.components.map(comp =>
      comp.id === id ? { ...comp, properties: componentData } : comp
    );
    setPageState(prevState => ({ ...prevState, components: updatedComponents }));
  }, [id, componentData, setPageState]);



  function removeFormItem(id) {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedComponents = pageState.components.filter(
        (item) => item.id !== id
      );
      setPageState(prevState => ({ ...prevState, components: updatedComponents }));
    }
  }

  const handleEdit = (updatedData) => {
    setComponentData(updatedData);
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {isEditing ? (
        <CustomComponentEditor key={id} componentData={componentData} componentType={componentType} setComponentData={setComponentData} onEdit={handleEdit} />
      ) : (
        <Component key={id} data={componentData} />
      )}

      {!isEditing && (
        <div className="absolute bottom-0 right-5">
          <div className="flex items-center border border-gray-300 bg-white rounded-full shadow-lg text-xs  ">
            <button onClick={() => setIsEditing(true)} className="px-3 text-xs py-0.5 cursor hover:bg-indigo-500 rounded-l-full">Edit</button>
            <button onClick={() => removeFormItem(id)} className="px-3 border-l border-gray-300 text-xs py-0.5 cursor hover:bg-red-500 rounded-r-full flex justify-center">Remove</button>
          </div>
        </div>
      )}


    </div>
  );
}

export default EditableComponent;

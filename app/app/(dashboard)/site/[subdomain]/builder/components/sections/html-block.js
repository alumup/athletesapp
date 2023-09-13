'use client'
import React, { useEffect, useState } from 'react';
import { usePageData } from "@/providers/page-provider";
import CustomComponentEditor from '../editor';


function HtmlBlock({ id }) {
  const [isEditing, setIsEditing] = useState(false);
  const { liveMode, pageState, setPageState } = usePageData(); // Use the hook

  const [componentData, setComponentData] = useState({
    content: {
      type: 'html',
      label: 'HTML Content',
      value: 'Code away...',
    },
  });

  // Update local state when pageState changes
  useEffect(() => {
    const pageDataComponent = pageState.components.find(comp => comp.id === id);
    if (pageDataComponent && Object.keys(pageDataComponent.properties).length !== 0) {
      setComponentData(pageDataComponent.properties)
    }
  }, []);

  useEffect(() => {
    const updatedComponents = pageState.components.map(comp => 
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
        <div
            className="min-h-[50px] h-full w-full relative group flex items-center justify-center"
          >
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: componentData.content.value }} />
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

export default HtmlBlock;

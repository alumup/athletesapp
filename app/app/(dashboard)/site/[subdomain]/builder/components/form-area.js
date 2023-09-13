'use client'
import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { CrossCircledIcon } from '@radix-ui/react-icons';

import DraggableStep from './draggable-step';
import { useFormData } from '@/providers/form-provider';
import CustomComponentEditor from './editor';

import Name from './form-components/name';
import Email from './form-components/email';


function makeID(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}


export default function FormArea() {
  const { formComponents, setFormComponents } = useFormData();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    color: '#000',
    backgroundColor: '#fff',
  });

  const handleEdit = (updatedData) => {
    setFormData(updatedData);
    setIsEditing(false);
  };


  const [{isOver},dropRef] = useDrop(() => ({
    accept: 'form',
    drop: (item) => handleDrop(item),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }));

  function removeFormItem(id) {
    const updatedFormComponents = formComponents.components.filter(item => item.id !== id);
    setFormComponents({components: updatedFormComponents});
  }


  const handleDrop = (item) => {
    let component;
    switch (item.name) {
      case 'name':
        component = <Name />
        break;
      case 'email':
        component = <Email />
        break;
      case 'input':
        component = <input type="text" />;
        break;
      case 'textarea':
        component = <textarea />;
        break;
      // Add more cases for other custom components
      default:
        component = null;
    }

    if (component) {
      setFormComponents(prevState => ({
         ...prevState,
          components: [
           ...prevState.components,
           { name: item.name, id: makeID(10), type: 'form', component: component }
         ]
      }));
    }
  };

  return (
    <div ref={dropRef} className="w-full p-5 space-y-3 md:space-y-5 lg:space-y-8" style={{ color: formData.color, backgroundColor: formData.backgroundColor }}>
      {isEditing ? (
        <CustomComponentEditor schema={formData} onEdit={handleEdit} />
      ) : (
        formComponents?.components?.map((component, index) => (
          <div key={index} className="relative">
            <DraggableStep key={index} component={component.component} />
            <button onClick={() => removeFormItem(component.id)} className="rotate-90 absolute -right-6 bottom-0"><CrossCircledIcon className="w-4 h-4"/></button>
          </div>
        ))
      )}
      {isOver && (
        <div className="flex justify-center items-center h-full w-full border border-dashed border-gray-300 p-5">
          <div className="text-center">
            <p className="text-sm">Drag and drop a form component here</p>
          </div>
        </div>
      )}
      <button onClick={() => setIsEditing(true)} className="font-bold text-xs uppercase mt-5">Edit Form Area</button>
     
    </div>

  );
}

import React, { useState } from 'react';
import CustomComponentEditor from '../editor';
import { useForm } from "react-hook-form";
import { useFormData } from "@/providers/form-provider";

const Name = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [nameData, setNameData] = useState({
    color: '#212121',
    backgroundColor: 'transparent',
  });

  const handleEdit = (updatedData) => {
    setNameData(updatedData);
    setIsEditing(false);
  };

  const { setFormValues, data: formData, formStep, setFormStep } = useFormData();

  const {
    handleSubmit,
    formState: { errors },
    register: quoteForm,
    setValue
  } = useForm({ mode: "all" });

  const onSubmit = (values) => {
    setFormValues(values);
    setFormStep(formStep + 1)
  };


  return (
    <div style={{ color: nameData.color, backgroundColor: nameData.backgroundColor }}>
      {isEditing ? (
        <CustomComponentEditor schema={nameData} onEdit={handleEdit} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col w-full justify-center relative group">
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col col-span-1">
                <label htmlFor="first_name" className="text-xs">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  className="mt-1 p-5 border border-gray-300 rounded-md"
                  placeholder="First Name"
                  {...quoteForm("first_name", {
                    required: true,
                  })}
                />
                {errors.first_name && (
                  <p className="text-red-400 mt-1 text-xs">first name is required</p>
                )}
              </div>
              <div className="flex flex-col col-span-1">
                <label htmlFor="last_name" className="text-xs">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  className="mt-1 p-5 border border-gray-300 rounded-md"
                  placeholder="Last Name"
                  {...quoteForm("last_name")}
                />
                {errors.last_name && (
                  <p className="text-red-400 mt-1 text-xs">last name is required</p>
                )}
              </div>
            </div>
            <div className="invisible group-hover:visible absolute cursor h-full w-full bg-black/75 z-40 flex justify-center items-end p-5 transition-all ease-in-out"> 
              <button onClick={() => setIsEditing(true)} className="font-bold text-xs uppercase text-gray-50">Edit Name</button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default Name;
import React, { useState } from 'react';
import CustomComponentEditor from '../editor';

const Email = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [emailData, setEmailData] = useState({
    color: '#212121',
    backgroundColor: 'transparent',
  });

  const handleEdit = (updatedData) => {
    setEmailData(updatedData);
    setIsEditing(false);
  };

  return (
    <div style={{ color: emailData.color, backgroundColor: emailData.backgroundColor }}>
      {isEditing ? (
        <CustomComponentEditor schema={nameData} onEdit={handleEdit} />
      ) : (
        <div className="flex flex-col w-full justify-center relative group">
          <div className="grid grid-cols-1">
            <div className="col-span-1 flex flex-col">
              <label>Email</label>
              <input type="email" name="email" placeholder='Email' className="border border-gray-300 rounded-md text-black p-2 mt-2" />
            </div>
          </div>
          <div className="invisible group-hover:visible absolute cursor h-full w-full bg-black/75 z-40 flex justify-center items-end p-5 transition-all ease-in-out"> 
            <button onClick={() => setIsEditing(true)} className="font-bold text-xs uppercase text-gray-50">Edit Email</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Email;
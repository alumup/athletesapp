'use client'
import React from 'react';

function updateNestedObject(obj, path, value) {
  const pathParts = path.split('.');
  const key = pathParts.pop();
  const targetObj = pathParts.reduce((nestedObj, pathPart) => nestedObj[pathPart], obj);
  targetObj[key] = value;
}

function renderInput(name, value, type, label, options, handleInputChange) {
  switch (type) {
    case 'text':
      return (
        <div className="flex flex-col">
          <label className="text-gray-700">
            {label}
          </label>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleInputChange}
            className="w-full rounded border border-gray-300 bg-white text-gray-700 p-3"
          />
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center">
          <label>
            {label}
          </label>
          <input
            type="color"
            name={name}
            value={value}
            onChange={handleInputChange}
            className="w-10 h-10 rounded bg-white"
          />
        </div>
      
      );
      case 'radio':
        return (
          <fieldset className="flex flex-col">
            <legend>{label}</legend>
            {['true', 'false'].map((option, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name={name}
                  value={option}
                  checked={value === option}
                  onChange={handleInputChange}
                  className="text-gray-700"
                />
                {option}
              </label>
            ))}
          </fieldset>
        );
        case 'select':
        return (
          <div className="flex flex-col">
            <label className="text-gray-700">
              {label}
            </label>
            <select
              name={name}
              value={value}
              onChange={handleInputChange}
              className="w-full rounded border border-gray-300 bg-white text-gray-700 p-3"
            >
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
        case 'html': 
        return (
          <div className="flex flex-col">
            <label className="text-gray-700">
              {label}
            </label>
            <textarea 
              name={name}
              value={value}
              onChange={handleInputChange}
              rows={10}
              className="w-full rounded border border-gray-300 bg-white text-gray-700 p-3"
            />
          </div>
        );
    // Add more cases for other types as needed
    default:
      return null;
  }
}

function renderFields(data, parentKey, handleInputChange) {
  if (!data) {
    return null;
  }
  return Object.entries(data).map(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      if (value.hasOwnProperty('value')) {
        return renderInput(newKey, value.value, value.type, value.label, value.options, handleInputChange);
      } else {
        return renderFields(value, newKey, handleInputChange);
      }
    } else {
      return null;
    }
  });
}

function CustomComponentEditor({ componentData, setComponentData, onEdit }) {

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setComponentData(prevState => {
      const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy
      updateNestedObject(newState, `${name}.value`, value);
      return newState;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onEdit(componentData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      {renderFields(componentData, null, handleInputChange)}
      <button type="submit" className="mt-10 px-3 py-2 bg-indigo-500 text-white rounded">Save</button>
    </form>
  );
}

export default CustomComponentEditor;
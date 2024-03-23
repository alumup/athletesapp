"use client";
import React from "react";

function updateNestedObject(obj, path, value) {
  const pathParts = path.split(".");
  const key = pathParts.pop();
  const targetObj = pathParts.reduce(
    (nestedObj, pathPart) => nestedObj[pathPart],
    obj,
  );
  targetObj[key] = value;
}

function renderInput(name, value, type, label, options, handleInputChange) {
  switch (type) {
    // case 'group':
    //   console.log("LABEL", label)
    //   return (
    //     <div className="border p-3 rounded">
    //       <label className="text-gray-700">{label}</label>
    //       {Object.keys(value.properties).map((propertyKey) => {
    //         const property = value.properties[propertyKey];
    //         return renderInput(`${name}.${propertyKey}`, property.value, property.type, property.label, property.options, handleInputChange);
    //       })}
    //     </div>
    //   );
    case "group":
      return (
        <fieldset className="rounded border p-3">
          <legend className="text-gray-700">{label}</legend>
          {Object.keys(value.properties).map((propertyKey) => {
            const property = value.properties[propertyKey];
            return renderInput(
              `${name}.${propertyKey}`,
              property.value,
              property.type,
              property.label,
              property.options,
              handleInputChange,
            );
          })}
        </fieldset>
      );
    case "text":
      return (
        <div className="flex flex-col">
          <label className="text-gray-700">{label}</label>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleInputChange}
            className="w-full rounded border border-gray-300 bg-white p-3 text-gray-700"
          />
        </div>
      );
    case "color":
      return (
        <div className="flex items-center">
          <label>{label}</label>
          <input
            type="color"
            name={name}
            value={value}
            onChange={handleInputChange}
            className="h-10 w-10 rounded bg-white"
          />
        </div>
      );
    case "radio":
      return (
        <fieldset className="flex flex-col">
          <legend>{label}</legend>
          {["true", "false"].map((option, index) => (
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
    case "select":
      return (
        <div className="flex flex-col">
          <label className="text-gray-700">{label}</label>
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            className="w-full rounded border border-gray-300 bg-white p-3 text-gray-700"
          >
            {options?.map((option, index) => (
              <option
                key={options.value || index}
                value={option.value || option}
              >
                {option.label || option}
              </option>
            ))}
          </select>
        </div>
      );
    case "html":
      return (
        <div className="flex flex-col">
          <label className="text-gray-700">{label}</label>
          <textarea
            name={name}
            value={value}
            onChange={handleInputChange}
            rows={10}
            className="w-full rounded border border-gray-300 bg-white p-3 text-gray-700"
          />
        </div>
      );
    case "checkbox":
      return (
        <div>
          {options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                value={option}
                checked={value.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Add the selected option to the field value
                    value.push(option);
                  } else {
                    // Remove the selected option from the field value
                    value = value.filter((val) => val !== option);
                  }
                  // Update the state
                  handleInputChange({ target: { name, value } });
                }}
              />
              {option}
            </label>
          ))}
        </div>
      );
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
    if (typeof value === "object" && value !== null) {
      if (value.hasOwnProperty("value")) {
        return renderInput(
          newKey,
          value.value,
          value.type,
          value.label,
          value.options,
          handleInputChange,
        );
      } else {
        return renderFields(value, newKey, handleInputChange);
      }
    } else {
      return null;
    }
  });
}

function CustomComponentEditor({
  componentData,
  setComponentData,
  componentType,
  onEdit,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setComponentData((prevState) => {
      const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy
      updateNestedObject(newState, `${name}.value`, value);
      return newState;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("COMPONENT DATA:", componentData);
    onEdit(componentData);
  };

  function handleFormSubmit(e) {
    e.preventDefault();
    const prompt = e.target.elements.prompt.value;
    generateHtml(prompt);
  }

  async function generateHtml(prompt) {
    console.log("PROMPT", prompt);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        console.error("Response status:", response.status, response.statusText);
        return;
      }

      // Read the response body as a stream
      const reader = response.body.getReader();
      let chunks = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("RESPONSE FROM OPEN AI: ", chunks);
          return chunks;
        }
        chunks += new TextDecoder("utf-8").decode(value);
        setComponentData((prevState) => ({
          ...prevState,
          content: {
            ...prevState.content,
            value: chunks,
          },
        }));
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  return (
    <div>
      {componentType === "html-block" && (
        <form onSubmit={handleFormSubmit} className="space-y-5 p-5">
          <div className="flex flex-col">
            <label className="text-gray-700">Prompt</label>
            <input
              type="textarea"
              name="prompt"
              placeholder="Imagine..."
              className="w-full rounded border border-gray-300 bg-white p-3 text-gray-700"
            />
          </div>
          <button
            type="submit"
            className="mt-10 rounded bg-indigo-500 px-3 py-2 text-white"
          >
            Generate
          </button>
        </form>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {renderFields(componentData, null, handleInputChange)}
        <button
          type="submit"
          className="mt-10 rounded bg-indigo-500 px-3 py-2 text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default CustomComponentEditor;

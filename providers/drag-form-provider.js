'use client'
import { useState, createContext, useContext, useEffect } from "react";


export const FormContext = createContext();

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export default function FormProvider({ children }) {
  const [data, setData] = useState({});
  const [formStep, setFormStep] = useState(1);
  const [formComponents, setFormComponents] = useState({ components: []});

  useEffect(() => {
    let newFormComponents = JSON.stringify(formComponents);

    if (formComponents.components.length > 0) {
      localStorage.setItem('form', newFormComponents);
    }
  }, [formComponents]);

  useEffect(() => {
    let newData = JSON.stringify(data);

    if (!isEmpty(data)) {
      console.log(newData)
      localStorage.setItem("form", newData);
    }

  },[data])

  const setFormValues = (values) => {
    setData((prevValues) => ({
      ...prevValues,
      ...values,
    }));

  };
  
 

  return (
    <FormContext.Provider value={{ data, setFormValues, formComponents, setFormComponents, formStep, setFormStep }}>
      {children}
    </FormContext.Provider>
  );
}

const useFormData = () => useContext(FormContext);


export { FormProvider, useFormData};
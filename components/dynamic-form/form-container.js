"use client";
import { useEffect, useState } from "react";
import { useFormData } from "@/providers/form-provider";

// Import all form components
import {
  Payment,
  Person,
  Products,
} from "@/components/dynamic-form/form-components";
import Image from "next/image";

const formComponents = {
  Payment,
  Products,
  Person,
};

export const FormContainer = ({ formIndex, formJson, event }) => {
  const { paymentSuccess, formData, setFormValues } = useFormData();
  const [formStep, setFormStep] = useState(0);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const order = localStorage.getItem("order");
    setOrderId(order);
  }, []);

  // Parse form JSON
  const formSteps = JSON.parse(formJson);

  // Check if the current formIndex is within the range of available forms
  if (formStep < formSteps.length) {
    // Get the current form configuration based on the formStep
    const currentFormConfig = formSteps[formStep];

    // Get the component name from the current form configuration
    const componentName = currentFormConfig.component;

    // Get the component from formComponents using the componentName
    const FormComponent = formComponents[componentName];

    // Return the form component if it exists
    if (FormComponent) {
      const handleNextStep = (values) => {
        setFormValues(values, formIndex);
        setFormStep((prevStep) => prevStep + 1);
      };

      const handleBackStep = () => {
        setFormStep((prevStep) => prevStep - 1);
      };

      return (
        <>
          {/* <Progress steps={formSteps.length} currentStep={formStep} /> */}
          {!paymentSuccess && (
            <FormComponent
              {...currentFormConfig?.props}
              formIndex={formIndex}
              isFirstStep={formStep === 0}
              isLastStep={formStep === formSteps.length - 1}
              setFormStep={setFormStep}
              formStep={formStep}
              initialValues={formData[formIndex]}
              onNextStep={handleNextStep}
              onBackStep={handleBackStep}
              event={event}
            />
          )}
          {paymentSuccess && (
            <div>
              <h2 className="mb-5 text-center text-2xl font-semibold leading-6 text-gray-700 md:text-4xl">
                Thank you for your order!
              </h2>
              <p className="my-5 text-sm font-light leading-6 text-gray-500 md:text-base">
                You should receive an email confirmation shortly. If you have
                any questions, please contact us at{" "}
                <a
                  href="mailto:jake@provobasketball.com"
                  className="text-lime-600 hover:text-lime-500"
                >
                  Contact Us
                </a>
                .
              </p>
            </div>
          )}
        </>
      );
    } else {
      throw new Error(`Component ${componentName} does not exist.`);
    }
  }

  return null;
};

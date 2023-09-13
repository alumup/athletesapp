"use client";
import React from "react";
import { useDrag } from "react-dnd";


function PageComponent(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { name: props.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      className="bg-white text-gray-700 border border-gray-300 rounded-md p-3 flex justify-center"
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {props.children}
    </div>
  );
}

function FormComponent(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "form",
    item: { name: props.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      className="border border-gray-300 rounded-md p-3 flex justify-center"
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {props.children}
    </div>
  );
}

function Toolbar() {
  return (
    <div className="w-full flex flex-col space-y-5">
 
      <h4 className="text-sm text-gray-700">Sections</h4>
      <PageComponent name="banner">
        <label>Banner</label>
      </PageComponent>
      <PageComponent name="register">
        <label>Register</label>
      </PageComponent>
      <PageComponent name="html-block">
        <label>HTML Block</label>
      </PageComponent>

      {/* <PageComponent name="form">
        <label>Form</label>
      </PageComponent> */}
      {/* <h3>Form Components</h3>
      <FormComponent name="name">
        <label>Name</label>
      </FormComponent>
      <FormComponent name="email">
        <label>Email</label>
      </FormComponent>
      <FormComponent name="address">
        <label>Address</label>
      </FormComponent>
      <FormComponent name="input">
        <label>Input</label>
      </FormComponent>
      <FormComponent name="textarea">
        <label>Textarea</label>
      </FormComponent> */}
      {/* Add more custom components here */}
    </div>
  );
}

export default Toolbar;

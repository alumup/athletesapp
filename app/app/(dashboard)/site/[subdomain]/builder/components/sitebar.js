"use client";
import React from "react";
import { useDrag } from "react-dnd";

import ThemeForm from './theme-form'

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
      className="border border-gray-300 rounded-md p-3 flex justify-center"
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

function Sitebar() {
  return (
    <div className="h-[500px] space-y-5">
      <ThemeForm />
    </div>
  );
}

export default Sitebar;

"use client";
import React from "react";
import { useDrag } from "react-dnd";

import ThemeForm from "./theme-form";

function Sitebar() {
  return (
    <div className="h-[500px] space-y-5">
      <ThemeForm />
    </div>
  );
}

export default Sitebar;

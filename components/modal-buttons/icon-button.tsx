"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function IconButton({
  children,
  cta,
  icon,
}: {
  children: ReactNode;
  cta: string;
  icon: ReactNode;
}) {
  const modal = useModal();
  return (
    <Button variant="outline" onClick={() => modal?.show(children)}>
      <span className="flex items-center">
        {icon}
        {cta}
      </span>
    </Button>
  );
}

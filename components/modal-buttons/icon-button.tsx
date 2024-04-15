"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function IconButton({
  children,
  cta,
  icon,
  className,
}: {
  children: ReactNode;
  cta: string;
  icon: ReactNode;
  className?: string;
}) {
  const modal = useModal();
  return (
    <Button
      className={className}
      variant="outline"
      onClick={() => modal?.show(children)}
    >
      <span className="flex items-center">
        {icon}
        {cta}
      </span>
    </Button>
  );
}

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
      size="sm"
      variant="outline"
      onClick={() => modal?.show(children)}
    >
      <span className="relative mr-2 flex shrink-0 items-center justify-center overflow-hidden">
        {icon}
      </span>
      <span className="font-medium">{cta}</span>
    </Button>
  );
}

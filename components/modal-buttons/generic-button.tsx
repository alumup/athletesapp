"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";
import { Button } from "../ui/button";

export default function GenericButton({
  children,
  size,
  variant,
  cta,
  classNames,
}: {
  children: ReactNode;
  size: any;
  variant: any;
  cta: string;
  classNames: any;
}) {
  const modal = useModal();
  return (
    <Button
      onClick={() => modal?.show(children)}
      size={size}
      variant={variant}
      className={classNames}
    >
      {cta}
    </Button>
  );
}

"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";

export default function GenericButton({
  children,
  cta
}: {
  children: ReactNode;
  cta: string;
}) {
  const modal = useModal();
  return (
    <button
      onClick={() => modal?.show(children)}
      className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white transition-all"
    >
     {cta}
    </button>
  );
}

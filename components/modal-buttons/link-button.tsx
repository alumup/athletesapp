"use client";

import { useModal } from "@/components/modal/provider";
import { ReactNode } from "react";

export default function LinkButton({
  children,
  cta,
}: {
  children: ReactNode;
  cta: string;
}) {
  const modal = useModal();
  return (
    <button
      onClick={() => modal?.show(children)}
      className="mt-2 text-xs font-medium text-zinc-900 transition-all"
    >
      {cta}
    </button>
  );
}

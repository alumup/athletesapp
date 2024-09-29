"use client";

import { useModal } from "@/components/modal/provider";
import Image from "next/image";
import { ReactNode } from "react";

export default function ImageButton({
  children,
  image,
}: {
  children: ReactNode;
  image: string;
}) {
  const modal = useModal();
  return (
    <button
      title="Open image"
      aria-label="Open image"
      type="button"
      onClick={() => modal?.show(children)}
      className="cursor relative h-52 w-52 overflow-hidden rounded bg-gray-200"
    >
      <Image
        src={image}
        alt="Image"
        fill
        className="object-cover object-center"
      />
    </button>
  );
}

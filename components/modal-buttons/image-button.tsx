"use client";

import { useModal } from "@/components/modal/provider";
import Image from "next/image";
import { ReactNode } from "react";

export default function ImageButton({
  children,
  image
}: {
  children: ReactNode;
  image: string;
}) {
  const modal = useModal();
  return (
    <button
      onClick={() => modal?.show(children)}
      className="w-52 h-52 bg-gray-200 rounded cursor relative overflow-hidden"
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
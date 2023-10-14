"use client";

import { useModal } from "@/components/modal/provider";
import { ChatBubbleIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export default function SendButton({
  children,
  channel,
  cta
}: {
  children: ReactNode;
  cta: string;
  channel: string;
}) {
  const modal = useModal();
  return (
    <Button
      variant="default"
      onClick={() => modal?.show(children)}
    >
      {channel === 'email' ?
        <span className="flex items-center"><PaperPlaneIcon className="mr-2 h-4 w-4" /> {cta}</span>
          :
        <span className="flex items-center"><ChatBubbleIcon className="mr-2 h-4 w-4" /> {cta}</span>
      }
    </Button>
  );
}

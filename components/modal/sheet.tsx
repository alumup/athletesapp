import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../ui/button";

export default function SheetModal({cta, title, description, children}: {cta: any, title: any, description: any, children: any}) {
  return (
    <Sheet>
      <SheetTrigger className="border border-zinc-900 text-zinc-900 rounded py-2 px-3 text-sm">
       {cta}
      </SheetTrigger>
      <SheetContent>
       
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-10 relative w-full h-full relative">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

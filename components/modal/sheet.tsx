import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function SheetModal({
  cta,
  title,
  description,
  children,
}: {
  cta: any;
  title: any;
  description: any;
  children: any;
}) {
  return (
    <Sheet>
      <SheetTrigger>
        <Button 
          variant="outline"
          color="black"
          className="text-xs"
        >
          {cta}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex h-full bg-white flex-col p-0">
        <SheetHeader className="p-6">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        
          <div className="px-6 pb-20">
            {children}
          </div>
       
      </SheetContent>
    </Sheet>
  );
}

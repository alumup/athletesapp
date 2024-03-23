import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
      <SheetTrigger className="rounded border border-zinc-900 px-3 py-2 text-sm text-zinc-900">
        {cta}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="relative relative mt-10 h-full w-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

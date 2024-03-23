import { ReactNode } from "react";

export default async function ThankYouLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-full min-h-screen w-full bg-gray-50 px-3 md:px-5">
      <div className="flex items-center justify-center py-5">
        <img src="/athletes.svg" className="h-auto w-[125px]" />
      </div>
      <div>{children}</div>
    </div>
  );
}

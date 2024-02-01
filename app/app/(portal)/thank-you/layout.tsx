import { ReactNode } from "react";

export default async function ThankYouLayout({ children }: { children: ReactNode }) { 
  return (
    <div className="bg-gray-50 min-h-screen h-full w-full px-3 md:px-5">
      <div className="py-5 flex justify-center items-center">
        <img src="/athletes.svg" className="w-[125px] h-auto" />
      </div>
      <div>
        {children}
      </div>
    </div>  
  )
}
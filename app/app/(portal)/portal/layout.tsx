import { ReactNode } from "react";

export default async function PorttalLayout({ children }: { children: ReactNode }) { 
  return (
    <div className="bg-gray-50 min-h-screen h-full w-full px-3 md:px-5">
      <div className="py-5 flex justify-center items-center">
        <img src="https://zkoxnmdrhgbjovfvparc.supabase.co/storage/v1/object/public/logos/provo-bulldog.svg" alt="bulldog" width="75" height="75"/>
      </div>
      <div>
        {children}
      </div>
    </div>  
  )
}
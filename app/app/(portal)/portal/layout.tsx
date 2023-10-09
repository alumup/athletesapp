import { ReactNode } from "react";

export default async function PorttalLayout({ children }: { children: ReactNode }) { 
  return (
    <div className="bg-gray-50 min-h-screen h-full w-full px-3 md:px-5">
      <div className="py-5 flex justify-center items-center">
        <img src="https://zkoxnmdrhgbjovfvparc.supabase.co/storage/v1/object/public/logos/provo-bulldog.svg" alt="bulldog" width="75" height="75"/>
      </div>
      <div className="max-w-5xl mx-auto py-10 px-5 border border-gray-300 rounded-xl shadow bg-white">
        {children}
      </div>
    </div>  
  )
}
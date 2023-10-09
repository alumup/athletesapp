'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Banner from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/banner"
import HtmlBlock from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/html-block";


import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const revalidate = 1

export default function SitePages() {
  const [page, setPage] = useState({})
  const supabase = createClientComponentClient()
  const params = useParams()

  useEffect(() => {
    const getPage = async () => {
      const {data: page, error} = await supabase
      .from('pages')
      .select('*')
      .eq('slug', params.slug)
      .single()

      setPage(page)
    }

    getPage();

   
  },[])


  return (
    <div className="min-h-screen h-full w-full flex flex-col">
      {page?.data?.components?.map((component) => {
        let Component;
        switch (component.name) {
          case "banner":
            Component = Banner;
            break;
          case "html-block":
            Component = HtmlBlock;
            break;
          default:
            Component = function DefaultComponent() { return null; };
            break;
        }

        return (
          <div key={component.id}>
            <Component id={component.id} data={component.data}/>
          </div>
        );
      })}
    </div>
  );
}
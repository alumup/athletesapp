'use client'
import React from 'react';
import { useEffect, useState } from 'react';

import Banner from "@/app/app/(dashboard)/site/[subdomain]/builder/components/sections/banner"
import HtmlBlock from "@/app/app/(dashboard)/site/[subdomain]/builder/components/sections/html-block";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const revalidate = 1

export default function SiteHomePage() {
  const [page, setPage] = useState({})
  const supabase = createClientComponentClient()


  useEffect(() => {
    const getPage = async () => {
      const {data: page, error} = await supabase
      .from('pages')
      .select('*')
      .eq('slug', 'home')
      .single()

      setPage(page)
    }

    getPage();

  },[])


  return (
    <div className="min-h-screen h-full w-full flex flex-col justify-start">
      {page?.data?.components?.map((component) => {
        let Component;
        switch (component.name) {
          case "banner":
            Component = Banner;
            break;
          case "collection":
            Component = Collection;
            break;
          case "collections":
            Component = Collections;
            break;
          case "html-block":
            Component = HtmlBlock;
            break;
          case "challenge":
            Component = Challenge;
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
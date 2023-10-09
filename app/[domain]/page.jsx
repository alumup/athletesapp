'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import Banner from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/banner/index"
import Hero from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/hero/index"
import HtmlBlock from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/html-block/index"
import Products from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/products/index"
import Register from "@/app/app/(dashboard)/site/[subdomain]/builder/sections/register/index"
import Photos from '@/app/app/(dashboard)/site/[subdomain]/builder/sections/photos';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getSiteId } from '@/lib/fetchers/client';

export const revalidate = 1

export default function SiteHomePage() {
  const [page, setPage] = useState({})
  const [site, setSite] = useState(null)
  const supabase = createClientComponentClient()
  const params = useParams()

  useEffect(() => {
    const getTheSiteID = async () => {
      const s = await getSiteId(params.domain)
      setSite(s)
    }

    getTheSiteID();

  },[])

  useEffect(() => {

    if (site) {
      const getPage = async () => {
        const {data: page, error} = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'home')
        .eq('site_id', site)
        .single()
  
        console.log("PAGE", page)
  
        if (error) {
          console.log("PAGE ERROR", error)
        }
  
        setPage(page)
      }
      getPage();
    }

  },[site])


  return (
    <div className="min-h-screen h-full w-full flex flex-col justify-start">
      {page?.data?.components?.map((component) => {
        let Component;
        switch (component.name) {
          case "banner":
            Component = Banner;
            break;
          case "hero":
            Component = Hero;
            break;
            case "products":
              Component = Products;
              break;
          case "register":
            Component = Register;
            break;
          case "html-block":
            Component = HtmlBlock;
            break;
          case "photos":
            Component = Photos;
            break;
          default:
            Component = function DefaultComponent() { return null; };
            break;
        }

        return (
          <div key={component.id}>
            <Component id={component.id} data={component.properties}/>
          </div>
        );
      })}
    </div>
  );
}
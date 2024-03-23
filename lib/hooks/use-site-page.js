"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSiteId } from "@/lib/fetchers/client";

export function useSitePage() {
  const [page, setPage] = useState({});
  const [site, setSite] = useState(null);
  const supabase = createClientComponentClient();
  const params = useParams();

  useEffect(() => {
    const getTheSiteID = async () => {
      const s = await getSiteId(params.domain);
      setSite(s);
    };

    getTheSiteID();
  }, [params.domain]);

  useEffect(() => {
    if (site) {
      const getPage = async () => {
        const { data: page, error } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", params.slug || "home")
          .eq("site_id", site)
          .single();

        console.log("PAGE", page);

        if (error) {
          console.log("PAGE ERROR", error);
        }

        setPage(page);
      };
      getPage();
    }
  }, [site, params.slug, params.domain, supabase]);

  return { page, site };
}

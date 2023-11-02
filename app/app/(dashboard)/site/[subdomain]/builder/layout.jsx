"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { PageProvider } from "@/providers/page-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Sitebar from "./sitebar";
import Toolbar from "./toolbar";
import LinkButton from "@/components/modal-buttons/link-button";
import CreatePageModal from "@/components/modal/create-page-modal";
import PageSelector from "@/components/page-selector";

import { useParams } from "next/navigation";
import { getSiteId } from "@/lib/fetchers/client";

export default function BuilderLayout({ children }) {
  const [pages, setPages] = useState([]);
  const [siteId, setSiteId] = useState(null);
  const supabase = createClientComponentClient();
  const params = useParams();

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("site_id", siteId);
    if (error) {
      console.error("fetchPages - BuilderLayout:", error);
    } else {
      setPages(data);
    }
  };

  useEffect(() => {
    console.log("PARAMS:", params.subdomain);
    const findSiteId = async () => {
      const site = await getSiteId(params.subdomain);
      console.log("SITE ID: ", site);
      setSiteId(site);
    };

    findSiteId();
  }, [params.subdomain]);

  useEffect(() => {
    fetchPages();
    const channel = supabase
      .channel("pages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pages",
        },
        fetchPages(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [siteId, supabase]);

  return (
    <ThemeProvider>
      <PageProvider>
        <DndProvider backend={HTML5Backend}>
          <div className="flex w-full space-x-5">
            <div className="fixed h-screen min-w-[300px] max-w-[300px] w-full rounded-md border border-gray-300 bg-gray-50 p-3">
              <h3 className="font-bold uppercase text-gray-700">Page</h3>
              <div className="w-full">
                <PageSelector pages={pages} />
                <LinkButton cta="+ New Page">
                  <CreatePageModal />
                </LinkButton>
              </div>
              <Accordion type="single" collapsible >
                <AccordionItem value="sections" >
                  <AccordionTrigger>Sections</AccordionTrigger>
                  <AccordionContent>
                    <Toolbar />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="theme">
                  <AccordionTrigger>Theme</AccordionTrigger>
                  <AccordionContent>
                    <Sitebar />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="w-full bg-white ml-[325px]">{children}</div>
          </div>
        </DndProvider>
      </PageProvider>
    </ThemeProvider>
  );
}

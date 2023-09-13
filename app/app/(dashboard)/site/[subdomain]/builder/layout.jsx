'use client'
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { PageProvider } from "@/providers/page-provider";
import { FormProvider}  from "@/providers/form-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Script from 'next/script';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import Sitebar from './components/sitebar'
import Toolbar from './components/toolbar';
import LinkButton from "@/components/modal-buttons/link-button";
import CreatePageModal from "@/components/modal/create-page-modal";
import PageSelector from '@/components/page-selector';



export default function BuilderLayout({ children }) {

  const [pages, setPages] = useState([])
  const supabase = createClientComponentClient();


  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase.from('pages').select('*');
      if (error) {
        console.error('Error fetching pages:', error);
      } else {
        setPages(data);
      }
    };
    fetchPages();
  },[])

  

  useEffect(() => {
    const fetchPages = async () => {
      const { data, error } = await supabase.from('pages').select('*');
      if (error) {
        console.error('Error fetching pages:', error);
      } else {
        setPages(data);
      }
    };




    const channel = supabase
    .channel('pages')
    .on("postgres_changes",
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pages'
      },
      fetchPages
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
  }, [supabase]);
  
  return (
    <ThemeProvider>
      <PageProvider> 
        <FormProvider>
          <DndProvider backend={HTML5Backend}>
            <div className="w-full flex space-x-5">
              <div className="fixed w-[300px] h-screen bg-gray-50 p-3 border border-gray-300 rounded-md">
              <h3 className="font-bold uppercase text-gray-700">Page</h3>
              <div className="w-full">
                <PageSelector pages={pages} />
                <LinkButton cta="+ New Page">
                  <CreatePageModal />
                </LinkButton>
              </div>
                <Accordion type="single" collapsible>
                  <AccordionItem value="sections">
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
              <div className="pl-[325px] w-full bg-white">
                {children}
              </div>
            </div>
          </DndProvider>
        </FormProvider>
      </PageProvider> 
    </ThemeProvider>


  );
}
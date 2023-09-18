'use client'
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDrop } from "react-dnd";
import { CrossCircledIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Banner from "./sections/banner";
import HtmlBlock from './sections/html-block'
import Register from './sections/register'

import DraggableComponent from "./draggable-component";
import { usePageData } from "@/providers/page-provider";
import FormArea from "./form-area";
import CustomDragLayer from "./custom-drag-layer";
import { useParams } from "next/navigation";
import Image from "next/image";

function makeID(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default function PageArea() {
  const { site, pages, pageState, setPageState } = usePageData();
  const [draggingIndex, setDraggingIndex] = useState(null);
  const pageStateRef = useRef(pageState);
  const params = useParams

  const supabase = createClientComponentClient();





  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => handleDrop(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const handleDrop = (item, monitor) => {
 
    let id = makeID(10);

    const newComponent = {
      name: item.name,
      id: id,
      type: "component",
      properties: {}, // Add properties to the component object
    };
      
    if (monitor.getDropResult()) {
      // Move existing component to hoverIndex
      const dragIndex = monitor.getItem().index;
      const hoverIndex = monitor.getDropResult().index;
      moveComponent(dragIndex, hoverIndex);
    } else if (monitor.isOver({ shallow: true })) {
      // Drop at the top of the list
      setPageState((prevState) => {
        const components = [newComponent, ...prevState.components];
        return {
          ...prevState,
          components,
        };
      });
    }
    
  };


    function moveComponent(dragIndex, hoverIndex) {
      if (dragIndex !== null && dragIndex !== undefined && hoverIndex !== null && hoverIndex !== undefined) {
        const components = [...pageState.components];
        const dragComponent = components[dragIndex];
    
        components.splice(dragIndex, 1);
        components.splice(hoverIndex, 0, dragComponent);
    
        setPageState({ components });
      }
    }

    function removeFormItem(id) {
      const updatedPageState = pageState.components.filter(
        (item) => item.id !== id
      );
      setPageState({ components: updatedPageState });
    }

    if (!pageState) {
      <div className="w-full h-full">
        Loading!
      </div>
    }

  return (
  
      <div className="w-full flex flex-col space-y-5">
        <div
          className="w-full min-h-[500px] h-full bg-gray-50 overflow-hidden border border-gray-300 rounded-md mb-20 shadow-md"
          ref={dropRef}
        >
          <div className="w-full bg-zinc-900 text-zinc-100 py-2 px-3 md:px-5 px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 items-center">
              <div className="col-span-1 flex items-center">
                <img 
                  src={`https://zkoxnmdrhgbjovfvparc.supabase.co/storage/v1/object/public/logos/provo-bulldog-white.svg`}
                  className="w-8 h-8 fill-zinc-50"
                />
                <span className="ml-2 font-bold">{site?.name}</span>
              </div>
              <div className="col-span-1 flex justify-center text-zinc-50 text-sm space-x-2">
                  {pages?.map((page) => (
                      <Link key={page.id} href={`/${page.slug}`} className="text-gray-50 text-sm">
                        {page.name}
                      </Link>
                    ))
                  }
              </div>
              <div className="col-span-1 flex justify-end items-center">
                <HamburgerMenuIcon className="w-6 h-6 text-zinc-50" />
              </div>
            </div>
          </div>
          {isOver && (
            <div className="min-h-[300px] flex justify-center items-center w-full border border-dashed border-gray-300 p-5">
              <p className="text-gray-400 text-sm">Drop here</p>
            </div>

          )}
          {pageState?.components?.map((component, index) => {
            let Component;
            switch (component.name) {
              case "banner":
                Component = Banner;
                break;
              case "html-block":
                  Component = HtmlBlock;
                  break;
              case "register":
                Component = Register;
                break;
              case "form":
                Component = FormArea;
                break;
              default:
                  Component = function DefaultComponent() { return null; };
                  break;
              // Add more cases for other custom components
            }
    
            return (
              <div key={component.id} className="relative">
                <DraggableComponent
                  id={component.id}
                  index={index}
                  moveComponent={moveComponent}
                  setDraggingIndex={setDraggingIndex}
                  component={<Component id={component.id} />}
                />
                
                <button onClick={() => removeFormItem(component.id)} className="rotate-90 absolute z-50 right-2 bottom-5"><CrossCircledIcon className="w-6 h-6 text-red-500"/></button>
              </div>
            );
          })}
          <div className="w-full bg-zinc-900 text-zinc-100 py-2 px-3 md:px-5 px-8">
            <div className="min-h-[100px] flex items-center justify-between">
              <span>Provo</span>
              <div></div>
            </div>
          </div>
    
        </div>
        <CustomDragLayer draggingIndex={draggingIndex} />
      </div>
   
  );
}
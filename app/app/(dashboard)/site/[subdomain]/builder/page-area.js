'use client'
import { useEffect, useState, useRef } from "react";
import { useDrop } from "react-dnd";

import Banner from "./sections/public/banner";
import Hero from './sections/public/hero/index';
import HtmlBlock from './sections/public/html-block/index'
import Products from './sections/public/products/index'
import Subscribe from './sections/public/subscribe/index'

// import Subscribe from "./sections/public/subscribe/index";

// PRIVATE

import HeroImage from './sections/private/hero-image/index'
import BasicHero from './sections/private/basic-hero/index'

// EDITABLE
import EditableComponent from './editor/editable';

import DraggableComponent from "./draggable-component";
import { usePageData } from "@/providers/page-provider";
import CustomDragLayer from "./custom-drag-layer";

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

      // Only add a new component if the item being dropped is new
      setPageState((prevState) => {
        const components = [newComponent, ...prevState.components];
        const validComponents = components.filter(component => component.name);
        return {
          ...prevState,
          components: validComponents,
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


  if (!pageState) {
    <div className="w-full h-full">
      Loading!
    </div>
  }

  return (
    <div className="w-full flex flex-col overflow-x-hidden">
      <div
        className="w-full min-h-[500px] h-full overflow-hidden border border-gray-300 rounded-md mb-20 shadow-md"
        ref={dropRef}
      >
        {isOver && (
          <div className="min-h-[300px] flex justify-center items-center w-full border border-dashed border-gray-300 p-5">
            <p className="text-gray-400 text-sm">Drop here</p>
          </div>
        )}
        {pageState?.components?.map((component, index) => {
          let Component;
          switch (component.name) {
            case "hero":
              Component = Hero;
              break;
            case "banner":
              Component = Banner;
              break;
            case "products":
              Component = Products;
              break;
            case "html-block":
              Component = HtmlBlock;
              break;
            case "basic-hero":
              Component = BasicHero;
              break;
            case "hero-image":
              Component = HeroImage;
              break;
            case "subscribe":
              Component = Subscribe;
              break;
            default:
              Component = function DefaultComponent() { return null; };
              break;
            // Add more cases for other custom components
          }

          return (
            <div key={index} className="relative">
              <DraggableComponent
                id={component.id}
                index={index}
                moveComponent={moveComponent}
                setDraggingIndex={setDraggingIndex}
                component={<EditableComponent key={component.id} id={component.id} Component={Component} componentType={component.name} defaultData={component.properties} />}
              />
            </div>
          );
        })}
      </div>
      <CustomDragLayer draggingIndex={draggingIndex} />
    </div >
  );
}

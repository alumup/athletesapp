import React from "react";
import { useDrag } from "react-dnd";
import { sectionsConfig } from './sections/sections-config'; // Import the sectionsConfig
import { useParams } from "next/navigation";

// Define all sections with their access level
const allSections = [
  { name: 'banner', access: 'public' },
  { name: 'clips', access: 'public' },
  { name: 'collection', access: 'public' },
  { name: 'collections', access: 'public' },
  { name: 'episodes', access: 'public' },
  { name: 'hero', access: 'public' },
  { name: 'html-block', access: 'public' },
  { name: 'photos', access: 'public' },
  { name: 'products', access: 'public' },
  { name: 'subscribe', access: 'public' },


  // add private ones here
  { name: 'ad-banner', access: 'private'},
  { name: 'basic-hero', access: 'private' },
  { name: 'brag-board', access: 'private' },
  { name: 'collection-videos', access: 'private'},
  { name: 'hero-image', access: 'private' },
  { name: 'pricing-table', access: 'private' },

];

function PageComponent(props) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { name: props.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      className="bg-white text-gray-700 border border-gray-300 rounded-md p-3 flex justify-center"
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {props.children}
    </div>
  );
}


function Toolbar() {
  const params = useParams(); // Assuming you have useParams available
  const privateSectionsForSite = sectionsConfig[params.subdomain] || [];

  const publicSections = allSections.filter(section => section.access === 'public');
  const privateSections = allSections.filter(section =>
    section.access === 'private' && privateSectionsForSite.includes(section.name)
  );

  return (
    <div className="w-full flex flex-col space-y-5 h-[500px] overflow-y-auto">
      <h4 className="text-sm text-gray-700">Basic Sections</h4>
      {publicSections.map(section => (
        <PageComponent key={section.name} name={section.name}>
          <label>{section.name}</label>
        </PageComponent>
      ))}
      <h4 className="text-sm text-gray-700">Your Sections</h4>
      {privateSections.map(section => (
        <PageComponent key={section.name} name={section.name}>
          <label>{section.name}</label>
        </PageComponent>
      ))}
    </div>
  );
}

export default Toolbar;

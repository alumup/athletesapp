import { InlineSnippet } from "@/components/form/domain-configuration";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-10 bg-black">
      <h1 className="font-bold text-6xl text-white">
        Jumpshot®
      </h1>
      <p className="text-lg md:text-2xl font-light text-white">A CRM created to help high school coaches 
      manage and strengthen your teams, parents, and alumni base.</p>
    </div>
  );
}

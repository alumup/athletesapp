import { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="">
      <div>{children}</div>
    </div>
  );
}

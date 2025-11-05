import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "hidden items-center space-x-4 md:flex lg:space-x-6",
        className,
      )}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-zinc-900"
      >
        Overview
      </Link>
      <Link
        href="/people"
        className="text-muted-foreground text-sm font-medium transition-colors hover:text-zinc-900"
      >
        People
      </Link>
      <Link
        href="/teams"
        className="text-muted-foreground text-sm font-medium transition-colors hover:text-zinc-900"
      >
        Teams
      </Link>
      <Link
        href="/settings"
        className="text-muted-foreground text-sm font-medium transition-colors hover:text-zinc-900"
      >
        Settings
      </Link>
    </nav>
  );
}

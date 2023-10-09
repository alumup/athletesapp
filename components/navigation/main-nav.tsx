import Link from "next/link"

import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Overview
      </Link>
      <Link
        href="/people"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        People
      </Link>
      <Link
        href="/teams"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Teams
      </Link>
      <Link
        href="/sites"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Sites
      </Link>
      <Link
        href="/events"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Events
      </Link>
    </nav>
  )
}
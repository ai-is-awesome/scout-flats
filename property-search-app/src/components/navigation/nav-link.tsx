"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type NavLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  activeClassName?: string;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    const active =
      typeof href === "string" &&
      (pathname === href ||
        (href !== "/" && pathname.startsWith(`${href}/`)));

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, active && activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

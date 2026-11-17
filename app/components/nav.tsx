"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = {
  "/": {
    name: "home",
  },
  "/projects": {
    name: "projects",
  },
  "/blog": {
    name: "blog",
  },
  "/books": {
    name: "books",
  },
  "https://github.com/toliv/": {
    name: "github",
  },
  "/contact": {
    name: "contact",
  },
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Main navigation">
      {Object.entries(navItems).map(([path, { name }]) => {
        const active = pathname === path || (path !== "/" && pathname.startsWith(`${path}/`));
        return (
          <Link key={path} href={path} prefetch={false} aria-current={active ? "page" : undefined}>
            {name}
          </Link>
        );
      })}
    </nav>
  );
}

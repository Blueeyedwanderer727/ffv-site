"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActiveRoute(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav({ items }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.16em] text-green-100/70 sm:gap-3 sm:text-xs md:justify-end md:text-sm md:tracking-[0.22em]">
      {items.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`ff-link ff-nav-link rounded-full px-3 py-1.5 ${isActive ? "ff-nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
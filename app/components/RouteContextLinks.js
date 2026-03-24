"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getRouteSearchConfig(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  if (segments[0] === "lists" && segments[1]) {
    return {
      href: `/search?list=${encodeURIComponent(segments[1])}`,
      label: "Search With This List",
      detail: "Carry this ranked route into the full search console.",
    };
  }

  if (segments[0] !== "categories" && segments[0] !== "search" && segments[0] !== "fear-experiment" && segments[0] !== "quiz" && segments[0] !== "movie" && segments[0] !== "guides") {
    return {
      href: `/search?category=${encodeURIComponent(segments[0])}`,
      label: "Search This Category",
      detail: "Open the full search console with this category route already pinned.",
    };
  }

  return null;
}

export default function RouteContextLinks() {
  const pathname = usePathname();
  const config = getRouteSearchConfig(pathname);

  if (!config) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
      <Link href={config.href} className="ff-border rounded-full px-4 py-2 text-green-50/80 hover:bg-green-400/8">
        {config.label}
      </Link>
      <span className="ff-safe-wrap text-green-100/45">{config.detail}</span>
    </div>
  );
}
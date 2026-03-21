import "./globals.css";
import Link from "next/link";
import { categoryLabels, listLabels } from "./data/labels";

const categoryOrder = [
  "alien",
  "anthology",
  "cryptid",
  "cult-conspiracy",
  "haunted-location",
  "monster",
  "possession",
  "psychological",
  "screenlife",
  "serial-killer",
  "witchcraft",
  "zombie-infection",
];

const listOrder = [
  "scariest",
  "beginner-friendly",
  "top-25-most-recommended",
  "hidden-gems",
  "most-disturbing",
  "movies-that-feel-real",
];

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        {/* HEADER */}
        <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-red-500">
              Found Footage Vault
            </Link>

            {/* Simple Nav */}
            <nav className="flex gap-6 text-sm text-gray-300">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/search" className="hover:text-white">Search</Link>
              <Link href="#categories" className="hover:text-white">Categories</Link>
              <Link href="#lists" className="hover:text-white">Top Lists</Link>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main>
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-800 mt-16 py-6 text-center text-gray-500 text-sm">
          © Found Footage Vault
        </footer>

      </body>
    </html>
  );
}

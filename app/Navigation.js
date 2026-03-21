import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-neutral-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <ul className="flex gap-8 text-lg">
          <li>
            <Link href="/" className="text-white hover:text-red-400 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/#categories" className="text-white hover:text-red-400 transition-colors">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/#lists" className="text-white hover:text-red-400 transition-colors">
              Top Lists
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

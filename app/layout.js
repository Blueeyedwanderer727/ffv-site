import "./globals.css";
import Link from "next/link";
import { isAmazonAffiliateEnabled } from "./data/affiliateLinks";
import { siteDescription, siteKeywords, siteName, siteUrl } from "./data/site";
import MainNav from "./components/MainNav";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  category: "entertainment",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteName} archive card`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "apple-mobile-web-app-title": siteName,
  },
};

export const viewport = {
  themeColor: "#07110b",
  colorScheme: "dark",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/fear-experiment", label: "Fear Experiment" },
  { href: "/search", label: "Search" },
  { href: "/categories", label: "Categories" },
  { href: "/lists", label: "Lists" },
  { href: "/support", label: "Support" },
];

const footerLinks = [
  {
    title: "Search Console",
    description: "Find by title, category, vibe, archive flags, or score thresholds.",
    href: "/search",
  },
  {
    title: "Fear Experiment",
    description: "Open the quiz-driven recommendation layer and archived result routes.",
    href: "/fear-experiment",
  },
  {
    title: "Ranked Lists",
    description: "Jump into the strongest ready-to-use list surfaces without rebuilding filters.",
    href: "/lists",
  },
  {
    title: "Category Archive",
    description: "Re-enter the vault through working subgenre routes and browse from there.",
    href: "/categories",
  },
  {
    title: "Support The Vault",
    description: "Read how share unlocks and future paid tracks fit into the Fear Experiment rollout.",
    href: "/support",
  },
];

export default function RootLayout({ children }) {
  const showAffiliateDisclosure = isAmazonAffiliateEnabled();

  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
          <div className="ff-panel mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 rounded-[2rem] px-4 py-3 md:justify-between md:px-7">
            <Link href="/" className="ff-glow ff-safe-wrap text-center text-xs font-bold uppercase tracking-[0.22em] text-green-100 sm:text-sm md:text-left md:text-base md:tracking-[0.28em]">
              {siteName}
            </Link>
            <MainNav items={navItems} />
          </div>
        </header>

        {children}

        <footer className="px-4 pb-8 pt-14 md:px-6">
          <div className="ff-panel mx-auto max-w-7xl rounded-3xl px-6 py-6 md:px-7 md:py-7">
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.24em] text-green-300/65">Archive Footer</p>
                  <h2 className="ff-safe-wrap text-xl font-semibold text-green-50 md:text-2xl">Operational Recovery Routes</h2>
                </div>
                <p className="max-w-2xl text-sm text-green-100/58">
                  Keep the strongest archive surfaces reachable from anywhere: search, recommendation flows, ranked lists, and category entry points.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {footerLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="ff-border rounded-2xl bg-black/20 p-4 transition hover:-translate-y-1 hover:bg-green-400/8"
                  >
                    <div className="ff-safe-wrap mb-2 text-base font-semibold text-green-50">{item.title}</div>
                    <p className="ff-safe-wrap text-sm text-green-100/56">{item.description}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-green-300/10 pt-4 text-sm text-green-100/58">
                <p>{siteName}</p>
                <p>Fear rankings, archive routes, live search surfaces, and recommendation experiments.</p>
              </div>
            </>

            {showAffiliateDisclosure ? (
              <div className="mt-3 text-xs text-green-100/42">
                Affiliate disclosure: some Amazon links on this site may earn Found Footage Vault a commission.
              </div>
            ) : null}
          </div>
        </footer>
      </body>
    </html>
  );
}

const publicHoldRewriteSources = [
  "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|coming-soon).*)",
];

function getConfiguredLaunchMode() {
	const launchMode = process.env.FFV_LAUNCH_MODE?.trim().toLowerCase();

	if (launchMode === "locked" || launchMode === "open") {
		return launchMode;
	}

	return "auto";
}

function getPublicHoldRewrites() {
	if (getConfiguredLaunchMode() === "open") {
		return [];
	}

  return publicHoldRewriteSources.flatMap((source) => [
    {
      source,
      has: [{ type: "host", value: "foundfootagevault.com" }],
      destination: "/coming-soon",
    },
    {
      source,
      has: [{ type: "host", value: "www.foundfootagevault.com" }],
      destination: "/coming-soon",
    },
  ]);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
			},
		],
	},
	async rewrites() {
		return {
			beforeFiles: getPublicHoldRewrites(),
		};
	},
};

module.exports = nextConfig;

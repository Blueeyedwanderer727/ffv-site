# Found Footage Vault

Found Footage Vault is a Next.js App Router site for found footage horror discovery. It ships with searchable movie data, category routes, ranked lists, a quiz-driven recommendation flow, and individual movie case-file pages.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from `.env.example`.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Environment Variables

The following variables are supported:

- `NEXT_PUBLIC_SITE_URL`: canonical production origin used for metadata, sitemap, and robots output.
- `FFV_LAUNCH_MODE`: server-side launch gate for the public site. Use `locked` to force the coming-soon page, `open` to force the full site, or `auto` to lock all non-localhost hosts while keeping localhost open.
- `NEXT_PUBLIC_ENABLE_AMAZON_AFFILIATE`: set to `true` to show Amazon affiliate disclosure and links.
- `NEXT_PUBLIC_AMAZON_AFFILIATE_TAG`: Amazon affiliate tag used when affiliate links are enabled.
- `TMDB_API_READ_ACCESS_TOKEN`: preferred TMDB read token for archive comparison scripts and homepage trailer playback.
- `TMDB_API_KEY`: fallback TMDB API key for archive comparison scripts and homepage trailer playback.

Create a `.env.local` file from `.env.example` to enable live TMDB-backed trailer lookup locally. If neither TMDB value is present, the homepage monitor now falls back to a built-in backup playlist for the curated homepage channels and labels that state in the UI.

## Production Checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the final production domain.
2. Set `FFV_LAUNCH_MODE=locked` while the public domain should show only the coming-soon page.
3. Run `npm run validate:movies` after adding or editing titles.
4. Run `npm run build` before deploy.
5. Verify `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` on the deployed site.
6. If affiliate links are enabled, confirm the disclosure copy appears in the footer.
7. When you are ready to open the full site publicly, change `FFV_LAUNCH_MODE` to `open` in production and redeploy.

## Adding More Movies Before Launch

You can keep expanding the archive before launch. The safe workflow is:

1. Add or update entries in the chunk files under `app/data/movies/`.
2. Treat `app/data/movies.js` as the barrel that re-exports the full archive.
3. Run `npm run split:movies` after larger editing passes if you want the chunk sizes re-balanced.
4. Run `npm run validate:movies` to catch duplicate slugs, invalid categories or list keys, bad score ranges, and missing required fields.
5. Run `npm run build` to confirm the site still ships cleanly.

`npm run build` now runs the movie validator automatically through `prebuild`, so bad data gets stopped before a production build.

## Comparing Against TMDB

To compare the current archive with TMDB candidate titles tagged as found footage:

1. Add `TMDB_API_READ_ACCESS_TOKEN` or `TMDB_API_KEY` to your local environment.
2. Run `npm run compare:tmdb-found-footage`.
3. Review the generated JSON report at `reports/tmdb-found-footage-report.json`.
4. Review the generated CSV shortlist at `reports/tmdb-found-footage-report.csv` for a spreadsheet-friendly list of missing titles.

The script resolves the TMDB keyword for `found footage`, fetches keyword matches from TMDB, compares them to the local archive by TMDB id and title/year, and lists titles that are still missing from the site dataset. The JSON file keeps the full comparison details, while the CSV file is the faster shortlist for triaging what to add next.

## Scripts

- `npm run dev`: start the development server.
- `npm run split:movies`: re-balance the chunked movie dataset files.
- `npm run validate:movies`: validate the movie dataset before launch or deploy.
- `npm run compare:tmdb-found-footage`: compare the local archive against TMDB found-footage keyword candidates.
- `npm run build`: create a production build.
- `npm run start`: run the production server.
- `npm run lint`: run ESLint.
# Spreadsheet Cleanup Checklist

Date: 2026-03-24

Current import status:
- The importer now skips invalid rows instead of poisoning the dataset.
- The current dataset validates and builds successfully with 277 movies.
- The next source-data step is cleaning the spreadsheet rows below so they can be imported safely.

## Rows currently excluded or overridden

### 1. 21 Days
- Source TMDB id: `46832`
- Current row problem: the row points at a 1940 crime film, not a found-footage horror title.
- Evidence: synopsis is about a blackmail killing and a man facing the gallows.
- Recommended spreadsheet fix: replace the TMDB match with the intended found-footage title, or delete the row if it should not be in the database.

### 2. Dark Mountain
- Source TMDB id: `103187`
- Current row problem: the row points at a 1944 crime drama, not the 2013 found-footage movie.
- Evidence: synopsis describes a woman hiding from her gangster husband with help from a park ranger.
- Recommended spreadsheet fix: replace with the correct 2013 film metadata and TMDB id, or remove the row.

### 3. Devil's Pass
- Source TMDB id: `396972`
- Current row problem: the row points at a 1959 Afghan drama, not the 2013 Dyatlov Pass found-footage film.
- Evidence: synopsis is about Rahim traveling to Kabul with Azrael.
- Recommended spreadsheet fix: replace with the correct 2013 film metadata and TMDB id.

### 4. Rash
- Source TMDB id: `1570511`
- Current row problem: year and release date are blank.
- Evidence: the row has no importable year fields.
- Recommended spreadsheet fix: add a valid release date or year. If this is not a finished or real title, remove it.

### 5. The Cutting Room
- Source TMDB id: `1236959`
- Current row problem: year and release date are blank, and the synopsis does not read like a found-footage horror movie.
- Evidence: the synopsis is about deleted fictional characters living together in a trailer park.
- Recommended spreadsheet fix: verify this title is intended. If yes, add correct year and confirm the TMDB match. Otherwise remove it.

### 6. Archive 81
- Source TMDB id: blank
- Current row problem: no TMDB id, no runtime, no poster path, and no synopsis.
- Evidence: the movie URL is empty and the overview field is blank.
- Recommended spreadsheet fix: either remove it because it is not a movie entry, or replace it with a real movie record that has complete movie metadata.

### 7. Black Ops
- Source TMDB id: `1275051`
- Current row problem: synopsis is blank and runtime is `0`.
- Evidence: the overview field is empty.
- Recommended spreadsheet fix: confirm this is the intended title and add a usable synopsis. If the match is wrong, replace the TMDB id.

### 8. Blair Witch Mountain Project
- Source TMDB id: `637390`
- Current row problem: blank year fields and the TMDB match is clearly wrong.
- Evidence: synopsis is about the Disney aliens from `Escape to Witch Mountain`.
- Recommended spreadsheet fix: replace with the intended found-footage title or delete the row.

### 9. REC
- Source TMDB id: `1533683`
- Current row problem: title collision with the canonical 2007 `REC`.
- Evidence: this row is a 2025 Turkish short with a surveillance-paranoia synopsis.
- Current site behavior: this row is excluded during import and a curated manual `REC (2007)` record is injected instead.
- Recommended spreadsheet fix: rename this row if you want to keep the 2025 short, or remove it if the sheet should only represent the canonical horror movie.

## Cleanup categories

Wrong TMDB match:
- `21 Days`
- `Dark Mountain`
- `Devil's Pass`
- `Blair Witch Mountain Project`
- `REC`

Missing year or release date:
- `Rash`
- `The Cutting Room`
- `Blair Witch Mountain Project`

Missing synopsis or unusable movie metadata:
- `Archive 81`
- `Black Ops`

## After spreadsheet fixes

Run the refresh pipeline from the repo root:

```powershell
node scripts/generate-movies.js
node scripts/split-movies-dataset.mjs
npm run validate:movies
npm run build
```

Expected success condition:
- No skipped records that represent titles you still want on the site.
- Validation passes.
- Build passes.
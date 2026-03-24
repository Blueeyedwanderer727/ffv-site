import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { movies } from "../app/data/movies.js";

const chunkSize = 40;
const outputDirectory = path.join(process.cwd(), "app", "data", "movies");
const barrelFilePath = path.join(process.cwd(), "app", "data", "movies.js");

async function main() {
  await fs.mkdir(outputDirectory, { recursive: true });

  const existingEntries = await fs.readdir(outputDirectory, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    existingEntries
      .filter((entry) => entry.isFile() && /^chunk-\d+\.js$/i.test(entry.name))
      .map((entry) => fs.unlink(path.join(outputDirectory, entry.name))),
  );

  const chunks = [];

  for (let index = 0; index < movies.length; index += chunkSize) {
    chunks.push(movies.slice(index, index + chunkSize));
  }

  await Promise.all(
    chunks.map((chunk, index) => {
      const chunkNumber = String(index + 1).padStart(2, "0");
      const exportName = `moviesChunk${chunkNumber}`;
      const filePath = path.join(outputDirectory, `chunk-${chunkNumber}.js`);
      const fileContents = `export const ${exportName} = ${JSON.stringify(chunk, null, 2)};\n`;
      return fs.writeFile(filePath, fileContents, "utf8");
    }),
  );

  const barrelImports = chunks
    .map((_, index) => {
      const chunkNumber = String(index + 1).padStart(2, "0");
      return `import { moviesChunk${chunkNumber} } from "./movies/chunk-${chunkNumber}.js";`;
    })
    .join("\n");

  const barrelExports = chunks
    .map((_, index) => `  ...moviesChunk${String(index + 1).padStart(2, "0")},`)
    .join("\n");

  const barrelContents = `${barrelImports}\n\nexport const movies = [\n${barrelExports}\n];\n`;
  await fs.writeFile(barrelFilePath, barrelContents, "utf8");

  console.log(`Wrote ${chunks.length} movie chunks to ${outputDirectory}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

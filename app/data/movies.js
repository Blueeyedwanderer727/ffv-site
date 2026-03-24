import { moviesChunk01 } from "./movies/chunk-01.js";
import { moviesChunk02 } from "./movies/chunk-02.js";
import { moviesChunk03 } from "./movies/chunk-03.js";
import { moviesChunk04 } from "./movies/chunk-04.js";
import { moviesChunk05 } from "./movies/chunk-05.js";
import { moviesChunk06 } from "./movies/chunk-06.js";
import { moviesChunk07 } from "./movies/chunk-07.js";

export const movies = [
  ...moviesChunk01,
  ...moviesChunk02,
  ...moviesChunk03,
  ...moviesChunk04,
  ...moviesChunk05,
  ...moviesChunk06,
  ...moviesChunk07,
];

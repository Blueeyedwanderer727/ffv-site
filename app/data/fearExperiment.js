import { buildQuizHref, buildSearchHrefForQuiz, getQuizResultsForMode } from "./quiz";

export const fearExperimentQuizModes = ["fear-profile", "personality", "survival", "disturbance", "subgenre", "intensity"];

export const fearExperimentLockedModes = ["subgenre", "intensity"];

export const fearExperimentProfiles = [
  {
    slug: "gateway-observer",
    title: "The Gateway Observer",
    description: "Grounded, slow-burn gateway picks for people who want the genre to feel real before it gets mean.",
    archetype: "You want dread and realism without being thrown into the deep end immediately.",
    categoryStyle: "Psychological, haunted-location, and realism-heavy crossover titles tend to work best here.",
    youMayBeInto: ["slow-burn grief horror", "documentary-style hauntings", "gateway realism"],
    mode: "simple",
    answers: {
      scareLevel: "low",
      realismMode: "realistic",
      pace: "slow-burn",
      beginnerMode: "beginner-friendly",
      discoveryMode: "classic",
    },
  },
  {
    slug: "dread-archivist",
    title: "The Dread Archivist",
    description: "Layered, realistic, medium-intensity picks for viewers who like investigations, lore, and creeping unease.",
    archetype: "You like a movie that keeps unfolding after the first scare hits.",
    categoryStyle: "Psychological, cult-conspiracy, and documentary-investigation titles usually land hardest here.",
    youMayBeInto: ["occult investigations", "layered mockumentaries", "paranoid realism"],
    mode: "simple",
    answers: {
      scareLevel: "medium",
      realismMode: "realistic",
      pace: "slow-burn",
      beginnerMode: "no-limits",
      discoveryMode: "hidden-gem",
    },
  },
  {
    slug: "midnight-damage-run",
    title: "The Midnight Damage Run",
    description: "High-intensity, faster, supernatural-leaning picks for nights when you want the site to stop being polite.",
    archetype: "You are not asking for comfort. You are asking for damage.",
    categoryStyle: "Possession, screenlife chaos, and higher-punishment hidden gems tend to dominate this lane.",
    youMayBeInto: ["occult punishment", "relentless escalation", "hidden-gem damage"],
    mode: "simple",
    answers: {
      scareLevel: "high",
      realismMode: "supernatural",
      pace: "relentless",
      beginnerMode: "no-limits",
      discoveryMode: "hidden-gem",
    },
  },
];

export function getFearExperimentProfileBySlug(slug) {
  return fearExperimentProfiles.find((profile) => profile.slug === slug) || null;
}

export function getFearExperimentResultsHref(profile) {
  const href = new URL(buildQuizHref(profile.mode, profile.answers, "/fear-experiment/results"), "https://vault.local");
  href.searchParams.set("profile", profile.slug);
  return `${href.pathname}${href.search}`;
}

export function getFearExperimentQuizHref(profile) {
  return buildQuizHref(profile.mode, profile.answers, "/fear-experiment/quiz");
}

export function getFearExperimentSearchHref(profile) {
  return buildSearchHrefForQuiz(profile.mode, profile.answers);
}

export function getFearExperimentPreview(profile, limit = 3) {
  return getQuizResultsForMode(profile.mode, profile.answers).slice(0, limit);
}
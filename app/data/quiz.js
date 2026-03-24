import { categoryLabels, listLabels } from "./labels";
import { getDisturbingLevel, getListKeysForMovie, getRecommendationScore } from "./listRankings";
import {
  expandedOptionLabels,
  expandedQuestionLabels,
  expandedQuizModeIds,
  expandedQuizModeMeta,
  getExpandedQuizOutcome,
  getExpandedQuizQuestionsForMode,
  getExpandedQuizResultsForMode,
  getExpandedQuizSearchHref,
} from "./quizExpansion";
import { buildSearchHref } from "./searchFilters";
import { movies } from "./movies";

const optionLabels = {
  scareLevel: {
    low: "Keep it light",
    medium: "Give me solid scares",
    high: "I want a hard hit",
    extreme: "Absolutely wreck me",
  },
  pace: {
    "slow-burn": "Slow-burn dread",
    balanced: "A steady build",
    relentless: "Fast and relentless",
  },
  realism: {
    low: "Stylized over grounded",
    medium: "Somewhat grounded",
    high: "Feels uncomfortably real",
  },
  threat: {
    haunting: "Ghosts and hauntings",
    possession: "Possession and exorcism",
    infection: "Infection and body horror",
    monster: "Monsters or cryptids",
    curse: "Curses and occult fallout",
    cult: "Cults and human evil",
    "unseen-witch": "Unseen witch terror",
    "demonic-entity": "Demonic entities",
    "multiple-threats": "A mix of threats",
  },
  setting: {
    house: "A house",
    woods: "Deep woods",
    asylum: "An asylum",
    city: "A city",
    "digital-space": "Online / screen space",
    "apartment-building": "An apartment building",
    "haunted-attraction": "A haunted attraction",
    "multiple-locations": "Multiple locations",
    church: "A church",
    compound: "A remote compound",
    catacombs: "Underground catacombs",
    "coastal-town": "A coastal town",
    "rural-house": "A rural house",
    "desert-town": "A desert town",
  },
  format: {
    camcorder: "Camcorder footage",
    documentary: "Straight documentary",
    "documentary-investigation": "Investigation documentary",
    "documentary-mix": "Mixed documentary footage",
    "ghost-hunting-show": "Ghost-hunting show",
    "home-surveillance": "Home surveillance",
    livestream: "Livestream chaos",
    screenlife: "Screenlife",
    "news-camera": "News camera",
    "party-camcorder": "Party camcorder",
    "expedition-camcorder": "Exploration footage",
    "travel-documentary": "Travel documentary",
    "mockumentary-photo-evidence": "Mockumentary with evidence archives",
    "anthology-tapes": "Anthology tape format",
  },
  vibe: {
    bleak: "Bleak and hopeless",
    minimalist: "Minimalist and stripped down",
    paranoid: "Paranoid and uneasy",
    creepy: "Creepy and eerie",
    chaotic: "Chaotic and frantic",
    intense: "Intense and punishing",
    disturbing: "Disturbing and nasty",
    modern: "Modern and digital",
    claustrophobic: "Claustrophobic",
    occult: "Occult and ritual-heavy",
    tragic: "Tragic and sad",
    layered: "Layered and investigative",
    funny: "Funny with scares",
    grim: "Grim and serious",
    unsettling: "Quietly unsettling",
    immediate: "Immediate and reactive",
    spectacle: "Big-scale spectacle",
    urgent: "Urgent survival",
    domestic: "Domestic dread",
    grounded: "Grounded and plausible",
    naturalistic: "Naturalistic",
    wild: "Wild and unpredictable",
    mean: "Mean-spirited",
    religious: "Religious dread",
  },
};

const optionOrder = {
  scareLevel: ["low", "medium", "high", "extreme"],
  pace: ["slow-burn", "balanced", "relentless"],
  realism: ["low", "medium", "high"],
};

const recommendationIgnoredTags = new Set([
  "found-footage",
  "found-footage-style",
  "quiz-core",
  "quiz-starter",
  "quiz-batch-2",
]);

const realisticCategories = new Set(["psychological", "screenlife", "serial-killer", "cult-conspiracy"]);
const supernaturalCategories = new Set(["haunted-location", "possession", "witchcraft", "monster"]);
const realisticTags = new Set(["documentary", "camcorder", "analog", "human-threat", "screenlife", "pseudo-documentary"]);
const supernaturalTags = new Set(["ghosts", "occult", "supernatural", "demon", "curse", "witchcraft", "haunting", "possession"]);
const supernaturalThreats = new Set(["haunting", "possession", "curse", "unseen-witch", "demonic-entity", "monster"]);

const questionConfig = [
  {
    id: "scareLevel",
    prompt: "How intense do you want this to be?",
    description: "Choose your damage level.",
  },
  {
    id: "pace",
    prompt: "What pacing sounds right tonight?",
    description: "Some nights need a crawl, others need a sprint.",
  },
  {
    id: "realism",
    prompt: "How grounded should it feel?",
    description: "Pick whether you want plausibility or distance.",
  },
  {
    id: "threat",
    prompt: "What kind of threat do you want most?",
    description: "This steers the strongest match weighting.",
  },
  {
    id: "setting",
    prompt: "Where do you want the nightmare to happen?",
    description: "Setting often decides the whole mood.",
  },
  {
    id: "format",
    prompt: "What footage style are you in the mood for?",
    description: "Choose the presentation style you want the movie built around.",
  },
  {
    id: "vibe",
    prompt: "What overall vibe are you chasing?",
    description: "This helps break ties between otherwise similar movies.",
  },
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getMovieTags(movie) {
  return unique(movie?.tags || []);
}

function hasAnyTag(movie, tags) {
  const movieTags = new Set(getMovieTags(movie));
  return tags.some((tag) => movieTags.has(tag));
}

function getPrimaryCategory(movie) {
  return Array.isArray(movie?.categories) ? movie.categories[0] : undefined;
}

function getSortIndex(type, value) {
  const explicitOrder = optionOrder[type] || [];
  const index = explicitOrder.indexOf(value);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortOptions(type, values) {
  return [...values].sort((left, right) => {
    const leftIndex = getSortIndex(type, left);
    const rightIndex = getSortIndex(type, right);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return formatQuizOptionLabel(type, left).localeCompare(formatQuizOptionLabel(type, right));
  });
}

export function formatQuizOptionLabel(type, value) {
  if (expandedOptionLabels[type]?.[value]) {
    return expandedOptionLabels[type][value];
  }
  return optionLabels[type]?.[value] || value.replace(/-/g, " ");
}

export function formatQuizQuestionLabel(questionId) {
  if (expandedQuestionLabels[questionId]) {
    return expandedQuestionLabels[questionId];
  }
  if (questionId === "scareLevel") return "Scare Level";
  if (questionId === "pace") return "Pace";
  if (questionId === "realism") return "Realism";
  if (questionId === "threat") return "Threat";
  if (questionId === "setting") return "Setting";
  if (questionId === "format") return "Format";
  if (questionId === "vibe") return "Vibe";

  return questionId.charAt(0).toUpperCase() + questionId.slice(1);
}

export const quizModeCatalog = {
  personality: expandedQuizModeMeta.personality,
  "fear-profile": expandedQuizModeMeta["fear-profile"],
  survival: expandedQuizModeMeta.survival,
  disturbance: expandedQuizModeMeta.disturbance,
  subgenre: expandedQuizModeMeta.subgenre,
  simple: {
    id: "simple",
    eyebrow: "Archive Utility",
    title: "Utility-01: Night Watch Selector",
    description: "A fast starter quiz that points you toward the right watch without needing a full trait profile.",
    resultLabel: "Quick Match",
    labCode: "UTL-01",
    alias: "Watch Selector",
    icon: "NW",
    signalWords: ["starter", "quick", "watch"],
    visualClass: "border-green-300/20 bg-[linear-gradient(135deg,rgba(87,171,118,0.18),rgba(8,18,11,0.92)_72%)]",
    stampClass: "border-green-300/25 bg-green-300/10 text-green-50/88",
    posterToneClass: "quiz-poster-selector",
    posterWarning: "Night Selector",
    posterSubtitle: "Fast-entry watch recommendation",
    posterMarks: ["quick", "night", "match"],
  },
  intensity: {
    id: "intensity",
    eyebrow: "Classified Track",
    title: "Lab-06: Exposure Ramp Test",
    description: "Steers between gateway picks, balanced fear, and high-punishment recommendations.",
    resultLabel: "Intensity Match",
    labCode: "LAB-06",
    alias: "Exposure Ramp",
    icon: "ER",
    signalWords: ["escalation", "exposure", "ramp"],
    visualClass: "border-rose-300/20 bg-[linear-gradient(135deg,rgba(185,102,102,0.20),rgba(20,8,8,0.92)_72%)]",
    stampClass: "border-rose-300/30 bg-rose-300/10 text-rose-50/92",
    posterToneClass: "quiz-poster-exposure",
    posterWarning: "Exposure Ramp",
    posterSubtitle: "Intensity ladder and escalation chart",
    posterMarks: ["ramp", "dose", "impact"],
  },
  traits: {
    id: "traits",
    eyebrow: "Archive Utility",
    title: "Utility-02: Full Trait Crossmatch",
    description: "Uses the full vault trait profile for a more detailed recommendation match.",
    resultLabel: "Trait Match",
    labCode: "UTL-02",
    alias: "Crossmatch",
    icon: "XM",
    signalWords: ["traits", "crossmatch", "vault"],
    visualClass: "border-sky-300/20 bg-[linear-gradient(135deg,rgba(93,146,190,0.20),rgba(8,12,20,0.92)_72%)]",
    stampClass: "border-sky-300/30 bg-sky-300/10 text-sky-50/92",
    posterToneClass: "quiz-poster-crossmatch",
    posterWarning: "Trait Crossmatch",
    posterSubtitle: "Full vault profile correlation",
    posterMarks: ["traits", "vault", "crossmatch"],
  },
};

export function getQuizModeMeta(mode) {
  return quizModeCatalog[mode] || null;
}

export function getQuizQuestionsForMode(mode) {
  const expandedQuestions = getExpandedQuizQuestionsForMode(mode);
  if (expandedQuestions) {
    return expandedQuestions;
  }
  if (mode === "simple") {
    return simpleQuizQuestions;
  }
  if (mode === "intensity") {
    return intensityQuizQuestions;
  }
  if (mode === "traits") {
    return quizQuestions;
  }
  return [];
}

export function getValidQuizMode(mode) {
  return [...expandedQuizModeIds, "simple", "traits", "intensity"].includes(mode) ? mode : null;
}

export function getQuizAnswersFromSource(source, questions) {
  const nextAnswers = {};

  for (const question of questions) {
    const value = typeof source?.get === "function" ? source.get(question.id) : source?.[question.id];
    if (question.options.includes(value)) {
      nextAnswers[question.id] = value;
    }
  }

  return nextAnswers;
}

export function getQuizAnswersFromPrefixedSource(source, questions, prefix) {
  const nextAnswers = {};

  for (const question of questions) {
    const key = `${prefix}${question.id}`;
    const value = typeof source?.get === "function" ? source.get(key) : source?.[key];
    if (question.options.includes(value)) {
      nextAnswers[question.id] = value;
    }
  }

  return nextAnswers;
}

export function buildQuizQuery(mode, answers, questions = getQuizQuestionsForMode(mode)) {
  const params = new URLSearchParams();

  if (!mode) {
    return "";
  }

  params.set("mode", mode);

  for (const question of questions) {
    const value = answers?.[question.id];
    if (question.options.includes(value)) {
      params.set(question.id, value);
    }
  }

  return params.toString();
}

export function buildQuizHref(mode, answers, basePath = "/quiz", questions = getQuizQuestionsForMode(mode)) {
  const query = buildQuizQuery(mode, answers, questions);
  return query ? `${basePath}?${query}` : basePath;
}

export function appendQuizContextToSearchParams(params, mode, answers, questions = getQuizQuestionsForMode(mode), prefix = "quiz_") {
  if (!mode) {
    return params;
  }

  params.set("quizMode", mode);

  for (const question of questions) {
    const value = answers?.[question.id];
    if (question.options.includes(value)) {
      params.set(`${prefix}${question.id}`, value);
    }
  }

  return params;
}

export function buildSearchHrefForQuiz(mode, answers = {}) {
  if (expandedQuizModeIds.includes(mode)) {
    return getExpandedQuizSearchHref(mode, answers);
  }

  if (mode === "simple") {
    const filters = {};

    if (answers.scareLevel === "low") {
      filters.maxScore = 7;
    } else if (answers.scareLevel === "medium") {
      filters.minScore = 6;
      filters.maxScore = 8.2;
    } else if (answers.scareLevel === "high") {
      filters.minScore = 7.8;
      filters.minDisturbingScore = 7;
    }

    if (answers.realismMode === "realistic") {
      filters.minRealismScore = 7.5;
      filters.listKey = "movies-that-feel-real";
    }

    if (answers.pace === "slow-burn") {
      filters.tags = ["slow-burn"];
    } else if (answers.pace === "relentless") {
      filters.minFearIndex = 7;
    }

    if (answers.beginnerMode === "beginner-friendly") {
      filters.beginnerFriendly = true;
    }

    if (answers.discoveryMode === "hidden-gem") {
      filters.hiddenGem = true;
    } else if (answers.discoveryMode === "classic") {
      filters.listKey = filters.listKey || "top-25-most-recommended";
    }

    const href = new URL(buildSearchHref(filters), "https://vault.local");
    appendQuizContextToSearchParams(href.searchParams, mode, answers);
    return `${href.pathname}${href.search}`;
  }

  if (mode === "intensity") {
    const filters = {};

    if (answers.comfort === "gateway") {
      filters.beginnerFriendly = true;
      filters.maxScore = 7.2;
    } else if (answers.comfort === "balanced") {
      filters.minScore = 6;
      filters.maxScore = 8.2;
    } else if (answers.comfort === "extreme") {
      filters.minScore = 8;
      filters.minDisturbingScore = 8;
      filters.minFearIndex = 8;
    }

    if (answers.realismStyle === "grounded") {
      filters.minRealismScore = 8;
      filters.listKey = "movies-that-feel-real";
    }

    if (answers.discoveryStyle === "hidden-gem") {
      filters.hiddenGem = true;
    } else if (answers.discoveryStyle === "essential") {
      filters.listKey = filters.listKey || "top-25-most-recommended";
    }

    if (answers.pace === "slow-burn") {
      filters.tags = ["slow-burn"];
    } else if (answers.pace === "relentless") {
      filters.minFearIndex = Math.max(filters.minFearIndex || 0, 7);
    }

    const href = new URL(buildSearchHref(filters), "https://vault.local");
    appendQuizContextToSearchParams(href.searchParams, mode, answers);
    return `${href.pathname}${href.search}`;
  }

  if (mode === "traits") {
    const filters = {};

    if (answers.scareLevel === "low") {
      filters.maxScore = 6.2;
    } else if (answers.scareLevel === "medium") {
      filters.minScore = 5.8;
      filters.maxScore = 7.8;
    } else if (answers.scareLevel === "high") {
      filters.minScore = 7.4;
    } else if (answers.scareLevel === "extreme") {
      filters.minScore = 8.4;
      filters.minDisturbingScore = 8;
      filters.minFearIndex = 8;
    }

    if (answers.realism === "high") {
      filters.minRealismScore = 8;
      filters.listKey = "movies-that-feel-real";
    } else if (answers.realism === "medium") {
      filters.minRealismScore = 5.5;
      filters.maxRealismScore = 8.4;
    } else if (answers.realism === "low") {
      filters.maxRealismScore = 6.4;
    }

    const tags = [];
    if (answers.pace === "slow-burn") {
      tags.push("slow-burn");
    }
    if (answers.vibe) {
      tags.push(answers.vibe);
    }

    const threatCategoryMap = {
      haunting: "haunted-location",
      possession: "possession",
      infection: "zombie-infection",
      monster: "monster",
      cult: "cult-conspiracy",
      "unseen-witch": "witchcraft",
    };

    const threatTagMap = {
      curse: "curse",
      "demonic-entity": "demon",
      "multiple-threats": "anthology",
    };

    if (answers.threat && threatCategoryMap[answers.threat]) {
      filters.category = threatCategoryMap[answers.threat];
    } else if (answers.threat && threatTagMap[answers.threat]) {
      tags.push(threatTagMap[answers.threat]);
    }

    const formatTagMap = {
      screenlife: "screenlife",
      livestream: "livestream",
      camcorder: "camcorder",
      documentary: "documentary",
      "documentary-investigation": "investigation",
      "ghost-hunting-show": "ghost-hunters",
      "anthology-tapes": "anthology",
      "mockumentary-photo-evidence": "mockumentary",
    };

    if (answers.format && formatTagMap[answers.format]) {
      tags.push(formatTagMap[answers.format]);
    }

    filters.tags = [...new Set(tags)].slice(0, 3);
    const href = new URL(buildSearchHref(filters), "https://vault.local");
    appendQuizContextToSearchParams(href.searchParams, mode, answers);
    return `${href.pathname}${href.search}`;
  }

  const href = new URL(buildSearchHref(), "https://vault.local");
  appendQuizContextToSearchParams(href.searchParams, mode, answers);
  return `${href.pathname}${href.search}`;
}

function inferScareLevel(movie) {
  if ((movie.scareScore || 0) >= 8.6 || getDisturbingLevel(movie) >= 8.5) {
    return "extreme";
  }
  if ((movie.scareScore || 0) >= 7.4 || getDisturbingLevel(movie) >= 7.5) {
    return "high";
  }
  if ((movie.scareScore || 0) >= 5.8) {
    return "medium";
  }
  return "low";
}

function inferPace(movie) {
  if (hasAnyTag(movie, ["slow-burn", "minimalist", "layered", "creeping-dread", "bleak-ending"])) {
    return "slow-burn";
  }
  if (hasAnyTag(movie, ["chaotic", "urgent", "relentless", "escalating", "fast-runtime", "survival-run"])) {
    return "relentless";
  }
  if ((movie.scareScore || 0) >= 8.2 || getDisturbingLevel(movie) >= 8.2) {
    return "relentless";
  }
  return "balanced";
}

function inferRealism(movie) {
  if ((movie.realismScore || 0) >= 8.2) {
    return "high";
  }
  if ((movie.realismScore || 0) >= 6.4) {
    return "medium";
  }
  return "low";
}

function inferThreat(movie) {
  const primaryCategory = getPrimaryCategory(movie);

  if (primaryCategory === "possession" || hasAnyTag(movie, ["possession", "exorcism"])) {
    return "possession";
  }
  if (primaryCategory === "zombie-infection" || hasAnyTag(movie, ["infection", "zombie", "body-horror", "quarantine"])) {
    return "infection";
  }
  if (primaryCategory === "witchcraft" || hasAnyTag(movie, ["witchcraft", "folk-horror", "unseen-witch"])) {
    return "unseen-witch";
  }
  if (primaryCategory === "monster" || hasAnyTag(movie, ["monster", "cryptid", "creature", "aliens"])) {
    return "monster";
  }
  if (primaryCategory === "cult-conspiracy" || primaryCategory === "serial-killer" || hasAnyTag(movie, ["cult", "killer", "serial-killer", "human-threat", "psychopath", "stalker"])) {
    return "cult";
  }
  if (primaryCategory === "haunted-location" || hasAnyTag(movie, ["ghosts", "haunting", "paranormal", "haunted-house"])) {
    return "haunting";
  }
  if (hasAnyTag(movie, ["curse", "occult", "ritual", "demon"])) {
    return "curse";
  }
  return "multiple-threats";
}

function inferSetting(movie) {
  const primaryCategory = getPrimaryCategory(movie);

  if (primaryCategory === "screenlife" || hasAnyTag(movie, ["screenlife", "computer-screen", "digital-haunting"])) {
    return "digital-space";
  }
  if (hasAnyTag(movie, ["haunted-attraction", "clown-mannequins"])) {
    return "haunted-attraction";
  }
  if (hasAnyTag(movie, ["asylum", "hospital", "haunted-hospital"])) {
    return "asylum";
  }
  if (hasAnyTag(movie, ["apartment-block", "apartment", "tower-block"])) {
    return "apartment-building";
  }
  if (hasAnyTag(movie, ["church", "religious"])) {
    return "church";
  }
  if (hasAnyTag(movie, ["compound", "commune"])) {
    return "compound";
  }
  if (hasAnyTag(movie, ["catacombs", "caves", "tunnels"])) {
    return "catacombs";
  }
  if (hasAnyTag(movie, ["coastal-town", "beach", "ocean", "waterfront"])) {
    return "coastal-town";
  }
  if (hasAnyTag(movie, ["desert-town", "desert"])) {
    return "desert-town";
  }
  if (hasAnyTag(movie, ["woods", "forest", "camping", "wilderness"])) {
    return "woods";
  }
  if (hasAnyTag(movie, ["city", "urban", "downtown"])) {
    return "city";
  }
  if (hasAnyTag(movie, ["home", "house", "homes", "cabin", "rural", "suburban-house"])) {
    return primaryCategory === "possession" || hasAnyTag(movie, ["rural", "farm", "barn"]) ? "rural-house" : "house";
  }
  return "multiple-locations";
}

function inferFormat(movie) {
  const primaryCategory = getPrimaryCategory(movie);

  if (primaryCategory === "screenlife" || hasAnyTag(movie, ["screenlife", "computer-screen"])) {
    return "screenlife";
  }
  if (hasAnyTag(movie, ["livestream", "streamer", "live-broadcast"])) {
    return "livestream";
  }
  if (hasAnyTag(movie, ["news-footage", "reporter", "journalism", "broadcast"])) {
    return "news-camera";
  }
  if (hasAnyTag(movie, ["ghost-hunters", "ghost-hunting-show"])) {
    return "ghost-hunting-show";
  }
  if (hasAnyTag(movie, ["home-surveillance", "security-camera"])) {
    return "home-surveillance";
  }
  if (hasAnyTag(movie, ["mockumentary", "photo-evidence"])) {
    return "mockumentary-photo-evidence";
  }
  if (primaryCategory === "anthology" || hasAnyTag(movie, ["anthology", "tapes"])) {
    return "anthology-tapes";
  }
  if (hasAnyTag(movie, ["documentary-investigation", "interviews", "investigation"])) {
    return "documentary-investigation";
  }
  if (hasAnyTag(movie, ["documentary", "pseudo-documentary", "docufiction"])) {
    return "documentary";
  }
  if (hasAnyTag(movie, ["camcorder", "video-tape", "pov", "found-footage-adjacent"])) {
    return "camcorder";
  }
  return "documentary-mix";
}

function inferVibe(movie) {
  const vibes = [];

  if (hasAnyTag(movie, ["slow-burn", "minimalist", "analog"])) {
    vibes.push("minimalist");
  }
  if (hasAnyTag(movie, ["bleak", "tragic", "grief"])) {
    vibes.push("bleak");
  }
  if (hasAnyTag(movie, ["occult", "ritual", "curse", "religious"])) {
    vibes.push("occult");
  }
  if (hasAnyTag(movie, ["claustrophobic", "catacombs", "asylum"])) {
    vibes.push("claustrophobic");
  }
  if (hasAnyTag(movie, ["chaotic", "urgent", "relentless", "quarantine"])) {
    vibes.push("chaotic");
  }
  if (hasAnyTag(movie, ["creepy", "ghosts", "haunting"])) {
    vibes.push("creepy");
  }
  if (hasAnyTag(movie, ["paranoid", "conspiracy", "awkward"])) {
    vibes.push("paranoid");
  }
  if (hasAnyTag(movie, ["disturbing", "gross-out", "body-horror"]) || getDisturbingLevel(movie) >= 8) {
    vibes.push("disturbing");
  }
  if (hasAnyTag(movie, ["screenlife", "modern", "digital-haunting"])) {
    vibes.push("modern");
  }
  if ((movie.realismScore || 0) >= 8.5) {
    vibes.push("grounded");
  }
  if (hasAnyTag(movie, ["investigation", "interviews", "documentary"])) {
    vibes.push("layered");
  }
  if (hasAnyTag(movie, ["horror-comedy", "funny"])) {
    vibes.push("funny");
  }

  if (vibes.length === 0) {
    if ((movie.scareScore || 0) >= 8) {
      vibes.push("intense");
    } else if ((movie.realismScore || 0) >= 8) {
      vibes.push("grounded");
    } else {
      vibes.push("unsettling");
    }
  }

  return unique(vibes).slice(0, 3);
}

const quizTraitCache = new Map();

export function getMovieQuizTraits(movie) {
  if (!movie) {
    return null;
  }

  if (!quizTraitCache.has(movie.slug)) {
    const explicitQuizTraits = movie.quizTraits || {};
    quizTraitCache.set(movie.slug, {
      scareLevel: explicitQuizTraits.scareLevel || inferScareLevel(movie),
      pace: explicitQuizTraits.pace || inferPace(movie),
      realism: explicitQuizTraits.realism || inferRealism(movie),
      threat: explicitQuizTraits.threat || inferThreat(movie),
      setting: explicitQuizTraits.setting || inferSetting(movie),
      format: explicitQuizTraits.format || inferFormat(movie),
      vibe: Array.isArray(explicitQuizTraits.vibe) && explicitQuizTraits.vibe.length > 0 ? explicitQuizTraits.vibe : inferVibe(movie),
    });
  }

  return quizTraitCache.get(movie.slug);
}

export function getMovieQuizProfile(movie) {
  const quizTraits = getMovieQuizTraits(movie);

  if (!quizTraits) {
    return [];
  }

  const profile = [
    { label: "Scare Level", value: formatQuizOptionLabel("scareLevel", quizTraits.scareLevel) },
    { label: "Pace", value: formatQuizOptionLabel("pace", quizTraits.pace) },
    { label: "Realism", value: formatQuizOptionLabel("realism", quizTraits.realism) },
    { label: "Threat", value: formatQuizOptionLabel("threat", quizTraits.threat) },
    { label: "Setting", value: formatQuizOptionLabel("setting", quizTraits.setting) },
    { label: "Format", value: formatQuizOptionLabel("format", quizTraits.format) },
  ];

  if (Array.isArray(quizTraits.vibe) && quizTraits.vibe.length > 0) {
    profile.push({
      label: "Vibe",
      value: quizTraits.vibe.map((item) => formatQuizOptionLabel("vibe", item)).join(", "),
    });
  }

  return profile.filter((item) => item.value);
}

export const quizReadyMovies = movies.filter((movie) => Boolean(getMovieQuizTraits(movie)));
export const manualQuizMovieCount = movies.filter((movie) => Boolean(movie.quizTraits)).length;

export const quizQuestions = questionConfig.map((question) => {
  let options = [];

  if (["scareLevel", "pace", "realism", "threat", "setting", "format"].includes(question.id)) {
    options = unique(quizReadyMovies.map((movie) => getMovieQuizTraits(movie)?.[question.id]));
  }

  if (question.id === "vibe") {
    options = unique(quizReadyMovies.flatMap((movie) => getMovieQuizTraits(movie)?.vibe || []));
  }

  return {
    ...question,
    options: sortOptions(question.id, options),
  };
});

export const intensityQuizQuestions = [
  {
    id: "comfort",
    prompt: "What kind of night are you having?",
    description: "Decide whether you want an entry point or a punishment.",
    options: ["gateway", "balanced", "extreme"],
  },
  {
    id: "realismStyle",
    prompt: "How grounded should the pick feel?",
    description: "Use this to bias toward realism-heavy or more stylized stuff.",
    options: ["grounded", "either", "stylized"],
  },
  {
    id: "discoveryStyle",
    prompt: "Do you want an essential or a deeper cut?",
    description: "This leans toward hidden gems when you want them.",
    options: ["essential", "either", "hidden-gem"],
  },
  {
    id: "pace",
    prompt: "How fast should it move?",
    description: "Reuse the pacing trait so the second quiz still feels intentional.",
    options: ["slow-burn", "balanced", "relentless"],
  },
];

export const simpleQuizQuestions = [
  {
    id: "scareLevel",
    prompt: "How scary do you want it?",
    description: "Keep this one broad and practical.",
    options: ["low", "medium", "high"],
  },
  {
    id: "realismMode",
    prompt: "More realistic or more supernatural?",
    description: "This is the biggest taste split in the genre.",
    options: ["realistic", "supernatural"],
  },
  {
    id: "pace",
    prompt: "Slow-burn or intense?",
    description: "Choose whether you want dread or velocity.",
    options: ["slow-burn", "relentless"],
  },
  {
    id: "beginnerMode",
    prompt: "Beginner-friendly or not?",
    description: "This steers between gateway picks and harsher stuff.",
    options: ["beginner-friendly", "no-limits"],
  },
  {
    id: "discoveryMode",
    prompt: "Hidden gem or classic?",
    description: "Pick whether you want an essential or a deeper cut.",
    options: ["hidden-gem", "classic"],
  },
];

optionLabels.comfort = {
  gateway: "Ease me in",
  balanced: "Scary but manageable",
  extreme: "Go brutal",
};

optionLabels.realismStyle = {
  grounded: "Keep it grounded",
  either: "Either is fine",
  stylized: "I’m fine with less realism",
};

optionLabels.discoveryStyle = {
  essential: "Give me the essentials",
  either: "Mix it up",
  "hidden-gem": "Give me hidden gems",
};

optionLabels.realismMode = {
  realistic: "More realistic",
  supernatural: "More supernatural",
};

optionLabels.beginnerMode = {
  "beginner-friendly": "Beginner-friendly",
  "no-limits": "Not beginner-friendly",
};

optionLabels.discoveryMode = {
  "hidden-gem": "Hidden gem",
  classic: "Classic",
};

const scoreWeights = {
  scareLevel: 5,
  pace: 4,
  realism: 4,
  threat: 6,
  setting: 4,
  format: 3,
  vibe: 3,
};

export function scoreQuizMovie(movie, answers) {
  const quizTraits = getMovieQuizTraits(movie) || {};
  const matchedTraits = [];
  let score = 0;

  for (const [questionId, answer] of Object.entries(answers)) {
    if (!answer) {
      continue;
    }

    if (questionId === "vibe") {
      if (Array.isArray(quizTraits.vibe) && quizTraits.vibe.includes(answer)) {
        score += scoreWeights.vibe;
        matchedTraits.push(`Vibe: ${formatQuizOptionLabel("vibe", answer)}`);
      }
      continue;
    }

    if (quizTraits[questionId] === answer) {
      score += scoreWeights[questionId] || 1;
      matchedTraits.push(`${formatQuizQuestionLabel(questionId)}: ${formatQuizOptionLabel(questionId, answer)}`);
    }
  }

  return { movie, score, matchedTraits };
}

export function getQuizResults(answers) {
  return quizReadyMovies
    .map((movie) => scoreQuizMovie(movie, answers))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if ((right.movie.recommendationScore || 0) !== (left.movie.recommendationScore || 0)) {
        return (right.movie.recommendationScore || 0) - (left.movie.recommendationScore || 0);
      }
      if ((right.movie.scareScore || 0) !== (left.movie.scareScore || 0)) {
        return (right.movie.scareScore || 0) - (left.movie.scareScore || 0);
      }

      return right.movie.title.localeCompare(left.movie.title) * -1;
    });
}

export function getIntensityQuizResults(answers) {
  return quizReadyMovies
    .map((movie) => {
      const quizTraits = getMovieQuizTraits(movie) || {};
      const matchedTraits = [];
      let score = 0;

      if (answers.comfort === "gateway") {
        if (movie.beginnerFriendly) {
          score += 8;
          matchedTraits.push("Beginner Friendly");
        }
        if (movie.scareScore <= 7.2) {
          score += 4;
          matchedTraits.push("Lower intensity range");
        }
      }

      if (answers.comfort === "balanced") {
        if (movie.scareScore >= 6 && movie.scareScore <= 8.2) {
          score += 6;
          matchedTraits.push("Balanced scare level");
        }
      }

      if (answers.comfort === "extreme") {
        if (movie.scareScore >= 8 || movie.disturbingScore >= 8) {
          score += 8;
          matchedTraits.push("High intensity pick");
        }
      }

      if (answers.realismStyle === "grounded") {
        if ((quizTraits.realism || "") === "high" || movie.realismScore >= 8) {
          score += 5;
          matchedTraits.push("Grounded realism");
        }
      }

      if (answers.realismStyle === "stylized") {
        if ((quizTraits.realism || "") !== "high" || movie.realismScore < 8) {
          score += 4;
          matchedTraits.push("Less realism-dependent");
        }
      }

      if (answers.discoveryStyle === "essential") {
        if (!movie.hiddenGem) {
          score += 4;
          matchedTraits.push("Core title");
        }
      }

      if (answers.discoveryStyle === "hidden-gem") {
        if (movie.hiddenGem) {
          score += 6;
          matchedTraits.push("Hidden gem");
        }
      }

      if (answers.pace && quizTraits.pace === answers.pace) {
        score += 4;
        matchedTraits.push(`Pace: ${formatQuizOptionLabel("pace", answers.pace)}`);
      }

      return { movie, score, matchedTraits };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if ((right.movie.recommendationScore || 0) !== (left.movie.recommendationScore || 0)) {
        return (right.movie.recommendationScore || 0) - (left.movie.recommendationScore || 0);
      }
      return left.movie.title.localeCompare(right.movie.title);
    });
}

export function getQuizResultsForMode(mode, answers) {
  if (expandedQuizModeIds.includes(mode)) {
    return getExpandedQuizResultsForMode(mode, answers);
  }
  if (mode === "simple") {
    return getSimpleQuizResults(answers);
  }
  if (mode === "intensity") {
    return getIntensityQuizResults(answers);
  }
  if (mode === "traits") {
    return getQuizResults(answers);
  }
  return [];
}

export function getQuizOutcomeForMode(mode, answers) {
  if (expandedQuizModeIds.includes(mode)) {
    return getExpandedQuizOutcome(mode, answers);
  }
  return null;
}

function formatTagLabel(tag) {
  return String(tag || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function intersect(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
}

function getDisplayTags(tags) {
  return uniqueStrings((tags || []).filter((tag) => !recommendationIgnoredTags.has(tag)));
}

function pushUnique(list, value) {
  if (!value) {
    return;
  }

  if (list instanceof Set) {
    list.add(value);
    return;
  }

  if (!list.includes(value)) {
    list.push(value);
  }
}

function scoreSimpleScare(movie, answers, state) {
  const quizTraits = getMovieQuizTraits(movie) || {};
  const listKeys = getListKeysForMovie(movie);

  if (answers.scareLevel === "low") {
    if (movie.beginnerFriendly || listKeys.includes("beginner-friendly")) {
      state.score += 7;
      state.listKeys.add("beginner-friendly");
      pushUnique(state.matchedTraits, "Beginner-friendly entry point");
    }
    if ((movie.scareScore || 0) <= 7.2) {
      state.score += 4;
      pushUnique(state.matchedTraits, "Lighter scare range");
    }
    if (["low", "medium"].includes(quizTraits.scareLevel)) {
      state.score += 3;
      pushUnique(state.quizTraitMatches, `Scare Level: ${formatQuizOptionLabel("scareLevel", quizTraits.scareLevel)}`);
    }
  }

  if (answers.scareLevel === "medium") {
    if ((movie.scareScore || 0) >= 6 && (movie.scareScore || 0) <= 8) {
      state.score += 6;
      pushUnique(state.matchedTraits, "Solid scare range");
    }
    if (["medium", "high"].includes(quizTraits.scareLevel)) {
      state.score += 3;
      pushUnique(state.quizTraitMatches, `Scare Level: ${formatQuizOptionLabel("scareLevel", quizTraits.scareLevel)}`);
    }
  }

  if (answers.scareLevel === "high") {
    if ((movie.scareScore || 0) >= 7.8) {
      state.score += 7;
      pushUnique(state.matchedTraits, "Hard-hitting scare level");
    }
    if (listKeys.includes("scariest")) {
      state.score += 4;
      state.listKeys.add("scariest");
    }
    if (["high", "extreme"].includes(quizTraits.scareLevel)) {
      state.score += 4;
      pushUnique(state.quizTraitMatches, `Scare Level: ${formatQuizOptionLabel("scareLevel", quizTraits.scareLevel)}`);
    }
  }
}

function scoreSimpleRealism(movie, answers, state) {
  const quizTraits = getMovieQuizTraits(movie) || {};
  const listKeys = getListKeysForMovie(movie);
  const movieCategories = movie.categories || [];
  const movieTags = getDisplayTags(movie.tags);

  if (answers.realismMode === "realistic") {
    if ((movie.realismScore || 0) >= 8) {
      state.score += 7;
      pushUnique(state.matchedTraits, "Grounded realism");
    }
    if (quizTraits.realism === "high") {
      state.score += 4;
      pushUnique(state.quizTraitMatches, `Realism: ${formatQuizOptionLabel("realism", quizTraits.realism)}`);
    }
    if (listKeys.includes("movies-that-feel-real")) {
      state.score += 4;
      state.listKeys.add("movies-that-feel-real");
    }
    for (const category of movieCategories) {
      if (realisticCategories.has(category)) {
        state.score += 2;
        state.categoryKeys.add(category);
      }
    }
    for (const tag of movieTags) {
      if (realisticTags.has(tag)) {
        state.score += 1;
        state.tags.add(tag);
      }
    }
  }

  if (answers.realismMode === "supernatural") {
    for (const category of movieCategories) {
      if (supernaturalCategories.has(category)) {
        state.score += 3;
        state.categoryKeys.add(category);
      }
    }
    for (const tag of movieTags) {
      if (supernaturalTags.has(tag)) {
        state.score += 2;
        state.tags.add(tag);
      }
    }
    if (supernaturalThreats.has(quizTraits.threat)) {
      state.score += 5;
      pushUnique(state.quizTraitMatches, `Threat: ${formatQuizOptionLabel("threat", quizTraits.threat)}`);
    }
    pushUnique(state.matchedTraits, "Leans supernatural");
  }
}

function scoreSimplePace(movie, answers, state) {
  const quizTraits = getMovieQuizTraits(movie) || {};
  const listKeys = getListKeysForMovie(movie);
  const movieTags = getDisplayTags(movie.tags);

  if (answers.pace === "slow-burn") {
    if (quizTraits.pace === "slow-burn") {
      state.score += 6;
      pushUnique(state.quizTraitMatches, `Pace: ${formatQuizOptionLabel("pace", quizTraits.pace)}`);
    }
    if (movieTags.includes("slow-burn") || movieTags.includes("minimalist")) {
      state.score += 2;
      if (movieTags.includes("slow-burn")) state.tags.add("slow-burn");
      if (movieTags.includes("minimalist")) state.tags.add("minimalist");
    }
    pushUnique(state.matchedTraits, "Slow-burn dread");
  }

  if (answers.pace === "relentless") {
    if (quizTraits.pace === "relentless") {
      state.score += 6;
      pushUnique(state.quizTraitMatches, `Pace: ${formatQuizOptionLabel("pace", quizTraits.pace)}`);
    }
    if (listKeys.includes("scariest")) {
      state.score += 2;
      state.listKeys.add("scariest");
    }
    if (movieTags.includes("intense") || movieTags.includes("chaotic") || movieTags.includes("relentless")) {
      state.score += 2;
      if (movieTags.includes("intense")) state.tags.add("intense");
      if (movieTags.includes("chaotic")) state.tags.add("chaotic");
      if (movieTags.includes("relentless")) state.tags.add("relentless");
    }
    pushUnique(state.matchedTraits, "Intense pacing");
  }
}

function scoreSimpleAccess(movie, answers, state) {
  const listKeys = getListKeysForMovie(movie);

  if (answers.beginnerMode === "beginner-friendly") {
    if (movie.beginnerFriendly || listKeys.includes("beginner-friendly")) {
      state.score += 8;
      state.listKeys.add("beginner-friendly");
      pushUnique(state.matchedTraits, "Beginner Friendly");
    }
  }

  if (answers.beginnerMode === "no-limits") {
    if (!movie.beginnerFriendly) {
      state.score += 5;
      pushUnique(state.matchedTraits, "Not a beginner-first pick");
    }
    if (getDisturbingLevel(movie) >= 8) {
      state.score += 4;
      state.listKeys.add("most-disturbing");
      pushUnique(state.matchedTraits, "Higher punishment ceiling");
    }
  }
}

function scoreSimpleDiscovery(movie, answers, state) {
  const listKeys = getListKeysForMovie(movie);

  if (answers.discoveryMode === "hidden-gem") {
    if (movie.hiddenGem || listKeys.includes("hidden-gems")) {
      state.score += 8;
      state.listKeys.add("hidden-gems");
      pushUnique(state.matchedTraits, "Hidden gem");
    }
  }

  if (answers.discoveryMode === "classic") {
    if (!movie.hiddenGem) {
      state.score += 3;
      pushUnique(state.matchedTraits, "More essential than obscure");
    }
    if (getRecommendationScore(movie) >= 9 || listKeys.includes("top-25-most-recommended")) {
      state.score += 6;
      state.listKeys.add("top-25-most-recommended");
    }
  }
}

function finalizeSimpleQuizResult(movie, state) {
  return {
    movie,
    score: state.score,
    matchedTraits: uniqueStrings(state.matchedTraits),
    fit: {
      categories: uniqueStrings([...state.categoryKeys]),
      lists: uniqueStrings([...state.listKeys]),
      tags: uniqueStrings([...state.tags]).slice(0, 4),
      quizTraits: uniqueStrings([...state.quizTraitMatches]),
    },
  };
}

export function getSimpleQuizResults(answers) {
  return quizReadyMovies
    .map((movie) => {
      const state = {
        score: 0,
        matchedTraits: [],
        categoryKeys: new Set(),
        listKeys: new Set(),
        tags: new Set(),
        quizTraitMatches: new Set(),
      };

      scoreSimpleScare(movie, answers, state);
      scoreSimpleRealism(movie, answers, state);
      scoreSimplePace(movie, answers, state);
      scoreSimpleAccess(movie, answers, state);
      scoreSimpleDiscovery(movie, answers, state);

      return finalizeSimpleQuizResult(movie, state);
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (getRecommendationScore(right.movie) !== getRecommendationScore(left.movie)) {
        return getRecommendationScore(right.movie) - getRecommendationScore(left.movie);
      }
      return left.movie.title.localeCompare(right.movie.title);
    });
}

export function getMovieRecommendationContext(movie) {
  const listKeys = getListKeysForMovie(movie);
  const displayTags = getDisplayTags(movie.tags).slice(0, 5);
  const quizTraits = getMovieQuizTraits(movie) || {};
  const reasons = [];

  if (movie.beginnerFriendly) {
    reasons.push("Works as a beginner-friendly gateway pick.");
  }
  if (movie.hiddenGem) {
    reasons.push("Feels like a hidden gem rather than a default safe answer.");
  }
  if (getRecommendationScore(movie) >= 9) {
    reasons.push("Ranks as one of the strongest overall recommendations in the vault.");
  }
  if ((movie.realismScore || 0) >= 8 || quizTraits.realism === "high") {
    reasons.push("It lands well if you want something grounded and plausible.");
  }
  if (quizTraits.pace) {
    reasons.push(`Best if you want ${formatQuizOptionLabel("pace", quizTraits.pace).toLowerCase()}.`);
  }
  if (quizTraits.threat) {
    reasons.push(`Its main hook is ${formatQuizOptionLabel("threat", quizTraits.threat).toLowerCase()}.`);
  }
  if (getDisturbingLevel(movie) >= 8) {
    reasons.push("It also lands in the more punishing end of the site’s recommendation pool.");
  }

  return {
    whereItFitsBest: {
      categories: uniqueStrings(movie.categories || []),
      lists: listKeys,
      tags: displayTags,
    },
    recommendationReasons: uniqueStrings(reasons).slice(0, 5),
  };
}

export function getRelatedMovieMatches(movie, limit = 4) {
  const baseCategories = uniqueStrings(movie.categories || []);
  const baseLists = getListKeysForMovie(movie);
  const baseTags = getDisplayTags(movie.tags);
  const baseQuizTraits = getMovieQuizTraits(movie) || {};
  const manualRelatedTitles = new Set(movie.relatedMovies || []);

  return movies
    .filter((candidate) => candidate.slug !== movie.slug)
    .map((candidate) => {
      const reasons = [];
      let score = 0;

      const candidateCategories = uniqueStrings(candidate.categories || []);
      const candidateLists = getListKeysForMovie(candidate);
      const candidateTags = getDisplayTags(candidate.tags);
      const candidateQuizTraits = getMovieQuizTraits(candidate) || {};

      if (manualRelatedTitles.has(candidate.title)) {
        score += 12;
        pushUnique(reasons, "Vault-linked pick");
      }

      const sharedCategories = intersect(baseCategories, candidateCategories);
      if (sharedCategories.length > 0) {
        score += sharedCategories.length * 5;
        pushUnique(reasons, `Same category: ${sharedCategories.map((key) => categoryLabels[key] || key).slice(0, 2).join(", ")}`);
      }

      const sharedLists = intersect(baseLists, candidateLists);
      if (sharedLists.length > 0) {
        score += sharedLists.length * 4;
        pushUnique(reasons, `Same list: ${sharedLists.map((key) => listLabels[key] || key).slice(0, 2).join(", ")}`);
      }

      const sharedTags = intersect(baseTags, candidateTags);
      if (sharedTags.length > 0) {
        score += Math.min(sharedTags.length, 3) * 2;
        pushUnique(reasons, `Matching tags: ${sharedTags.slice(0, 3).map(formatTagLabel).join(", ")}`);
      }

      if (baseQuizTraits.threat && baseQuizTraits.threat === candidateQuizTraits.threat) {
        score += 3;
        pushUnique(reasons, `Shared threat: ${formatQuizOptionLabel("threat", baseQuizTraits.threat)}`);
      }
      if (baseQuizTraits.pace && baseQuizTraits.pace === candidateQuizTraits.pace) {
        score += 2;
        pushUnique(reasons, `Shared pace: ${formatQuizOptionLabel("pace", baseQuizTraits.pace)}`);
      }
      if (baseQuizTraits.realism && baseQuizTraits.realism === candidateQuizTraits.realism) {
        score += 2;
        pushUnique(reasons, `Shared realism: ${formatQuizOptionLabel("realism", baseQuizTraits.realism)}`);
      }

      return {
        movie: candidate,
        score,
        reasons: reasons.slice(0, 3),
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (getRecommendationScore(right.movie) !== getRecommendationScore(left.movie)) {
        return getRecommendationScore(right.movie) - getRecommendationScore(left.movie);
      }
      return left.movie.title.localeCompare(right.movie.title);
    })
    .slice(0, limit);
}

export function formatRecommendationTag(tag) {
  return formatTagLabel(tag);
}

export function getQuizRecommendationForMovie(mode, answers, movie) {
  const results = getQuizResultsForMode(mode, answers);
  const match = results.find((result) => result.movie.slug === movie.slug);

  if (!match) {
    return null;
  }

  const questions = getQuizQuestionsForMode(mode);
  const selectedAnswers = questions
    .map((question) => {
      const value = answers?.[question.id];
      if (!value) {
        return null;
      }

      return {
        id: question.id,
        label: formatQuizQuestionLabel(question.id),
        value,
        valueLabel: formatQuizOptionLabel(question.id, value),
      };
    })
    .filter(Boolean);

  return {
    ...match,
    selectedAnswers,
    mode,
    modeLabel: getQuizModeMeta(mode)?.title || "Vault Quiz",
    quizHref: buildQuizHref(mode, answers),
  };
}
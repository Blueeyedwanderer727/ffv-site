import { categoryLabels, listLabels } from "./labels";
import { getFearExperimentProfileBySlug, getFearExperimentResultsHref } from "./fearExperiment";
import { getMoviesForList, getRecommendationScore, getScariestScore } from "./listRankings";
import { movies } from "./movies";
import { buildSearchHref, movieMatchesFilters } from "./searchFilters";

function hasAnyTag(movie, tags) {
  const movieTags = Array.isArray(movie?.tags) ? movie.tags : [];
  return tags.some((tag) => movieTags.includes(tag));
}

function sortGuideMovies(left, right) {
  if (getRecommendationScore(right) !== getRecommendationScore(left)) {
    return getRecommendationScore(right) - getRecommendationScore(left);
  }
  if (getScariestScore(right) !== getScariestScore(left)) {
    return getScariestScore(right) - getScariestScore(left);
  }
  return left.title.localeCompare(right.title);
}

export const guideEntries = [
  {
    slug: "best-found-footage-horror-for-beginners",
    eyebrow: "Beginner Guide",
    title: "Best Found Footage Horror For Beginners",
    description: "A practical entry guide for viewers who want found footage to work without starting at the most punishing end of the genre.",
    searchIntent: "best found footage horror for beginners",
    keywords: ["beginner found footage horror", "entry point found footage", "starter found footage movies"],
    intro:
      "If you are trying to get someone into found footage horror, the first pick matters. The best gateway titles feel real, readable, and memorable without immediately jumping to the harshest scare ceiling in the vault.",
    angle:
      "This page leans on the beginner-friendly ranking, then points into the Gateway Observer lane inside Fear Experiment so the guide can turn into a personalized next step.",
    bullets: [
      "Prioritizes beginner-friendly titles with strong recommendation weight.",
      "Biases toward clearer setups, stronger hooks, and more manageable punishment.",
      "Works as the safest handoff page when someone asks where to start.",
    ],
    bestFor: [
      "Viewers new to found footage horror.",
      "People who want atmosphere before punishment.",
      "Anyone trying to convert a skeptical friend with one solid starter pick.",
    ],
    avoidIf: [
      "You want the harshest scare ceiling immediately.",
      "You are specifically hunting for hidden gems over gateway picks.",
    ],
    faq: [
      {
        question: "What makes a found footage movie beginner-friendly?",
        answer: "In the vault, beginner-friendly picks usually balance a strong hook with clearer storytelling, more manageable intensity, and a recommendation score that makes them safe first-watch bets.",
      },
      {
        question: "Should beginners start with realism-heavy found footage?",
        answer: "Usually yes, as long as the movie is not too punishing. Realism helps the format click quickly, but pairing it with a manageable scare ceiling tends to work better than jumping straight into the most brutal titles.",
      },
    ],
    listKey: "beginner-friendly",
    searchFilters: { beginnerFriendly: true, sort: "fear-desc" },
    fearProfileSlug: "gateway-observer",
  },
  {
    slug: "scariest-found-footage-horror-movies",
    eyebrow: "Scariest Guide",
    title: "Scariest Found Footage Horror Movies",
    description: "The hard-hit guide for nights when you want the genre to stop being polite and start doing damage.",
    searchIntent: "scariest found footage horror movies",
    keywords: ["scariest found footage", "most terrifying found footage horror", "extreme found footage horror"],
    intro:
      "Some people do not want a gateway. They want the strongest fear index, the hardest overall hit, and the films that make the format feel hostile again. This guide starts there.",
    angle:
      "This one pairs the Scariest list with the Midnight Damage Run profile so it can behave like both an SEO page and a recommendation lane.",
    bullets: [
      "Uses the scariest ranking as the backbone instead of generic popularity.",
      "Favors movies that combine realism, disturbing material, and strong overall recommendation scores.",
      "Best for experienced viewers who actively want intensity instead of a warm-up.",
    ],
    bestFor: [
      "Experienced viewers looking for the highest fear ceiling in the vault.",
      "People choosing a movie specifically for scare impact rather than accessibility.",
    ],
    avoidIf: [
      "You want a gateway title or lighter first exposure to the genre.",
      "You prefer slower realism-heavy investigations over hard-hit escalation.",
    ],
    faq: [
      {
        question: "How does the site decide what counts as the scariest?",
        answer: "The scariest ranking blends disturbing level, jump-scare level, realism score, fear index, and overall recommendation weight so the page is not just a list of loud movies.",
      },
      {
        question: "Are the scariest picks the same as the most disturbing picks?",
        answer: "Not always. Some movies score as deeply disturbing without landing as hard on immediate scare impact, while others hit fast and aggressively without being the nastiest overall experience.",
      },
    ],
    listKey: "scariest",
    searchFilters: { listKey: "scariest", sort: "fear-desc", minFearIndex: 7 },
    fearProfileSlug: "midnight-damage-run",
  },
  {
    slug: "found-footage-horror-movies-that-feel-real",
    eyebrow: "Realism Guide",
    title: "Found Footage Horror Movies That Feel Real",
    description: "The realism-first page for viewers who want found footage to feel plausible, invasive, and uncomfortably close to reality.",
    searchIntent: "found footage horror movies that feel real",
    keywords: ["realistic found footage horror", "found footage that feels real", "believable found footage horror"],
    intro:
      "A lot of found footage works because it does not feel cinematic in the usual way. The strongest realism-heavy picks feel like bad evidence, broken documentation, or the exact wrong footage to find.",
    angle:
      "This guide anchors on the Movies That Feel Real list and points into the Dread Archivist profile for viewers who want realism plus layered investigative dread.",
    bullets: [
      "Prioritizes realism score and investigative atmosphere.",
      "Good for readers searching for believable, documentary-adjacent horror instead of spectacle.",
      "Pairs especially well with slow-burn and psychological browsing paths.",
    ],
    bestFor: [
      "Viewers who want found footage to feel invasive and plausible.",
      "People searching for documentary-adjacent dread over pure chaos.",
    ],
    avoidIf: [
      "You want overt supernatural spectacle or relentless pace first.",
      "You are mainly hunting for digital-screen panic rather than realism.",
    ],
    faq: [
      {
        question: "What makes found footage feel real instead of just low-budget?",
        answer: "The realism-first picks tend to use performance, framing, and documentation logic convincingly. They feel like recovered evidence or a credible investigation, not just shaky cameras.",
      },
      {
        question: "Does realistic found footage mean less scary?",
        answer: "No. Realism often increases dread because the movie feels harder to dismiss. Some of the most effective titles in the vault score highly on both realism and fear index.",
      },
    ],
    listKey: "movies-that-feel-real",
    searchFilters: { listKey: "movies-that-feel-real", minRealismScore: 8, sort: "fear-desc" },
    fearProfileSlug: "dread-archivist",
  },
  {
    slug: "hidden-gem-found-footage-horror",
    eyebrow: "Hidden Gem Guide",
    title: "Hidden Gem Found Footage Horror",
    description: "A deeper-cut guide for viewers who have already seen the obvious titles and want stronger under-the-radar recommendations.",
    searchIntent: "hidden gem found footage horror",
    keywords: ["hidden gem found footage", "underrated found footage horror", "obscure found footage movies"],
    intro:
      "The genre has a visibility problem. A lot of good found footage horror lives outside the few titles everyone already knows, which means a real hidden-gem page needs curation instead of filler.",
    angle:
      "This page uses the Hidden Gems list as its backbone and keeps a recommendation-engine handoff ready for people who want obscure titles tuned to their taste instead of one-size-fits-all picks.",
    bullets: [
      "Filters toward hidden gems without dropping recommendation quality.",
      "Useful as a second-step page after viewers finish the obvious essentials.",
      "Connects naturally to both search filters and Fear Experiment profiles.",
    ],
    bestFor: [
      "Viewers who already know the obvious canon picks.",
      "Readers looking for recommendation depth instead of generic essentials lists.",
    ],
    avoidIf: [
      "You need a starter page for a first-time viewer.",
      "You only want the biggest, most universally known titles.",
    ],
    faq: [
      {
        question: "How do hidden gems get chosen in the vault?",
        answer: "A hidden gem is not just an obscure movie. The page still biases toward recommendation quality and useful discovery, so deeper cuts only stay here if they earn the spot.",
      },
      {
        question: "Are hidden gems always lower intensity?",
        answer: "No. Some hidden gems are great gateway titles, but others are punishing and mean. The hidden-gem label is about visibility, not softness.",
      },
    ],
    listKey: "hidden-gems",
    searchFilters: { hiddenGem: true, sort: "fear-desc" },
    fearProfileSlug: "dread-archivist",
  },
  {
    slug: "best-screenlife-found-footage-horror",
    eyebrow: "Category Guide",
    title: "Best Screenlife Found Footage Horror",
    description: "A focused guide for desktop-native panic, livestream breakdowns, and digital-space dread inside the vault.",
    searchIntent: "best screenlife found footage horror",
    keywords: ["screenlife found footage horror", "computer screen horror", "digital found footage horror"],
    intro:
      "Screenlife is one of the clearest ways to make found footage feel contemporary. When it works, the movie does not just use screens as decoration. It turns the interface itself into the threat.",
    angle:
      "This page is category-led instead of list-led so the content layer is not limited to rankings only. It opens straight into the Screenlife route and a high-fear search path.",
    bullets: [
      "Pulls from the screenlife category rather than a ranking list.",
      "Useful for readers who know the format they want before they know the title.",
      "Works as a bridge between category browsing and recommendation-driven discovery.",
    ],
    bestFor: [
      "Viewers specifically chasing digital-native horror.",
      "People who want a contemporary interface-driven version of the format.",
    ],
    avoidIf: [
      "You want analog woods footage or rural documentary texture instead.",
      "You are mainly browsing by supernatural subgenre, not format.",
    ],
    faq: [
      {
        question: "What makes screenlife different from normal found footage?",
        answer: "Screenlife keeps the action inside computers, chats, browser windows, calls, and streams. The interface is not a framing device. It is the movie's actual environment.",
      },
      {
        question: "Is screenlife a good entry point for non-horror viewers?",
        answer: "Often yes, because the format feels modern and readable. It can still get nasty, but the digital setting makes it accessible to viewers who are not drawn to woods-and-camcorder horror.",
      },
    ],
    categoryKey: "screenlife",
    searchFilters: { category: "screenlife", sort: "fear-desc" },
    fearProfileSlug: "midnight-damage-run",
  },
  {
    slug: "best-found-footage-possession-horror",
    eyebrow: "Category Guide",
    title: "Best Found Footage Possession Horror",
    description: "A possession-focused guide for exorcisms, domestic dread, ritual fallout, and the strongest demonic escalation in the vault.",
    searchIntent: "best found footage possession horror",
    keywords: ["found footage possession horror", "found footage exorcism movies", "demonic found footage horror"],
    intro:
      "Possession is one of the most reliable engines in found footage horror because it combines intimacy with escalation. The camera is usually close to the person falling apart, which makes the genre's voyeuristic logic work even harder.",
    angle:
      "This guide uses the possession category as the base route, then hands off to harsher Fear Experiment paths for viewers who want demonic punishment instead of a general supernatural mix.",
    bullets: [
      "Centers demonic and ritual-driven possession titles.",
      "Useful for readers searching by subgenre first instead of by list logic.",
      "Keeps direct handoffs into search and Fear Experiment for deeper filtering.",
    ],
    bestFor: [
      "Viewers who specifically want demonic escalation and exorcism energy.",
      "People browsing supernatural found footage by subgenre rather than overall score.",
    ],
    avoidIf: [
      "You want human-threat realism instead of supernatural horror.",
      "You are looking for milder gateway picks first.",
    ],
    faq: [
      {
        question: "Why does possession work so well in found footage?",
        answer: "The format makes the loss of control feel immediate. Possession stories benefit from close-up documentation, domestic settings, and the sense that the footage should not exist at all.",
      },
      {
        question: "Are possession titles always the scariest?",
        answer: "Not automatically, but the subgenre has a high ceiling because it blends body change, ritual dread, and personal collapse. Many of the vault's harder-hitting supernatural picks live here.",
      },
    ],
    categoryKey: "possession",
    searchFilters: { category: "possession", sort: "fear-desc" },
    fearProfileSlug: "midnight-damage-run",
  },
  {
    slug: "best-found-footage-haunted-asylum-horror",
    eyebrow: "Search Intent Guide",
    title: "Best Found Footage Haunted Asylum Horror",
    description: "A focused search-intent page for abandoned institutions, ghost-hunting crews, and the best asylum nightmare runs in the vault.",
    searchIntent: "best found footage haunted asylum horror",
    keywords: ["haunted asylum found footage", "asylum found footage horror", "abandoned asylum horror footage"],
    intro:
      "Asylums are one of the genre's most reliable settings because they concentrate everything found footage likes to weaponize: bad architecture, decayed history, isolation, and long corridors that turn movement into dread.",
    angle:
      "This guide is search-intent-led rather than category-led. It collects the strongest asylum-set titles across the vault, then points into higher-intensity recommendation paths when the reader wants more than one setting filter can provide.",
    bullets: [
      "Built around the asylum setting instead of a single category.",
      "Captures haunted institutions, paranormal investigations, and institutional dread in one page.",
      "Useful for readers whose search starts with place, not title or subgenre.",
    ],
    bestFor: [
      "Viewers specifically searching for asylum horror within found footage.",
      "People who want location-based dread and exploration-heavy setups.",
    ],
    avoidIf: [
      "You want a broad genre overview instead of a setting-specific page.",
      "You prefer domestic realism or screen-based horror over location dread.",
    ],
    faq: [
      {
        question: "Why are asylum settings so common in found footage horror?",
        answer: "They give the format a believable reason to explore, document, and get lost. The setting is naturally hostile to orientation, which makes the footage feel more dangerous as the night goes on.",
      },
      {
        question: "Does this page only include ghost stories?",
        answer: "No. It prioritizes the asylum setting first, so the page can include hauntings, possession-linked institutional horror, and other adjacent nightmare setups that fit the search intent.",
      },
    ],
    primaryLabel: "Asylum Search Route",
    searchFilters: { tags: ["asylum"], sort: "fear-desc", minFearIndex: 6.5 },
    movieFilter: (movie) => hasAnyTag(movie, ["asylum", "hospital", "haunted-hospital"]),
    fearProfileSlug: "midnight-damage-run",
  },
  {
    slug: "best-documentary-style-found-footage-horror",
    eyebrow: "Format Guide",
    title: "Best Documentary-Style Found Footage Horror",
    description: "A guide for investigation-heavy, interview-driven, documentary-adjacent found footage that leans into realism and layered discovery.",
    searchIntent: "best documentary style found footage horror",
    keywords: ["documentary style found footage", "mockumentary horror found footage", "investigation found footage horror"],
    intro:
      "Not every found footage movie lives and dies on pure chaos. Some of the format's best work behaves more like an investigation, a reconstruction, or a documentary that gets too close to the thing it should have left alone.",
    angle:
      "This page is built for a common search intent that cuts across several subgenres. It groups documentary, pseudo-documentary, and investigation-heavy titles into one realism-forward route.",
    bullets: [
      "Collects documentary-adjacent found footage across multiple categories.",
      "Good for readers who want realism, interviews, archives, and slow information reveals.",
      "Natural handoff page into the Dread Archivist lane inside Fear Experiment.",
    ],
    bestFor: [
      "Viewers who want investigation structure instead of pure survival panic.",
      "Readers searching for documentary or mockumentary found footage specifically.",
    ],
    avoidIf: [
      "You want fast, chaotic escalation more than layered discovery.",
      "You are browsing primarily by monster or possession subgenre.",
    ],
    faq: [
      {
        question: "What counts as documentary-style found footage here?",
        answer: "The page pulls titles that behave like investigations, reconstructions, or documentaries using interviews, archives, presenters, or evidence-first storytelling rather than pure run-and-record structure.",
      },
      {
        question: "Is documentary-style found footage always slower?",
        answer: "Usually it leans slower and more layered, but not always. Some titles still escalate hard once the investigation turns from explanation into survival.",
      },
    ],
    primaryLabel: "Documentary Search Route",
    searchFilters: { tags: ["documentary"], sort: "fear-desc", minRealismScore: 6.5 },
    movieFilter: (movie) => hasAnyTag(movie, ["documentary", "pseudo-documentary", "investigation", "interviews", "mockumentary"]),
    fearProfileSlug: "dread-archivist",
  },
];

export function getGuideBySlug(slug) {
  return guideEntries.find((guide) => guide.slug === slug) || null;
}

export function getGuideSearchHref(guide) {
  return buildSearchHref(guide.searchFilters || {});
}

export function getGuidePrimaryHref(guide) {
  if (guide.listKey) {
    return `/lists/${guide.listKey}`;
  }
  if (guide.categoryKey) {
    return `/${guide.categoryKey}`;
  }
  return getGuideSearchHref(guide);
}

export function getGuidePrimaryLabel(guide) {
  if (guide.primaryLabel) {
    return guide.primaryLabel;
  }
  if (guide.listKey) {
    return listLabels[guide.listKey] || guide.listKey;
  }
  if (guide.categoryKey) {
    return categoryLabels[guide.categoryKey] || guide.categoryKey;
  }
  return "Search Route";
}

export function getGuideFearProfile(guide) {
  if (!guide.fearProfileSlug) {
    return null;
  }

  const profile = getFearExperimentProfileBySlug(guide.fearProfileSlug);
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    href: getFearExperimentResultsHref(profile),
  };
}

export function getGuideMovies(guide, limit) {
  let guideMovies = [];

  if (typeof guide.movieFilter === "function") {
    guideMovies = movies.filter((movie) => guide.movieFilter(movie)).sort(sortGuideMovies);
  } else if (guide.listKey) {
    guideMovies = getMoviesForList(guide.listKey);
  } else if (guide.categoryKey) {
    guideMovies = movies.filter((movie) => Array.isArray(movie.categories) && movie.categories.includes(guide.categoryKey)).sort(sortGuideMovies);
  } else {
    guideMovies = movies.filter((movie) => movieMatchesFilters(movie, guide.searchFilters || {})).sort(sortGuideMovies);
  }

  return typeof limit === "number" ? guideMovies.slice(0, limit) : guideMovies;
}

export function getGuideCount(guide) {
  return getGuideMovies(guide).length;
}
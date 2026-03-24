import { getDisturbingLevel, getFearIndex, getListKeysForMovie, getRecommendationScore } from "./listRankings";
import { buildSearchHref } from "./searchFilters";
import { movies } from "./movies";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getMovieByTitle(title) {
  return movies.find((movie) => movie.title === title) || null;
}

function getMovieTags(movie) {
  return unique((movie?.tags || []).filter((tag) => !["found-footage", "quiz-core", "quiz-starter", "quiz-batch-2"].includes(tag)));
}

function buildMovieResults(titles, matchedTraits) {
  return titles
    .map((title, index) => {
      const movie = getMovieByTitle(title);
      if (!movie) {
        return null;
      }

      return {
        movie,
        score: Math.max(100 - index * 8, 60),
        matchedTraits,
        fit: {
          categories: (movie.categories || []).slice(0, 2),
          lists: getListKeysForMovie(movie).slice(0, 2),
          tags: getMovieTags(movie).slice(0, 3),
          quizTraits: [],
        },
      };
    })
    .filter(Boolean);
}

function getTopMoviesForCategory(categoryKey, limit = 4) {
  return movies
    .filter((movie) => Array.isArray(movie.categories) && movie.categories.includes(categoryKey))
    .sort((left, right) => {
      if (getRecommendationScore(right) !== getRecommendationScore(left)) {
        return getRecommendationScore(right) - getRecommendationScore(left);
      }
      return left.title.localeCompare(right.title);
    })
    .slice(0, limit)
    .map((movie, index) => ({
      movie,
      score: Math.max(96 - index * 7, 60),
      matchedTraits: ["Subgenre fit", `Category: ${categoryKey.replace(/-/g, " ")}`],
      fit: {
        categories: (movie.categories || []).slice(0, 2),
        lists: getListKeysForMovie(movie).slice(0, 2),
        tags: getMovieTags(movie).slice(0, 3),
        quizTraits: [],
      },
    }));
}

function getTopMoviesByDisturbance(minimum, maximum = 10, limit = 4) {
  return movies
    .filter((movie) => getDisturbingLevel(movie) >= minimum && getDisturbingLevel(movie) <= maximum)
    .sort((left, right) => {
      if (getDisturbingLevel(right) !== getDisturbingLevel(left)) {
        return getDisturbingLevel(right) - getDisturbingLevel(left);
      }
      return getRecommendationScore(right) - getRecommendationScore(left);
    })
    .slice(0, limit)
    .map((movie, index) => ({
      movie,
      score: Math.max(95 - index * 7, 60),
      matchedTraits: ["Disturbance match", `Disturbing ${getDisturbingLevel(movie)}/10`],
      fit: {
        categories: (movie.categories || []).slice(0, 2),
        lists: getListKeysForMovie(movie).slice(0, 2),
        tags: getMovieTags(movie).slice(0, 3),
        quizTraits: [],
      },
    }));
}

function getTopMoviesByFear(minimumFearIndex, beginnerFriendly, limit = 4) {
  return movies
    .filter((movie) => getFearIndex(movie) >= minimumFearIndex)
    .filter((movie) => (typeof beginnerFriendly === "boolean" ? Boolean(movie.beginnerFriendly) === beginnerFriendly : true))
    .sort((left, right) => {
      if (getFearIndex(right) !== getFearIndex(left)) {
        return getFearIndex(right) - getFearIndex(left);
      }
      return getRecommendationScore(right) - getRecommendationScore(left);
    })
    .slice(0, limit)
    .map((movie, index) => ({
      movie,
      score: Math.max(94 - index * 6, 60),
      matchedTraits: ["Survival curve fit", beginnerFriendly ? "Safer watch" : "Punishing watch"],
      fit: {
        categories: (movie.categories || []).slice(0, 2),
        lists: getListKeysForMovie(movie).slice(0, 2),
        tags: getMovieTags(movie).slice(0, 3),
        quizTraits: [],
      },
    }));
}

export const expandedQuizModeIds = ["personality", "fear-profile", "survival", "disturbance", "subgenre"];

export const expandedQuizModeMeta = {
  personality: {
    id: "personality",
    eyebrow: "Classified Track",
    title: "Lab-02: Tape Persona Match",
    description: "Personality-first, shareable, and built around archetypes that resolve into a movie match and backup picks.",
    resultLabel: "You are",
    labCode: "LAB-02",
    alias: "Persona Match",
    icon: "TP",
    signalWords: ["identity", "archetype", "match"],
    visualClass: "border-green-300/20 bg-[linear-gradient(135deg,rgba(92,194,114,0.20),rgba(9,22,13,0.86)_70%)]",
    stampClass: "border-green-300/25 bg-green-300/10 text-green-50/88",
    posterToneClass: "quiz-poster-persona",
    posterWarning: "Identity Match",
    posterSubtitle: "Recovered subject profiling tape",
    posterMarks: ["mirror", "persona", "evidence"],
  },
  "fear-profile": {
    id: "fear-profile",
    eyebrow: "Classified Track",
    title: "Lab-01: Fear Profile Audit",
    description: "A classified lab-style fear test that outputs your fear profile, fear score, tolerance level, and movie recommendations.",
    resultLabel: "Fear Profile",
    labCode: "LAB-01",
    alias: "Profile Audit",
    icon: "FP",
    signalWords: ["dread", "tolerance", "profile"],
    visualClass: "border-green-300/20 bg-[linear-gradient(135deg,rgba(126,229,145,0.24),rgba(8,20,12,0.88)_68%)]",
    stampClass: "border-green-300/30 bg-green-300/12 text-green-50/92",
    posterToneClass: "quiz-poster-profile",
    posterWarning: "Profile Audit",
    posterSubtitle: "Baseline fear exposure analysis",
    posterMarks: ["pulse", "tolerance", "archive"],
  },
  survival: {
    id: "survival",
    eyebrow: "Classified Track",
    title: "Lab-03: Survival Probability Test",
    description: "Find out your survival percentage, your likely death scenario, and the kind of footage disaster you would walk into.",
    resultLabel: "Survival Estimate",
    labCode: "LAB-03",
    alias: "Survival Test",
    icon: "SV",
    signalWords: ["escape", "risk", "decision"],
    visualClass: "border-lime-300/20 bg-[linear-gradient(135deg,rgba(166,200,72,0.22),rgba(10,19,9,0.9)_70%)]",
    stampClass: "border-lime-300/30 bg-lime-300/10 text-lime-50/92",
    posterToneClass: "quiz-poster-survival",
    posterWarning: "Probability Test",
    posterSubtitle: "Exit route and failure-rate chart",
    posterMarks: ["escape", "route", "risk"],
  },
  disturbance: {
    id: "disturbance",
    eyebrow: "Classified Track",
    title: "Lab-04: Damage Threshold Index",
    description: "Measures how much dread, realism, grief, gore, and emotional damage you actually want from the genre.",
    resultLabel: "Disturbance Level",
    labCode: "LAB-04",
    alias: "Damage Index",
    icon: "DT",
    signalWords: ["disturbance", "residue", "threshold"],
    visualClass: "border-amber-300/20 bg-[linear-gradient(135deg,rgba(214,167,77,0.22),rgba(17,14,8,0.9)_72%)]",
    stampClass: "border-amber-300/30 bg-amber-300/10 text-amber-50/92",
    posterToneClass: "quiz-poster-damage",
    posterWarning: "Threshold Index",
    posterSubtitle: "Residual harm calibration sheet",
    posterMarks: ["damage", "residue", "threshold"],
  },
  subgenre: {
    id: "subgenre",
    eyebrow: "Classified Track",
    title: "Lab-05: Route Alignment Scan",
    description: "Sort yourself into the subgenre lane that best matches your fear preferences and favorite kind of chaos.",
    resultLabel: "Primary Subgenre",
    labCode: "LAB-05",
    alias: "Route Scan",
    icon: "RA",
    signalWords: ["lane", "format", "route"],
    visualClass: "border-cyan-300/20 bg-[linear-gradient(135deg,rgba(86,184,184,0.20),rgba(7,17,18,0.92)_72%)]",
    stampClass: "border-cyan-300/30 bg-cyan-300/10 text-cyan-50/92",
    posterToneClass: "quiz-poster-route",
    posterWarning: "Alignment Scan",
    posterSubtitle: "Route map and category lock-on",
    posterMarks: ["route", "format", "lane"],
  },
};

export const expandedQuestionLabels = {
  woodsReaction: "Woods Reaction",
  strength: "Biggest Strength",
  paranormalResponse: "Paranormal Response",
  horrorRole: "Horror Group Role",
  settingChoice: "Setting",
  mainFear: "What Scares You Most",
  houseOff: "House Feels Off",
  worseScenario: "Which Is Worse",
  footsteps: "Footsteps Upstairs",
  lingeringFear: "What Lingers Longer",
  nightmare: "Pick Your Nightmare",
  cursedTape: "Cursed Tape",
  splitUp: "Splitting Up",
  battery: "Battery Dying",
  injury: "Injury Response",
  finalExit: "Blocked Exit",
  endingTone: "Ending Tone",
  realismLine: "Realism Line",
  imageType: "Image Type",
  emotionalDamage: "Emotional Damage",
  tabooLevel: "Taboo Level",
  discovery: "Discovery",
  threatPreference: "Threat Preference",
  energy: "Energy",
  formatPull: "Format Pull",
  aftermath: "Aftermath",
};

const personalityOptionLabels = {
  woodsReaction: {
    a: "Grab a camera and investigate",
    b: "Stay quiet and observe",
    c: "Call it out and confront it",
    d: "Leave immediately",
    e: "Pretend it didn’t happen",
  },
  strength: {
    a: "Curiosity",
    b: "Survival instincts",
    c: "Logic",
    d: "Empathy",
    e: "Courage",
  },
  paranormalResponse: {
    a: "Research it obsessively",
    b: "Record everything",
    c: "Try to debunk it",
    d: "Get emotionally invested",
    e: "Panic but keep going",
  },
  horrorRole: {
    a: "The leader",
    b: "The camera operator",
    c: "The doubter",
    d: "The emotional anchor",
    e: "The one who runs first",
  },
  settingChoice: {
    a: "Abandoned building",
    b: "Deep woods",
    c: "Suburban house",
    d: "Underground tunnels",
    e: "Small town mystery",
  },
  mainFear: {
    a: "The unknown",
    b: "Being trapped",
    c: "Losing control",
    d: "Something watching you",
    e: "Being alone",
  },
};

const fearProfileOptionLabels = {
  houseOff: {
    a: "Something is watching me",
    b: "Something is here",
    c: "Something is wrong with reality",
    d: "I’m trapped",
    e: "Something violent is coming",
  },
  worseScenario: {
    a: "Seeing something no one else sees",
    b: "Being possessed",
    c: "Endless darkness",
    d: "Being buried alive",
    e: "Being chased",
  },
  footsteps: {
    a: "Slowly investigate",
    b: "Freeze",
    c: "Call out",
    d: "Grab a weapon",
    e: "Leave immediately",
  },
  lingeringFear: {
    a: "Atmosphere",
    b: "Jump scares",
    c: "Realism",
    d: "Isolation",
    e: "Brutality",
  },
  nightmare: {
    a: "Haunted home",
    b: "Cult ritual",
    c: "Endless maze",
    d: "Possession",
    e: "Found footage of YOU",
  },
};

const survivalOptionLabels = {
  cursedTape: {
    a: "Watch it alone immediately",
    b: "Copy it, catalog it, and keep watching",
    c: "Call friends and turn it into a group project",
    d: "Hand it to authorities and leave",
    e: "Destroy it on sight",
  },
  splitUp: {
    a: "Volunteer to scout alone",
    b: "Insist everyone stays together",
    c: "Keep filming no matter what",
    d: "Make an exit plan first",
    e: "Argue until the group wastes time",
  },
  battery: {
    a: "Keep rolling until it dies",
    b: "Conserve it for proof",
    c: "Use your phone as backup",
    d: "Forget the footage and focus on escape",
    e: "Go looking for power in the dark",
  },
  injury: {
    a: "Stay with the injured person",
    b: "Carry them if you can",
    c: "Panic and slow everyone down",
    d: "Mark the route and come back with help",
    e: "Leave them and run",
  },
  finalExit: {
    a: "Kick the door and force it open",
    b: "Search for another route calmly",
    c: "Climb somewhere stupid",
    d: "Listen first before moving",
    e: "Freeze until it is too late",
  },
};

const disturbanceOptionLabels = {
  endingTone: {
    a: "Bleak and hopeless",
    b: "Sad and emotionally wrecking",
    c: "Mean and brutal",
    d: "Creepy but restrained",
    e: "I want the full damage package",
  },
  realismLine: {
    a: "Keep it grounded and plausible",
    b: "Make it feel like bad evidence",
    c: "I can handle pure nightmare logic",
    d: "I want it emotionally ugly",
    e: "Whatever hurts most",
  },
  imageType: {
    a: "Unsettling background details",
    b: "Body horror",
    c: "Grief and aftermath",
    d: "Found footage that implicates the viewer",
    e: "Anything that sticks for days",
  },
  emotionalDamage: {
    a: "A little",
    b: "A fair amount",
    c: "A lot",
    d: "I want regret",
    e: "Maximum damage",
  },
  tabooLevel: {
    a: "Keep it accessible",
    b: "Push a little",
    c: "Go disturbing",
    d: "Go deeply upsetting",
    e: "Absolutely no limits",
  },
};

const subgenreOptionLabels = {
  discovery: {
    a: "Haunted house evidence",
    b: "Cult footage and ritual fallout",
    c: "Alien or anomaly evidence",
    d: "Creature sightings and wilderness panic",
    e: "Paranoia and reality slippage",
  },
  threatPreference: {
    a: "Ghosts",
    b: "Human evil hiding behind belief",
    c: "Something impossible and unexplained",
    d: "A physical thing hunting people",
    e: "A mind that cannot trust itself",
  },
  energy: {
    a: "Eerie and escalating",
    b: "Bleak and investigative",
    c: "Mysterious and reality-bending",
    d: "Urgent survival panic",
    e: "Slow dread and psychological collapse",
  },
  formatPull: {
    a: "Home footage and static cameras",
    b: "Documentary investigations",
    c: "Recovered anomaly files",
    d: "Camcorder chase footage",
    e: "Personal tape confessions",
  },
  aftermath: {
    a: "Something stayed in the house",
    b: "The truth was hidden in plain sight",
    c: "Reality broke and never fixed itself",
    d: "Only panic footage remains",
    e: "No one can explain what was real",
  },
};

export const expandedOptionLabels = {
  ...personalityOptionLabels,
  ...fearProfileOptionLabels,
  ...survivalOptionLabels,
  ...disturbanceOptionLabels,
  ...subgenreOptionLabels,
};

export const personalityQuizQuestions = [
  { id: "woodsReaction", prompt: "You hear something in the woods at night…", description: "Your first instinct says a lot about the kind of tape you end up inside.", options: ["a", "b", "c", "d", "e"] },
  { id: "strength", prompt: "Your biggest strength is:", description: "Pick the instinct you trust most when things go bad.", options: ["a", "b", "c", "d", "e"] },
  { id: "paranormalResponse", prompt: "If something paranormal happens, you:", description: "This decides whether you become the one chasing answers or the one trapped by them.", options: ["a", "b", "c", "d", "e"] },
  { id: "horrorRole", prompt: "Your role in a horror group is:", description: "Every found footage disaster has a pattern. Choose yours.", options: ["a", "b", "c", "d", "e"] },
  { id: "settingChoice", prompt: "Pick a setting:", description: "The place you choose usually predicts the kind of ending you get.", options: ["a", "b", "c", "d", "e"] },
  { id: "mainFear", prompt: "What scares you most?", description: "This is the pressure point your result leans hardest on.", options: ["a", "b", "c", "d", "e"] },
];

export const fearProfileQuizQuestions = [
  { id: "houseOff", prompt: "You wake up and your house feels… off.", description: "Pick the fear that arrives first.", options: ["a", "b", "c", "d", "e"] },
  { id: "worseScenario", prompt: "Which is worse?", description: "Choose the one that sits in your chest the longest.", options: ["a", "b", "c", "d", "e"] },
  { id: "footsteps", prompt: "You hear footsteps upstairs…", description: "Your reaction says a lot about your tolerance profile.", options: ["a", "b", "c", "d", "e"] },
  { id: "lingeringFear", prompt: "What sticks with you longer?", description: "The thing that lingers is usually the thing that owns you.", options: ["a", "b", "c", "d", "e"] },
  { id: "nightmare", prompt: "Pick your nightmare:", description: "This is the core image the experiment will build around.", options: ["a", "b", "c", "d", "e"] },
];

export const survivalQuizQuestions = [
  { id: "cursedTape", prompt: "You find a tape marked DO NOT WATCH.", description: "This is where most people make the first fatal mistake.", options: ["a", "b", "c", "d", "e"] },
  { id: "splitUp", prompt: "Your group wants to split up.", description: "Choose the move that sounds most like you.", options: ["a", "b", "c", "d", "e"] },
  { id: "battery", prompt: "The camera battery is dying.", description: "Do you prioritize survival, proof, or denial?", options: ["a", "b", "c", "d", "e"] },
  { id: "injury", prompt: "Someone in the group gets hurt.", description: "Your next choice changes your survival odds fast.", options: ["a", "b", "c", "d", "e"] },
  { id: "finalExit", prompt: "You find the exit blocked.", description: "This is the moment where people stop being rational.", options: ["a", "b", "c", "d", "e"] },
];

export const disturbanceQuizQuestions = [
  { id: "endingTone", prompt: "Pick the ending tone you can handle best.", description: "Not all disturbing hits the same way.", options: ["a", "b", "c", "d", "e"] },
  { id: "realismLine", prompt: "How real do you want the horror to feel?", description: "Realism changes how deeply a movie sticks.", options: ["a", "b", "c", "d", "e"] },
  { id: "imageType", prompt: "Which image type lingers longest for you?", description: "This tells the vault what kind of damage you actually respond to.", options: ["a", "b", "c", "d", "e"] },
  { id: "emotionalDamage", prompt: "How much emotional damage can you tolerate?", description: "There is a big gap between creepy and devastating.", options: ["a", "b", "c", "d", "e"] },
  { id: "tabooLevel", prompt: "How far should the movie push?", description: "This is the slider between accessible dread and full punishment.", options: ["a", "b", "c", "d", "e"] },
];

export const subgenreQuizQuestions = [
  { id: "discovery", prompt: "What kind of footage discovery hooks you first?", description: "The first hook usually reveals the subgenre you trust most.", options: ["a", "b", "c", "d", "e"] },
  { id: "threatPreference", prompt: "Which threat type sounds best?", description: "This is the lane you want the movie to commit to.", options: ["a", "b", "c", "d", "e"] },
  { id: "energy", prompt: "Pick the overall energy.", description: "Subgenre is often just tone plus threat plus pacing.", options: ["a", "b", "c", "d", "e"] },
  { id: "formatPull", prompt: "Which footage format pulls you in fastest?", description: "The format decides the texture of the whole experience.", options: ["a", "b", "c", "d", "e"] },
  { id: "aftermath", prompt: "Which aftermath feels strongest?", description: "Pick the ending residue you actually want.", options: ["a", "b", "c", "d", "e"] },
];

const personalityArchetypes = {
  investigator: {
    title: "The Investigator",
    description: "You don’t run from the unknown. You chase it, even when common sense tells you to stop.",
    movieTitles: ["The Blair Witch Project", "The Taking of Deborah Logan", "Noroi: The Curse"],
    survivalOdds: "3/10",
    fearType: "Psychological Dread",
    searchFilters: { category: "psychological", minRealismScore: 7, sort: "fear-desc" },
  },
  survivor: {
    title: "The Survivor",
    description: "You are not here for lore. You are here to make it out, even if the footage gets ugly first.",
    movieTitles: ["REC", "Cloverfield", "Afflicted"],
    survivalOdds: "7/10",
    fearType: "Panic Survival",
    searchFilters: { minFearIndex: 7.5, sort: "fear-desc" },
  },
  curious: {
    title: "The Curious One",
    description: "You keep leaning toward the thing you should probably leave alone, because knowing feels better than not knowing.",
    movieTitles: ["Paranormal Activity", "Host", "The Taking of Deborah Logan"],
    survivalOdds: "4/10",
    fearType: "Slow Escalation",
    searchFilters: { category: "haunted-location", maxFearIndex: 8.4, sort: "fear-desc" },
  },
  skeptic: {
    title: "The Skeptic",
    description: "You need proof before panic. Even when the footage gets bad, your first instinct is still to debunk it.",
    movieTitles: ["The Visit", "Butterfly Kisses", "Savageland"],
    survivalOdds: "5/10",
    fearType: "Reality Fracture",
    searchFilters: { minRealismScore: 7.5, category: "psychological", sort: "fear-desc" },
  },
  documentarian: {
    title: "The Documentarian",
    description: "You process horror by capturing it. The camera is not distance for you. It is how you make sense of the event.",
    movieTitles: ["Lake Mungo", "Butterfly Kisses", "Savageland"],
    survivalOdds: "4/10",
    fearType: "Lingering Evidence",
    searchFilters: { listKey: "movies-that-feel-real", sort: "fear-desc" },
  },
  chaos: {
    title: "The Chaos Magnet",
    description: "You are not always the cause of the disaster, but you somehow end up in the worst possible version of it every time.",
    movieTitles: ["As Above, So Below", "REC", "Gonjiam: Haunted Asylum"],
    survivalOdds: "2/10",
    fearType: "Claustrophobic Spiral",
    searchFilters: { minFearIndex: 7.8, minDisturbingScore: 7, sort: "fear-desc" },
  },
  unlucky: {
    title: "The Unlucky Friend",
    description: "You did not ask to be the one holding the light when everything collapsed, but somehow that is always your job.",
    movieTitles: ["Hell House LLC", "Grave Encounters", "Gonjiam: Haunted Asylum"],
    survivalOdds: "2/10",
    fearType: "Escalating Haunting",
    searchFilters: { category: "haunted-location", sort: "fear-desc" },
  },
};

const fearProfiles = {
  psychological: {
    title: "Psychological Terror",
    description: "You are most affected by slow dread, unseen forces, and the feeling that reality is quietly slipping sideways.",
    movieTitles: ["Lake Mungo", "The Blair Witch Project", "Noroi: The Curse"],
    searchFilters: { category: "psychological", minRealismScore: 7, sort: "fear-desc" },
  },
  paranormal: {
    title: "Paranormal Fear",
    description: "What gets under your skin is presence. The sense that something is already in the room with you.",
    movieTitles: ["Paranormal Activity", "Hell House LLC", "Host"],
    searchFilters: { category: "haunted-location", sort: "fear-desc" },
  },
  claustrophobic: {
    title: "Claustrophobic Panic",
    description: "Tight spaces, blocked exits, and the feeling of being sealed inside the wrong place are your strongest pressure points.",
    movieTitles: ["As Above, So Below", "REC", "Grave Encounters"],
    searchFilters: { minFearIndex: 7, sort: "fear-desc" },
  },
  existential: {
    title: "Existential Dread",
    description: "You do not just fear the threat. You fear the possibility that the world itself is wrong in ways that cannot be repaired.",
    movieTitles: ["Savageland", "Butterfly Kisses", "The Borderlands"],
    searchFilters: { minRealismScore: 7, category: "psychological", sort: "fear-desc" },
  },
  shock: {
    title: "Shock / Chaos Fear",
    description: "You respond hardest to impact, violence, escalation, and the kind of footage that never gives anyone time to think.",
    movieTitles: ["REC", "Cloverfield", "Gonjiam: Haunted Asylum"],
    searchFilters: { minFearIndex: 7.8, sort: "fear-desc" },
  },
};

const personalityBaseScores = {
  a: { investigator: 2 },
  b: { documentarian: 2 },
  c: { skeptic: 2 },
  d: { curious: 2 },
  e: { survivor: 1, chaos: 1 },
};

const personalityBonuses = {
  woodsReaction: {
    a: { investigator: 1 },
    d: { survivor: 1 },
  },
  paranormalResponse: {
    d: { curious: 1 },
    e: { chaos: 1 },
  },
  horrorRole: {
    b: { documentarian: 1, unlucky: 1 },
    e: { survivor: 1 },
  },
  settingChoice: {
    a: { unlucky: 2 },
    d: { chaos: 2 },
    e: { skeptic: 1 },
  },
  mainFear: {
    b: { chaos: 1, unlucky: 1 },
    d: { unlucky: 1 },
    e: { survivor: 1 },
  },
};

function scorePersonalityQuiz(answers) {
  const scores = {
    investigator: 0,
    survivor: 0,
    curious: 0,
    skeptic: 0,
    documentarian: 0,
    chaos: 0,
    unlucky: 0,
  };

  for (const question of personalityQuizQuestions) {
    const answer = answers?.[question.id];
    if (!answer) {
      continue;
    }

    const base = personalityBaseScores[answer] || {};
    const bonus = personalityBonuses[question.id]?.[answer] || {};

    for (const [key, value] of Object.entries(base)) {
      scores[key] += value;
    }
    for (const [key, value] of Object.entries(bonus)) {
      scores[key] += value;
    }
  }

  return Object.entries(scores).sort((left, right) => right[1] - left[1]);
}

function getPersonalityOutcome(answers) {
  const [winner] = scorePersonalityQuiz(answers);
  const archetype = personalityArchetypes[winner?.[0] || "investigator"];
  const results = buildMovieResults(archetype.movieTitles, [archetype.title, archetype.fearType]);

  return {
    title: archetype.title,
    label: expandedQuizModeMeta.personality.resultLabel,
    description: archetype.description,
    statBlocks: [
      { label: "Survival Odds", value: archetype.survivalOdds },
      { label: "Fear Type", value: archetype.fearType },
    ],
    backupTitles: archetype.movieTitles.slice(1),
    searchHref: buildSearchHref(archetype.searchFilters),
    results,
  };
}

const fearProfileScoring = {
  houseOff: {
    a: { fearType: "psychological", intensity: 4 },
    b: { fearType: "paranormal", intensity: 4 },
    c: { fearType: "existential", intensity: 5 },
    d: { fearType: "claustrophobic", intensity: 5 },
    e: { fearType: "shock", intensity: 5 },
  },
  worseScenario: {
    a: { fearType: "psychological", intensity: 4 },
    b: { fearType: "paranormal", intensity: 5 },
    c: { fearType: "existential", intensity: 4 },
    d: { fearType: "claustrophobic", intensity: 5 },
    e: { fearType: "shock", intensity: 5 },
  },
  footsteps: {
    a: { fearType: "psychological", intensity: 3 },
    b: { fearType: "paranormal", intensity: 3 },
    c: { fearType: "existential", intensity: 4 },
    d: { fearType: "shock", intensity: 4 },
    e: { fearType: "claustrophobic", intensity: 4 },
  },
  lingeringFear: {
    a: { fearType: "psychological", intensity: 4 },
    b: { fearType: "shock", intensity: 4 },
    c: { fearType: "existential", intensity: 4 },
    d: { fearType: "claustrophobic", intensity: 4 },
    e: { fearType: "shock", intensity: 5 },
  },
  nightmare: {
    a: { fearType: "paranormal", intensity: 4 },
    b: { fearType: "paranormal", intensity: 5 },
    c: { fearType: "claustrophobic", intensity: 5 },
    d: { fearType: "psychological", intensity: 4 },
    e: { fearType: "existential", intensity: 5 },
  },
};

function getToleranceLabel(score) {
  if (score >= 86) return "High";
  if (score >= 70) return "Medium-High";
  if (score >= 50) return "Medium";
  return "Low";
}

function getFearProfileOutcome(answers) {
  const scores = {
    psychological: 0,
    paranormal: 0,
    claustrophobic: 0,
    existential: 0,
    shock: 0,
  };
  let intensityTotal = 0;

  for (const question of fearProfileQuizQuestions) {
    const answer = answers?.[question.id];
    const config = fearProfileScoring[question.id]?.[answer];
    if (!config) {
      continue;
    }

    scores[config.fearType] += config.intensity;
    intensityTotal += config.intensity;
  }

  const [fearTypeKey, dominantScore] = Object.entries(scores).sort((left, right) => right[1] - left[1])[0];
  const profile = fearProfiles[fearTypeKey] || fearProfiles.psychological;
  const fearScore = Math.min(100, Math.round((intensityTotal / 25) * 100 + dominantScore * 2));
  const tolerance = getToleranceLabel(fearScore);
  const results = buildMovieResults(profile.movieTitles, [profile.title, `Tolerance: ${tolerance}`]);

  return {
    title: profile.title,
    label: expandedQuizModeMeta["fear-profile"].resultLabel,
    description: profile.description,
    statBlocks: [
      { label: "Fear Score", value: `${fearScore}/100` },
      { label: "Tolerance", value: tolerance },
    ],
    backupTitles: profile.movieTitles.slice(1),
    searchHref: buildSearchHref(profile.searchFilters),
    results,
  };
}

const survivalWeights = {
  cursedTape: { a: -22, b: -10, c: -12, d: 12, e: 16 },
  splitUp: { a: -18, b: 14, c: -10, d: 12, e: -16 },
  battery: { a: -10, b: 8, c: 2, d: 12, e: -14 },
  injury: { a: 4, b: 10, c: -10, d: 12, e: -12 },
  finalExit: { a: 2, b: 10, c: -14, d: 12, e: -18 },
};

const deathScenarioScores = {
  isolation: {
    splitUp: { a: 2, e: 1 },
    finalExit: { e: 2 },
  },
  curiosity: {
    cursedTape: { a: 2, b: 1 },
    battery: { a: 1, e: 1 },
  },
  panic: {
    injury: { c: 2, e: 2 },
    finalExit: { c: 1, e: 1 },
  },
};

function getSurvivalDeathScenario(answers) {
  const totals = { isolation: 0, curiosity: 0, panic: 0 };

  for (const [scenario, mapping] of Object.entries(deathScenarioScores)) {
    for (const [questionId, values] of Object.entries(mapping)) {
      const answer = answers?.[questionId];
      totals[scenario] += values[answer] || 0;
    }
  }

  const [scenario] = Object.entries(totals).sort((left, right) => right[1] - left[1])[0];

  if (scenario === "curiosity") return "You die because you keep filming when the footage should already be over.";
  if (scenario === "panic") return "You die in the middle of a bad decision made two seconds too fast.";
  return "You die because the group splits, the route collapses, and no one finds you in time.";
}

function getSurvivalOutcome(answers) {
  let score = 50;
  for (const [questionId, values] of Object.entries(survivalWeights)) {
    score += values[answers?.[questionId]] || 0;
  }

  const survivalScore = Math.max(4, Math.min(96, score));
  const deathScenario = getSurvivalDeathScenario(answers);
  const results = survivalScore >= 65 ? getTopMoviesByFear(5.5, true, 4) : getTopMoviesByFear(7.5, false, 4);

  return {
    title: `${survivalScore}%`,
    label: expandedQuizModeMeta.survival.resultLabel,
    description: survivalScore >= 65 ? "You probably make it out, but not without the kind of footage that follows you home." : "Your odds are rough. You are exactly the kind of person these tapes punish first." ,
    statBlocks: [
      { label: "Survival %", value: `${survivalScore}%` },
      { label: "Death Scenario", value: deathScenario },
    ],
    backupTitles: results.slice(1, 3).map((result) => result.movie.title),
    searchHref: survivalScore >= 65 ? buildSearchHref({ beginnerFriendly: true, sort: "fear-desc" }) : buildSearchHref({ minFearIndex: 7.5, minDisturbingScore: 7, sort: "fear-desc" }),
    results,
  };
}

const disturbanceWeights = {
  endingTone: { a: 6, b: 5, c: 7, d: 3, e: 9 },
  realismLine: { a: 4, b: 6, c: 5, d: 7, e: 8 },
  imageType: { a: 4, b: 7, c: 6, d: 7, e: 8 },
  emotionalDamage: { a: 2, b: 4, c: 6, d: 8, e: 10 },
  tabooLevel: { a: 2, b: 4, c: 6, d: 8, e: 10 },
};

function getDisturbanceOutcome(answers) {
  let total = 0;
  for (const [questionId, values] of Object.entries(disturbanceWeights)) {
    total += values[answers?.[questionId]] || 0;
  }

  const level = Math.max(1, Math.min(10, Math.round(total / 5)));
  const tier = level >= 9 ? "Abyss Tier" : level >= 7 ? "Hard Damage" : level >= 5 ? "Dark Middle" : "Gateway Disturbing";
  const results = level >= 8 ? getTopMoviesByDisturbance(8, 10, 4) : level >= 5 ? getTopMoviesByDisturbance(6, 8.4, 4) : getTopMoviesByDisturbance(4, 6.4, 4);

  return {
    title: `${level}/10`,
    label: expandedQuizModeMeta.disturbance.resultLabel,
    description: level >= 8 ? "You are not just looking for scares. You want emotional residue, ugliness, and movies that leave a mark." : level >= 5 ? "You can handle real damage, but you still want the movie to earn it instead of just throwing misery at you." : "You like dread and discomfort, but you do not need the full punishment package every time.",
    statBlocks: [
      { label: "Tier", value: tier },
      { label: "Suggested Range", value: level >= 8 ? "Disturbing 8+" : level >= 5 ? "Disturbing 6-8" : "Disturbing 4-6" },
    ],
    backupTitles: results.slice(1, 3).map((result) => result.movie.title),
    searchHref: level >= 8 ? buildSearchHref({ minDisturbingScore: 8, sort: "fear-desc" }) : level >= 5 ? buildSearchHref({ minDisturbingScore: 6, sort: "fear-desc" }) : buildSearchHref({ minDisturbingScore: 4, maxScore: 8, sort: "fear-desc" }),
    results,
  };
}

const subgenreMapping = {
  a: "haunted-location",
  b: "cult-conspiracy",
  c: "alien",
  d: "monster",
  e: "psychological",
};

const subgenreMeta = {
  "haunted-location": {
    title: "Paranormal",
    description: "You want presence, atmosphere, and the feeling that a place itself has already turned against the people inside it.",
  },
  "cult-conspiracy": {
    title: "Cult",
    description: "You like horror where the truth is social, hidden, and slowly revealed through belief, ritual, and manipulation.",
  },
  alien: {
    title: "Sci-Fi",
    description: "Your lane is anomaly footage, impossible evidence, and the terror of reality no longer behaving like reality.",
  },
  monster: {
    title: "Monster",
    description: "You want bodies running, cameras shaking, and a physical threat that can close distance fast.",
  },
  psychological: {
    title: "Psychological",
    description: "You are here for uncertainty, dread, grief, obsession, and the kinds of tapes that keep unraveling after the credits.",
  },
};

function getSubgenreOutcome(answers) {
  const scores = {
    "haunted-location": 0,
    "cult-conspiracy": 0,
    alien: 0,
    monster: 0,
    psychological: 0,
  };

  for (const question of subgenreQuizQuestions) {
    const answer = answers?.[question.id];
    const category = subgenreMapping[answer];
    if (category) {
      scores[category] += 2;
    }
  }

  const [categoryKey] = Object.entries(scores).sort((left, right) => right[1] - left[1])[0];
  const meta = subgenreMeta[categoryKey] || subgenreMeta.psychological;
  const results = getTopMoviesForCategory(categoryKey, 4);

  return {
    title: meta.title,
    label: expandedQuizModeMeta.subgenre.resultLabel,
    description: meta.description,
    statBlocks: [
      { label: "Vault Route", value: categoryKey.replace(/-/g, " ") },
      { label: "Energy", value: meta.title === "Monster" ? "Urgent" : meta.title === "Psychological" ? "Slow-Burn" : "Escalating" },
    ],
    backupTitles: results.slice(1, 3).map((result) => result.movie.title),
    searchHref: buildSearchHref({ category: categoryKey, sort: "fear-desc" }),
    results,
  };
}

export function getExpandedQuizQuestionsForMode(mode) {
  if (mode === "personality") return personalityQuizQuestions;
  if (mode === "fear-profile") return fearProfileQuizQuestions;
  if (mode === "survival") return survivalQuizQuestions;
  if (mode === "disturbance") return disturbanceQuizQuestions;
  if (mode === "subgenre") return subgenreQuizQuestions;
  return null;
}

export function getExpandedQuizOutcome(mode, answers) {
  if (mode === "personality") return getPersonalityOutcome(answers);
  if (mode === "fear-profile") return getFearProfileOutcome(answers);
  if (mode === "survival") return getSurvivalOutcome(answers);
  if (mode === "disturbance") return getDisturbanceOutcome(answers);
  if (mode === "subgenre") return getSubgenreOutcome(answers);
  return null;
}

export function getExpandedQuizResultsForMode(mode, answers) {
  return getExpandedQuizOutcome(mode, answers)?.results || [];
}

export function getExpandedQuizSearchHref(mode, answers) {
  return getExpandedQuizOutcome(mode, answers)?.searchHref || buildSearchHref();
}
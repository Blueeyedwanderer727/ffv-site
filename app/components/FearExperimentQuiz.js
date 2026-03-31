"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import QuizModePoster from "./QuizModePoster";
import { categoryLabels, listLabels } from "../data/labels";
import { getFearExperimentTikTokUnlockAssignment } from "../data/fearExperiment";
import {
  buildQuizHref,
  buildSearchHrefForQuiz,
  formatRecommendationTag,
  formatQuizOptionLabel,
  getQuizAnswersFromSource,
  getQuizModeMeta,
  getQuizOutcomeForMode,
  getQuizQuestionsForMode,
  getQuizResultsForMode,
  getValidQuizMode,
  manualQuizMovieCount,
  quizReadyMovies,
} from "../data/quiz";

const FEAR_EXPERIMENT_UNLOCK_STORAGE_KEY = "ffv-fear-experiment-unlocks";
const FEAR_EXPERIMENT_SUPPORT_HREF = "/support";

function trackAnalyticsEvent(eventName, payload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props: payload });
  }
}

function readUnlockedModes() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(FEAR_EXPERIMENT_UNLOCK_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeUnlockedModes(modes) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FEAR_EXPERIMENT_UNLOCK_STORAGE_KEY, JSON.stringify(modes));
}

function mergeUnlockedModes(currentModes, nextModes) {
  return [...new Set([...currentModes, ...nextModes].filter(Boolean))];
}

function LockedModeActions({ mode, status, assignment, onOpenTikTokUnlock, onConfirmTikTokUnlock }) {
  const isUnlocked = status === "unlocked";
  const isAwaitingConfirmation = status === "awaiting-confirmation";
  const isMissingAssignment = !assignment?.url || status === "missing-config";
  const isComingSoon = isMissingAssignment;

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => (isAwaitingConfirmation ? onConfirmTikTokUnlock(mode.id) : onOpenTikTokUnlock(mode.id))}
        disabled={isUnlocked || isComingSoon}
        className="ff-button rounded-full px-4 py-2 text-sm font-medium"
      >
        {isUnlocked
          ? "Unlocked In Browser"
          : isComingSoon
            ? "Bonus Lab Coming Soon"
            : isAwaitingConfirmation
              ? "Confirm Unlock"
              : status === "error"
                ? "Unlock Open Failed"
                : "Unlock Lab"}
      </button>
      {assignment?.url && !isComingSoon ? (
        <Link
          href={assignment.url}
          target="_blank"
          rel="noreferrer"
          className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8"
        >
          Open Unlock Campaign
        </Link>
      ) : null}
      <Link
        href={FEAR_EXPERIMENT_SUPPORT_HREF}
        className="ff-border rounded-full px-4 py-2 text-sm text-green-50/80 hover:bg-green-400/8"
      >
        Support The Vault
      </Link>
    </div>
  );
}

function QuestionProgress({ currentStep, totalSteps }) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm text-green-100/52">
        <span>Question {Math.min(currentStep + 1, totalSteps)} of {totalSteps}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-green-300/80 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function FearExperimentQuizContent({ basePath, eyebrow, title, intro, availableModes, defaultMode, lockedModes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMode = getValidQuizMode(searchParams.get("mode")) || defaultMode || null;
  const [copyStatus, setCopyStatus] = useState("idle");
  const [unlockStatus, setUnlockStatus] = useState({});
  const [unlockedModes, setUnlockedModes] = useState([]);

  const lockedModeIds = useMemo(() => {
    return lockedModes.filter((mode) => availableModes.includes(mode) && !unlockedModes.includes(mode));
  }, [availableModes, lockedModes, unlockedModes]);

  const selectedModeLocked = selectedMode ? lockedModeIds.includes(selectedMode) : false;
  const activeMode = selectedModeLocked ? null : selectedMode;

  useEffect(() => {
    setUnlockedModes(readUnlockedModes());
  }, []);

  useEffect(() => {
    if (!selectedModeLocked || !selectedMode) {
      return;
    }

    trackAnalyticsEvent("fear_experiment_locked_track_view", {
      mode: selectedMode,
      basePath,
    });
  }, [basePath, selectedMode, selectedModeLocked]);

  const activeQuestions = useMemo(() => {
    return activeMode ? getQuizQuestionsForMode(activeMode) : [];
  }, [activeMode]);

  const answers = useMemo(() => {
    return activeMode ? getQuizAnswersFromSource(searchParams, activeQuestions) : {};
  }, [activeMode, activeQuestions, searchParams]);

  const selectedModeMeta = selectedMode ? getQuizModeMeta(selectedMode) : null;
  const selectedUnlockAssignment = selectedMode ? getFearExperimentTikTokUnlockAssignment(selectedMode) : null;

  const modeCards = useMemo(() => {
    return availableModes
      .map((mode) => {
        const meta = getQuizModeMeta(mode);
        if (!meta) {
          return null;
        }

        return {
          ...meta,
          isLocked: lockedModeIds.includes(mode),
          unlockAssignment: getFearExperimentTikTokUnlockAssignment(mode),
        };
      })
      .filter(Boolean);
  }, [availableModes, lockedModeIds]);

  const stepIndex = useMemo(() => {
    if (!activeMode) {
      return 0;
    }

    const unansweredIndex = activeQuestions.findIndex((question) => !answers[question.id]);
    return unansweredIndex === -1 ? activeQuestions.length : unansweredIndex;
  }, [activeMode, activeQuestions, answers]);

  const results = useMemo(() => {
    return activeMode ? getQuizResultsForMode(activeMode, answers).slice(0, 5) : [];
  }, [activeMode, answers]);

  const outcome = useMemo(() => (activeMode ? getQuizOutcomeForMode(activeMode, answers) : null), [activeMode, answers]);
  const totalSteps = activeQuestions.length;
  const isComplete = Boolean(activeMode) && stepIndex >= totalSteps;
  const activeQuestion = activeQuestions[stepIndex];
  const bestMatch = results[0];
  const searchHref = useMemo(() => {
    if (!activeMode) {
      return basePath;
    }

    return outcome?.searchHref || buildSearchHrefForQuiz(activeMode, answers);
  }, [activeMode, answers, basePath, outcome]);

  function replaceQuizState(nextMode, nextAnswers, nextQuestions) {
    const href = buildQuizHref(nextMode, nextAnswers, basePath, nextQuestions);
    router.replace(href, { scroll: false });
  }

  function handleAnswer(questionId, option) {
    const nextAnswers = {
      ...answers,
      [questionId]: option,
    };

    replaceQuizState(selectedMode, nextAnswers, activeQuestions);
    setCopyStatus("idle");
  }

  function restartQuiz() {
    router.replace(basePath, { scroll: false });
    setCopyStatus("idle");
  }

  function startQuiz(mode) {
    if (lockedModeIds.includes(mode)) {
      replaceQuizState(mode, {}, getQuizQuestionsForMode(mode));
      return;
    }

    const nextQuestions = getQuizQuestionsForMode(mode);
    replaceQuizState(mode, {}, nextQuestions);
    setCopyStatus("idle");
  }

  function confirmTikTokUnlock(mode) {
    const nextUnlockedModes = mergeUnlockedModes(unlockedModes, [mode]);
    setUnlockedModes(nextUnlockedModes);
    writeUnlockedModes(nextUnlockedModes);
    setUnlockStatus((currentStatus) => ({ ...currentStatus, [mode]: "unlocked" }));
  }

  function openTikTokUnlock(mode) {
    if (typeof window === "undefined") {
      return;
    }

    const assignment = getFearExperimentTikTokUnlockAssignment(mode);
    if (!assignment?.url) {
      setUnlockStatus((currentStatus) => ({ ...currentStatus, [mode]: "missing-config" }));
      return;
    }

    try {
      const unlockWindow = window.open(assignment.url, "_blank", "noopener,noreferrer");
      if (!unlockWindow) {
        throw new Error("TikTok window blocked");
      }

      setUnlockStatus((currentStatus) => ({ ...currentStatus, [mode]: "awaiting-confirmation" }));
    } catch {
      setUnlockStatus((currentStatus) => ({ ...currentStatus, [mode]: "error" }));
    }
  }

  function goBack() {
    if (stepIndex === 0) {
      return;
    }

    const nextAnswers = { ...answers };
    for (const question of activeQuestions.slice(stepIndex - 1)) {
      delete nextAnswers[question.id];
    }

    replaceQuizState(selectedMode, nextAnswers, activeQuestions);
    setCopyStatus("idle");
  }

  async function copyShareLink() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="ff-panel ff-elevated mb-8 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(61,147,88,0.24),_rgba(7,14,10,0.94)_60%)] p-6 text-center md:p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-green-300/70">{eyebrow}</p>
          <h1 className="ff-glow mb-4 text-4xl font-bold text-green-50">{title}</h1>
          <p className="mx-auto max-w-3xl text-green-50/72">
            {intro} The vault currently has {quizReadyMovies.length} indexed movies, with {manualQuizMovieCount} manually profiled titles feeding the deeper recommendation logic.
          </p>
          <div className="ff-signal-strip mx-auto mt-6 max-w-3xl justify-center">
            <span className="ff-signal-chip">{availableModes.length} catalog modes</span>
            <span className="ff-signal-chip">{availableModes.length - lockedModeIds.length} open now</span>
            <span className="ff-signal-chip">{lockedModeIds.length} bonus labs</span>
          </div>
        </div>

        {!selectedMode ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modeCards.map((mode) => (
              mode.isLocked ? (
                <div key={mode.id} className="ff-panel ff-elevated rounded-3xl p-6 text-left">
                  <QuizModePoster mode={mode} compact={true} />
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm uppercase tracking-[0.18em] text-green-300/70">
                    <span>{mode.eyebrow}</span>
                    <span className="ff-border rounded-full px-3 py-1 text-[11px] text-green-50/78">Locked</span>
                  </div>
                  <div className="mb-2 text-2xl font-semibold text-green-50">{mode.title}</div>
                  <p className="mb-4 text-green-50/70">{mode.description}</p>
                  <p className="mb-5 text-sm text-green-100/56">
                    This track is part of the next Fear Experiment rollout. Bonus lab unlock campaigns are coming soon.
                  </p>
                  <LockedModeActions
                    mode={mode}
                    status={unlockStatus[mode.id]}
                    assignment={mode.unlockAssignment}
                    onOpenTikTokUnlock={openTikTokUnlock}
                    onConfirmTikTokUnlock={confirmTikTokUnlock}
                  />
                  {!mode.unlockAssignment?.url ? (
                    <p className="mt-3 text-xs text-green-100/56">This lab is staged for a future unlock campaign.</p>
                  ) : null}
                </div>
              ) : (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => startQuiz(mode.id)}
                  className="ff-panel ff-elevated rounded-3xl p-6 text-left transition hover:-translate-y-1"
                >
                  <QuizModePoster mode={mode} compact={true} />
                  <div className="mb-3 text-sm uppercase tracking-[0.18em] text-green-300/70">{mode.eyebrow}</div>
                  <div className="mb-2 text-2xl font-semibold text-green-50">{mode.title}</div>
                  <p className="text-green-50/70">{mode.description}</p>
                </button>
              )
            ))}
          </div>
        ) : selectedModeLocked ? (
          <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Locked Track</div>
                <h2 className="mb-2 text-3xl font-semibold text-green-50">{selectedModeMeta?.title || "Fear Experiment Track"}</h2>
                <p className="max-w-2xl text-green-100/60">
                  This track is intentionally held for a later rollout. Unlock campaigns for bonus labs are coming soon.
                </p>
              </div>
              <div className="w-full max-w-[240px]">
                {selectedModeMeta ? <QuizModePoster mode={selectedModeMeta} compact={true} /> : null}
              </div>
            </div>
            <div className="ff-border mb-6 rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">
              For now, locked labs stay visible as future bonus tracks while the unlock campaign layer is being prepared.
            </div>
            <LockedModeActions
              mode={selectedModeMeta}
              status={unlockStatus[selectedMode]}
              assignment={selectedUnlockAssignment}
              onOpenTikTokUnlock={openTikTokUnlock}
              onConfirmTikTokUnlock={confirmTikTokUnlock}
            />
            {!selectedUnlockAssignment?.url ? (
              <p className="mt-3 text-xs text-green-100/56">This lab is marked as coming soon until its unlock campaign is ready.</p>
            ) : null}
          </div>
        ) : !isComplete ? (
          <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
            <QuestionProgress currentStep={stepIndex} totalSteps={totalSteps} />
            <div className="mb-6">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">{selectedModeMeta?.title || "Vault Quiz"}</div>
              <h2 className="mb-2 text-3xl font-semibold text-green-50">{activeQuestion.prompt}</h2>
              <p className="text-green-100/56">{activeQuestion.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(activeQuestion.id, option)}
                  className="ff-border rounded-2xl bg-black/20 px-4 py-4 text-left transition hover:-translate-y-1 hover:bg-green-400/8"
                >
                  <div className="text-base font-medium text-green-50">{formatQuizOptionLabel(activeQuestion.id, option)}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="ff-border rounded-full px-4 py-2 text-sm text-green-50/78 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="ff-border rounded-full px-4 py-2 text-sm text-green-50/78 hover:bg-green-400/8"
                >
                  {copyStatus === "copied" ? "Link Copied" : copyStatus === "error" ? "Copy Failed" : "Copy Share Link"}
                </button>
                <button
                  type="button"
                  onClick={restartQuiz}
                  className="ff-border rounded-full px-4 py-2 text-sm text-green-50/78 hover:bg-green-400/8"
                >
                  Change Quiz
                </button>
                <button
                  type="button"
                  onClick={restartQuiz}
                  className="ff-border rounded-full px-4 py-2 text-sm text-green-50/78 hover:bg-green-400/8"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bestMatch ? (
              <div className="ff-panel ff-elevated grid gap-6 rounded-3xl p-6 md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
                <div className="ff-border relative overflow-hidden rounded-2xl bg-black/20 aspect-[2/3]">
                  {bestMatch.movie.posterUrl ? (
                    <Image
                      src={bestMatch.movie.posterUrl}
                      alt={`${bestMatch.movie.title} poster`}
                      fill
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 220px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-green-100/45">No Poster</div>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm uppercase tracking-[0.22em] text-green-300/70">{outcome?.label || selectedModeMeta?.resultLabel || "Best Match"}</p>
                  <h2 className="mb-3 text-4xl font-bold text-green-50">{outcome?.title || bestMatch.movie.title}</h2>
                  <p className="mb-4 text-green-50/72">{outcome?.description || bestMatch.movie.synopsis}</p>
                  {outcome?.statBlocks?.length ? (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      {outcome.statBlocks.map((stat) => (
                        <div key={`${stat.label}-${stat.value}`} className="ff-border rounded-2xl bg-black/20 px-4 py-3">
                          <div className="mb-1 text-xs uppercase tracking-[0.18em] text-green-300/70">{stat.label}</div>
                          <div className="text-sm text-green-50/82">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="mb-2 text-sm uppercase tracking-[0.18em] text-green-300/70">Your Movie Match</div>
                  <div className="mb-2 text-2xl font-semibold text-green-50">{bestMatch.movie.title}</div>
                  <p className="mb-4 text-green-50/68">{bestMatch.movie.synopsis}</p>
                  {outcome?.backupTitles?.length ? (
                    <div className="mb-4 text-sm text-green-50/72">
                      <span className="text-green-300/70">Backup Matches:</span>{" "}
                      {outcome.backupTitles.join(", ")}
                    </div>
                  ) : null}
                  <div className="mb-5 flex flex-wrap gap-2 text-sm">
                    {bestMatch.matchedTraits.map((match) => (
                      <span key={match} className="ff-button rounded-full px-3 py-1">
                        {match}
                      </span>
                    ))}
                  </div>
                  {bestMatch.fit ? (
                    <div className="mb-5 space-y-3 text-sm">
                      {bestMatch.fit.categories?.length ? (
                        <div className="flex flex-wrap gap-2 text-green-50/72">
                          <span className="text-green-300/70">Categories:</span>
                          {bestMatch.fit.categories.map((category) => (
                            <span key={category} className="ff-border rounded-full px-3 py-1">
                              {categoryLabels[category] || category}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {bestMatch.fit.lists?.length ? (
                        <div className="flex flex-wrap gap-2 text-green-50/72">
                          <span className="text-green-300/70">Lists:</span>
                          {bestMatch.fit.lists.map((listKey) => (
                            <span key={listKey} className="ff-border rounded-full px-3 py-1">
                              {listLabels[listKey] || listKey}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {bestMatch.fit.tags?.length ? (
                        <div className="flex flex-wrap gap-2 text-green-50/72">
                          <span className="text-green-300/70">Tags:</span>
                          {bestMatch.fit.tags.map((tag) => (
                            <span key={tag} className="ff-border rounded-full px-3 py-1">
                              {formatRecommendationTag(tag)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {bestMatch.fit.quizTraits?.length ? (
                        <div className="flex flex-wrap gap-2 text-green-50/72">
                          <span className="text-green-300/70">Quiz Traits:</span>
                          {bestMatch.fit.quizTraits.map((trait) => (
                            <span key={trait} className="ff-border rounded-full px-3 py-1">
                              {trait}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={buildQuizHref(selectedMode, answers, `/movie/${bestMatch.movie.slug}`, activeQuestions)}
                      className="ff-button rounded-full px-5 py-3 text-sm font-medium"
                    >
                      View Movie
                    </Link>
                    <Link
                      href={searchHref}
                      className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8"
                    >
                      Open In Search
                    </Link>
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8"
                    >
                      {copyStatus === "copied" ? "Link Copied" : copyStatus === "error" ? "Copy Failed" : "Copy Share Link"}
                    </button>
                    <button
                      type="button"
                      onClick={restartQuiz}
                      className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8"
                    >
                      Retake Quiz
                    </button>
                    <button
                      type="button"
                      onClick={restartQuiz}
                      className="ff-border rounded-full px-5 py-3 text-sm text-green-50/80 hover:bg-green-400/8"
                    >
                      Switch Quiz
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="ff-panel ff-elevated rounded-3xl p-6 md:p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold">More Matches</h3>
                <Link href={searchHref} className="ff-link text-sm">
                  Open these filters in search
                </Link>
              </div>
              <ul className="space-y-3">
                {results.slice(1).map((result) => (
                  <li key={result.movie.slug} className="ff-border rounded-2xl bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <Link href={buildQuizHref(selectedMode, answers, `/movie/${result.movie.slug}`, activeQuestions)} className="text-lg font-semibold text-green-50 hover:text-green-200">
                        {result.movie.title}
                      </Link>
                      <span className="ff-border rounded-full px-3 py-1 text-xs text-green-50/72">
                        Score {result.score}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-green-50/72">
                      {result.matchedTraits.map((match) => (
                        <span key={match} className="ff-border rounded-full px-2 py-1">
                          {match}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function FearExperimentQuiz({
  basePath = "/quiz",
  eyebrow = "Fear Experiment",
  title = "Find Your Next Found Footage Watch",
  intro = "Use the live Fear Experiment tracks to turn your taste and tolerance into a recommendation lane.",
  availableModes = ["personality", "fear-profile", "survival", "disturbance", "subgenre", "simple", "traits", "intensity"],
  defaultMode = null,
  lockedModes = [],
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-6 py-12 text-white">
          <div className="ff-panel max-w-5xl mx-auto rounded-2xl p-6 text-center text-green-100/56">Loading quiz...</div>
        </main>
      }
    >
      <FearExperimentQuizContent basePath={basePath} eyebrow={eyebrow} title={title} intro={intro} availableModes={availableModes} defaultMode={defaultMode} lockedModes={lockedModes} />
    </Suspense>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categoryLabels } from "../data/labels";

const TRAILER_LOOKUP_TIMEOUT_MS = 5000;
const HOME_TRAILER_CHANNEL_STORAGE_KEY = "ffv-home-trailer-channel";
const CHANNEL_TUNING_OVERLAY_MS = 650;

function getTmdbMovieId(movie) {
  if (movie?.tmdbId) {
    return String(movie.tmdbId);
  }

  const match = movie?.tmdbUrl?.match(/\/movie\/(\d+)/i);
  return match?.[1] || "";
}

export default function HomeTrailerTV({ movies = [] }) {
  const playableMovies = useMemo(
    () => movies.filter((movie) => getTmdbMovieId(movie)),
    [movies],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [statusReason, setStatusReason] = useState(null);
  const [hasResolvedInitialChannel, setHasResolvedInitialChannel] = useState(false);
  const [isTuning, setIsTuning] = useState(false);

  const currentMovie = playableMovies[currentIndex] || null;
  const currentTmdbId = currentMovie ? getTmdbMovieId(currentMovie) : "";
  const fallbackTrailer = currentMovie?.fallbackTrailerKey
    ? {
        key: currentMovie.fallbackTrailerKey,
        name: currentMovie.fallbackTrailerName || `${currentMovie.title} Trailer`,
        site: "YouTube",
        type: "Trailer",
      }
    : null;
  const activeTrailer = trailer || fallbackTrailer;
  const isUsingFallbackTrailer = !trailer?.key && Boolean(fallbackTrailer?.key);

  useEffect(() => {
    if (!playableMovies.length) {
      return;
    }

    if (typeof window === "undefined") {
      setHasResolvedInitialChannel(true);
      return;
    }

    const savedSlug = window.localStorage.getItem(HOME_TRAILER_CHANNEL_STORAGE_KEY);
    const savedIndex = playableMovies.findIndex((movie) => movie.slug === savedSlug);
    const nextIndex = savedIndex >= 0
      ? savedIndex
      : Math.floor(Math.random() * playableMovies.length);

    setCurrentIndex(nextIndex);
    setHasResolvedInitialChannel(true);
  }, [playableMovies]);

  useEffect(() => {
    if (!hasResolvedInitialChannel || !currentMovie?.slug || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(HOME_TRAILER_CHANNEL_STORAGE_KEY, currentMovie.slug);
  }, [currentMovie?.slug, hasResolvedInitialChannel]);

  useEffect(() => {
    if (!hasResolvedInitialChannel) {
      return;
    }

    setIsTuning(true);
    const tuningTimeoutId = window.setTimeout(() => {
      setIsTuning(false);
    }, CHANNEL_TUNING_OVERLAY_MS);

    if (!currentTmdbId) {
      setTrailer(null);
      setStatusReason("missing_tmdb_id");
      setLoading(false);
      return () => window.clearTimeout(tuningTimeoutId);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TRAILER_LOOKUP_TIMEOUT_MS);

    async function loadTrailer() {
      setTrailer(null);
      setStatusReason(null);
      setLoading(true);

      try {
        const response = await fetch(`/api/trailer/${currentTmdbId}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!controller.signal.aborted) {
          setTrailer(data.trailer || null);
          setStatusReason(data.reason || null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setTrailer(null);
          setStatusReason("request_failed");
        }
        if (controller.signal.aborted) {
          setTrailer(null);
          setStatusReason("request_failed");
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) {
          setLoading(false);
        }
        if (controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTrailer();

    return () => {
      window.clearTimeout(tuningTimeoutId);
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentTmdbId, hasResolvedInitialChannel]);

  if (!playableMovies.length) {
    return null;
  }

  function showPreviousTrailer() {
    setCurrentIndex((previousIndex) =>
      (previousIndex - 1 + playableMovies.length) % playableMovies.length,
    );
  }

  function showNextTrailer() {
    setCurrentIndex((previousIndex) =>
      (previousIndex + 1) % playableMovies.length,
    );
  }

  function showChannel(index) {
    setCurrentIndex(index);
  }

  const trailerUrl = trailer?.key
    ? `https://www.youtube.com/watch?v=${trailer.key}`
    : activeTrailer?.key
      ? `https://www.youtube.com/watch?v=${activeTrailer.key}`
    : null;
  const tmdbUrl = currentTmdbId
    ? `https://www.themoviedb.org/movie/${currentTmdbId}`
    : null;

  function getFallbackState() {
    if (statusReason === "missing_credentials") {
      return {
        label: fallbackTrailer ? "Backup Feed" : "Feed Offline",
        copy:
          fallbackTrailer
            ? "TMDB is offline, so this channel is using the backup playlist."
            : "Add a TMDB token or API key in .env.local to restore live trailer lookup.",
      };
    }

    if (statusReason === "request_failed") {
      return {
        label: fallbackTrailer ? "Backup Feed" : "Signal Interrupted",
        copy:
          fallbackTrailer
            ? "The live lookup failed, so this channel dropped to the backup playlist."
            : "The live lookup failed. Check the TMDB credentials and try again.",
      };
    }

    if (statusReason === "no_trailer_found" && fallbackTrailer) {
      return {
        label: "Backup Feed",
        copy:
          "No TMDB trailer was returned, so this channel switched to the backup playlist.",
      };
    }

    return {
      label: "Signal Lost",
      copy:
        "No trailer feed is available for this file right now.",
    };
  }

  const fallbackState = getFallbackState();
  const sourceLabel = isUsingFallbackTrailer ? "Backup Tape" : "Live Feed";
  const isCheckingLiveFeed = loading && isUsingFallbackTrailer;

  return (
    <section className="ff-trailer-tv-shell">
      <div className="ff-panel ff-trailer-tv">
        <div className="ff-trailer-tv__header">
          <div>
            <p className="ff-trailer-tv__eyebrow">Archive Monitor</p>
            <h2 className="ff-safe-wrap ff-trailer-tv__title">Found Footage TV</h2>
          </div>
          <div className="ff-trailer-tv__status">
            <span className="ff-trailer-tv__rec-dot" />
            <span>Playback Live</span>
          </div>
        </div>

        <div className="ff-trailer-tv__set">
          <div className="ff-trailer-tv__cabinet">
            <div className="ff-trailer-tv__screen-bay">
              <div className="ff-trailer-tv__bezel">
                <div className="ff-trailer-tv__screen-wrap">
                  <div className="ff-trailer-tv__screen">
                    {isTuning ? (
                      <div className="ff-trailer-tv__tuning-overlay" aria-hidden="true">
                        <div className="ff-trailer-tv__tuning-copy">
                          <span className="ff-trailer-tv__tuning-label">Now Tuning</span>
                          <span className="ff-safe-wrap ff-trailer-tv__tuning-title">{currentMovie?.title}</span>
                        </div>
                      </div>
                    ) : null}
                    {loading && !activeTrailer?.key ? (
                      <div className="ff-trailer-tv__placeholder">Loading trailer feed...</div>
                    ) : activeTrailer?.key ? (
                      <iframe
                        key={`${activeTrailer.key}-${isMuted ? "muted" : "sound"}`}
                        className="ff-trailer-tv__iframe"
                        src={`https://www.youtube-nocookie.com/embed/${activeTrailer.key}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
                        title={activeTrailer.name || currentMovie?.title || "Movie Trailer"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="ff-trailer-tv__placeholder ff-trailer-tv__placeholder--fallback">
                        <div className="ff-trailer-tv__fallback-card">
                          <p className="ff-trailer-tv__fallback-label">{fallbackState.label}</p>
                          <h3 className="ff-safe-wrap ff-trailer-tv__fallback-title">
                            {currentMovie?.title}
                          </h3>
                          <p className="ff-trailer-tv__fallback-meta">
                            {currentMovie?.year ? `${currentMovie.year} Archive Entry` : "Archive Entry"}
                          </p>
                          <p className="ff-trailer-tv__fallback-copy">
                            {fallbackState.copy}
                          </p>
                          <div className="ff-trailer-tv__fallback-actions">
                            {currentMovie?.slug ? (
                              <Link href={`/movie/${currentMovie.slug}`} className="ff-trailer-tv__fallback-link">
                                Open Film File
                              </Link>
                            ) : null}
                            {tmdbUrl ? (
                              <a
                                href={tmdbUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="ff-trailer-tv__fallback-link"
                              >
                                Open TMDB File
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="ff-trailer-tv__console" aria-label="Television controls">
              <div className="ff-trailer-tv__console-panel ff-trailer-tv__console-panel--status">
                <p className="ff-trailer-tv__console-label">Source</p>
                <div className="ff-trailer-tv__meta-row">
                  <span
                    className={`ff-trailer-tv__source-badge ${isUsingFallbackTrailer ? "ff-trailer-tv__source-badge--backup" : ""}`}
                  >
                    {sourceLabel}
                  </span>
                  <span className="ff-trailer-tv__source-badge ff-trailer-tv__source-badge--audio">
                    {isMuted ? "Muted" : "Sound On"}
                  </span>
                  {isCheckingLiveFeed ? (
                    <span className="ff-trailer-tv__source-badge ff-trailer-tv__source-badge--checking">
                      <span className="ff-trailer-tv__signal-bars" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      Checking Live Feed
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="ff-trailer-tv__console-panel ff-trailer-tv__console-panel--knobs">
                <p className="ff-trailer-tv__console-label">Controls</p>
                <div className="ff-trailer-tv__power-row" aria-hidden="true">
                  <span className="ff-trailer-tv__power-light" />
                  <span className="ff-trailer-tv__power-text">Power</span>
                </div>
                <div className="ff-trailer-tv__knob-row" aria-hidden="true">
                  <span className="ff-trailer-tv__knob" />
                  <span className="ff-trailer-tv__knob ff-trailer-tv__knob--large" />
                </div>
                <div className="ff-trailer-tv__speaker-grid" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <span key={index} className="ff-trailer-tv__speaker-dot" />
                  ))}
                </div>
              </div>

              <div className="ff-trailer-tv__console-panel ff-trailer-tv__console-panel--cta">
                <p className="ff-trailer-tv__console-label">Output</p>
                <p className="ff-trailer-tv__cycle-note">
                  Autoplay is on. Channel switching stays manual.
                </p>
                <p className="ff-trailer-tv__cycle-note ff-trailer-tv__cycle-note--mobile-short">
                  Autoplay on. Manual channel switching.
                </p>
              </div>
            </aside>
          </div>

          <div className="ff-trailer-tv__stand" aria-hidden="true">
            <span className="ff-trailer-tv__stand-neck" />
            <span className="ff-trailer-tv__stand-base" />
          </div>
        </div>

        <div className="ff-trailer-tv__footer">
          <div>
            <p className="ff-trailer-tv__now-playing">Now Playing</p>
            <h3 className="ff-safe-wrap ff-trailer-tv__movie-title">
              {currentMovie?.title}
              {currentMovie?.year ? ` (${currentMovie.year})` : ""}
            </h3>
            <p className="ff-trailer-tv__deck-note">
              A routed trailer deck built into the vault. Switch channels to load the next tape.
            </p>
          </div>

          <div className="ff-trailer-tv__controls">
            {trailerUrl ? (
              <a
                href={trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="ff-trailer-tv__button ff-trailer-tv__button-link ff-trailer-tv__button-link--compact"
                aria-label="Open trailer on YouTube"
              >
                YouTube {">"}
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => setIsMuted((value) => !value)}
              className="ff-trailer-tv__button"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button type="button" onClick={showPreviousTrailer} className="ff-trailer-tv__button">
              Channel Down
            </button>
            <button type="button" onClick={showNextTrailer} className="ff-trailer-tv__button">
              Channel Up
            </button>
          </div>
        </div>

        <div className="ff-trailer-tv__channels" aria-label="Trailer channels">
          {playableMovies.map((movie, index) => (
            <button
              key={movie.slug || `${movie.title}-${movie.year || index}`}
              type="button"
              onClick={() => showChannel(index)}
              className={`ff-trailer-tv__channel ${index === currentIndex ? "ff-trailer-tv__channel--active" : ""}`}
              aria-pressed={index === currentIndex}
            >
              <span className="ff-trailer-tv__channel-number">
                CH {String(index + 1).padStart(2, "0")}
              </span>
              <span className="ff-safe-wrap ff-trailer-tv__channel-title">{movie.title}</span>
              <div className="ff-trailer-tv__channel-meta">
                <span className="ff-trailer-tv__channel-tag">
                  {categoryLabels[movie.categories?.[0]] || "Archive File"}
                </span>
                {movie.year ? (
                  <span className="ff-trailer-tv__channel-year">{movie.year}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 3200;
const EXIT_DURATION_MS = 520;

export default function HomeVhsIntro({ children }) {
  const [phase, setPhase] = useState("active");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introDuration = reducedMotion ? 900 : INTRO_DURATION_MS;
    const exitDuration = reducedMotion ? 180 : EXIT_DURATION_MS;

    const exitTimer = window.setTimeout(() => {
      setPhase("leaving");
    }, introDuration);

    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, introDuration + exitDuration);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      <div className={phase === "done" ? "ff-home-shell ff-home-shell-ready" : "ff-home-shell ff-home-shell-hidden"}>
        {children}
      </div>

      {phase !== "done" ? (
        <div
          aria-hidden="true"
          className={phase === "leaving" ? "ff-vhs-intro ff-vhs-intro-leaving" : "ff-vhs-intro"}
        >
          <div className="ff-vhs-intro-noise" />
          <div className="ff-vhs-intro-tracking" />
          <div className="ff-vhs-static-burst" />
          <div className="ff-vhs-intro-fault">
            <div className="ff-vhs-fault-core" />
            <div className="ff-vhs-fault-shift" />
            <div className="ff-vhs-fault-burn" />
          </div>

          <div className="ff-vhs-recording-frame">
            <div className="ff-vhs-recording-hud">
              <span className="ff-vhs-hud-dot" />
              <span className="ff-vhs-hud-dot ff-vhs-hud-dot-dim" />
              <span className="ff-vhs-hud-dot" />
            </div>

            <div className="ff-vault-shot">
              <img src="/creepy%20pic.jpg" alt="" className="ff-vault-photo" />
              <div className="ff-vault-shadow-pass" />
              <div className="ff-vault-dropout-line ff-vault-dropout-line-a" />
              <div className="ff-vault-dropout-line ff-vault-dropout-line-b" />
              <div className="ff-vault-timecode-bloom" />
              <div className="ff-vault-lens-smear" />
              <div className="ff-vault-vignette" />
              <div className="ff-vault-camera-bloom" />
              <div className="ff-vault-dust ff-vault-dust-a" />
              <div className="ff-vault-dust ff-vault-dust-b" />
              <div className="ff-vault-dust ff-vault-dust-c" />
            </div>

            <div className="ff-vhs-audio-meter" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="ff-vhs-copy">
            <h1 className="ff-vhs-title ff-vhs-copy-line ff-vhs-copy-title" data-text="Found Footage Vault">
              Found Footage Vault
            </h1>
          </div>
        </div>
      ) : null}
    </>
  );
}
export default function QuizModePoster({ mode, compact = false }) {
  const marks = mode.posterMarks || mode.signalWords || ["signal", "vault", "scan"];
  const visibleMarks = compact ? marks.slice(0, 2) : marks.slice(0, 3);

  return (
    <div className={`quiz-poster ${compact ? "quiz-poster-compact" : ""} ${mode.posterToneClass || ""}`}>
      <div className="quiz-poster-noise" />
      <div className="quiz-poster-grid" />
      <div className="quiz-poster-header">
        <div>
          <div className="quiz-poster-code">{mode.labCode || mode.eyebrow}</div>
          <div className="quiz-poster-warning">{mode.posterWarning || mode.alias || "Archive Track"}</div>
        </div>
        <div className="quiz-poster-stamp">{mode.icon || "VX"}</div>
      </div>

      <div className="quiz-poster-body">
        <div className="quiz-poster-title">{mode.alias || mode.title}</div>
        {!compact ? <div className="quiz-poster-subtitle">{mode.posterSubtitle || mode.eyebrow}</div> : null}
      </div>

      {!compact ? (
        <div className="quiz-poster-spectrum" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}

      <div className="quiz-poster-footer">
        {visibleMarks.map((mark) => (
          <span key={mark} className="quiz-poster-chip">
            {mark}
          </span>
        ))}
      </div>
    </div>
  );
}
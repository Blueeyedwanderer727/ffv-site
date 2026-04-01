const statusChips = ["Public access sealed", "Archive restoration in progress", "Localhost remains active"];

const recoveryNotes = [
  {
    label: "Status",
    value: "The public vault is temporarily closed while final launch work and route checks are completed.",
  },
  {
    label: "What returns",
    value: "The full archive, ranked lists, search console, and Fear Experiment return together when the site opens publicly.",
  },
  {
    label: "Current mode",
    value: "The public domain is currently limited to this holding page while the full site stays behind the lock.",
  },
];

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 text-white md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-[8%] top-[10%] h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute right-[12%] top-[18%] h-64 w-64 rounded-full bg-green-400/12 blur-3xl" />
        <div className="absolute bottom-[8%] left-[22%] h-72 w-72 rounded-full bg-emerald-300/8 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="ff-panel rounded-[2rem] border border-green-300/14 bg-[radial-gradient(circle_at_top_left,_rgba(89,255,143,0.13),_rgba(5,10,7,0.96)_58%)] px-6 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:px-8 md:py-9">
            <p className="mb-4 text-xs uppercase tracking-[0.34em] text-green-300/72">Found Footage Vault</p>
            <h1 className="ff-glow ff-safe-wrap max-w-4xl text-4xl font-bold uppercase tracking-[0.06em] text-green-50 sm:text-5xl md:text-6xl">
              Archive Access Coming Soon
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-green-50/72 md:text-lg">
              An operational discovery archive for found footage movies. Featuring the Fear Experiment.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-green-100/62">
              {statusChips.map((chip) => (
                <span key={chip} className="ff-border rounded-full bg-black/25 px-4 py-2">
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {recoveryNotes.map((note) => (
                <div key={note.label} className="ff-border rounded-[1.5rem] bg-black/22 p-5">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-green-300/70">{note.label}</p>
                  <p className="ff-safe-wrap text-sm leading-7 text-green-50/74">{note.value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="ff-panel rounded-[2rem] border border-green-300/14 bg-black/35 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-green-300/68">Vault Notice</p>
              <div className="ff-border rounded-[1.5rem] bg-[linear-gradient(180deg,_rgba(6,11,8,0.96),_rgba(2,4,3,0.98))] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-green-100/58">Transmission</span>
                  <span className="rounded-full border border-red-400/28 bg-red-500/12 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-red-200/76">
                    Hold
                  </span>
                </div>
                <p className="text-sm leading-7 text-green-50/75">
                  Public visitors are being routed to this screen while the archive remains in final development. Localhost stays available for internal build work only.
                </p>
              </div>
            </section>

            <section className="ff-panel rounded-[2rem] border border-green-300/14 bg-black/30 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.34)]">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-green-300/68">Launch Checklist</p>
              <div className="space-y-3">
                <div className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">The public domain stays on this holding page until the full archive is ready to open.</div>
                <div className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">Search, movie files, list routes, and category pages remain hidden from public traffic for now.</div>
                <div className="ff-border rounded-2xl bg-black/20 p-4 text-sm text-green-50/72">When launch is approved, the hold can be removed without rebuilding the archive itself.</div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
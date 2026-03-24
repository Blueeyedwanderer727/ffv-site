import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Found Footage Vault archive card";

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #030705 0%, #07110b 48%, #020403 100%)",
          color: "#e8f7ec",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at top left, rgba(109,255,156,0.22), transparent 36%), radial-gradient(circle at bottom right, rgba(109,255,156,0.12), transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 28,
            border: "1px solid rgba(109,255,156,0.22)",
            boxShadow: "0 0 0 1px rgba(109,255,156,0.05)",
            display: "flex",
            background: "rgba(10, 24, 16, 0.78)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "54px 62px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                textTransform: "uppercase",
                letterSpacing: "0.34em",
                color: "rgba(157,255,190,0.78)",
                marginBottom: 26,
              }}
            >
              Access The Found Footage Vault
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 840,
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textShadow: "0 0 18px rgba(109,255,156,0.22)",
              }}
            >
              Found Footage Vault
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 760,
                marginTop: 26,
                fontSize: 28,
                lineHeight: 1.45,
                color: "rgba(232,247,236,0.82)",
              }}
            >
              Search the archive, open ranked lists, run the Fear Experiment, and recover your next found footage horror watch.
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              "Search Console Live",
              "Fear Experiment Online",
              "Ranked Lists Active",
              "Category Routes Indexed",
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(109,255,156,0.18)",
                  background: "rgba(109,255,156,0.08)",
                  fontSize: 20,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(232,247,236,0.9)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og"

export const runtime = "nodejs"
export const alt = "JVican Vote Arena — Discover, Support & Cast Verified Votes"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#040404",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Subtle radial background glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Top bar: Brand + Tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #E6C875 0%, #C9A84C 50%, #9B782B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(201,168,76,0.35)",
              }}
            >
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#040404",
                  display: "flex",
                }}
              >
                V
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                JVICAN VOTE ARENA
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#C9A84C",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                }}
              >
                VERIFIED VOTING PLATFORM
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(201,168,76,0.35)",
              background: "rgba(201,168,76,0.08)",
              color: "#E6C875",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            ● Live Arena
          </div>
        </div>

        {/* Middle Hero Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "#ffffff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Discover, Support &amp;</span>
            <span
              style={{
                color: "#E6C875",
              }}
            >
              Cast Verified Votes
            </span>
          </div>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.45,
              color: "#a3a3a3",
              margin: 0,
            }}
          >
            The premier voting platform for competitions, pageants, academic awards, and talent recognitions. Frictionless ballot checkout with instant cryptographic receipts.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f5f5f5", fontSize: "14px", fontWeight: 700 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A84C" }} />
              <span>Real-Time Leaderboard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f5f5f5", fontSize: "14px", fontWeight: 700 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A84C" }} />
              <span>1,000+ Vote Qualification Standard</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f5f5f5", fontSize: "14px", fontWeight: 700 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A84C" }} />
              <span>Instant Digital Receipts</span>
            </div>
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#737373",
            }}
          >
            jvicanvotearena.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

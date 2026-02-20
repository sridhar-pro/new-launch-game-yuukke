"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import SellerCard from "./ShieldCard";

const TOTAL = 9;

// Rose-pink confetti for Women's Day
function launchCelebration() {
  const colors = ["#A00300", "#ff8fa3", "#ffffff", "#ffd6e0", "#ff4d6d"];
  confetti({
    particleCount: 120,
    spread: 100,
    colors,
    origin: { y: 0.6 },
    shapes: ["circle", "square"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 80,
      colors,
      origin: { x: 0.2, y: 0.5 },
    });
    confetti({
      particleCount: 80,
      spread: 80,
      colors,
      origin: { x: 0.8, y: 0.5 },
    });
  }, 300);
}

export default function UserProgress({ unlocked }) {
  const prevLength = useRef(0);

  useEffect(() => {
    if (unlocked.length === TOTAL && prevLength.current < TOTAL) {
      launchCelebration();
    }
    if (unlocked.length > prevLength.current && unlocked.length !== TOTAL) {
      // Mini confetti on each new unlock
      confetti({
        particleCount: 40,
        spread: 60,
        colors: ["#A00300", "#ff8fa3", "#ffd6e0"],
        origin: { y: 0.5 },
      });
    }
    prevLength.current = unlocked.length;
  }, [unlocked]);

  const percent = Math.round((unlocked.length / TOTAL) * 100);

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Google font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes reveal-bar {
          from { width: 0%; }
          to { width: var(--bar-width); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #ff8fa3, #A00300, #ffffff, #A00300, #ff8fa3);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .float-rose {
          animation: float 4s ease-in-out infinite;
        }
        .float-rose:nth-child(2) { animation-delay: 0.8s; }
        .float-rose:nth-child(3) { animation-delay: 1.6s; }
      `}</style>

      {/* Header section */}
      <div className="mb-12">
        {/* Eyebrow label */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #A00300)",
            }}
          />
          <span
            className="text-xs tracking-[0.35em] uppercase"
            style={{
              color: "#A00300",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Women's Day Sale Week
          </span>
          <div
            className="w-10 h-px"
            style={{
              background: "linear-gradient(90deg, #A00300, transparent)",
            }}
          />
        </div>

        {/* Main headline */}
        <div className="mb-2">
          <h1
            className="text-5xl md:text-6xl leading-none font-light"
            style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "-0.01em" }}
          >
            Meet Our
          </h1>
          <h1
            className="text-5xl md:text-6xl font-bold leading-none shimmer-text"
            style={{ letterSpacing: "-0.01em" }}
          >
            Sellers
          </h1>
        </div>

        <p
          className="mt-4 text-sm max-w-xs leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
          }}
        >
          9 incredible women. Revealing one by one. Watch the launch unfold
          live.
        </p>

        {/* Floating rose decorations */}
        <div className="flex gap-3 mt-5">
          {["🌹", "🌺", "🌸"].map((emoji, i) => (
            <span
              key={i}
              className="float-rose text-xl opacity-60"
              style={{ display: "inline-block", animationDelay: `${i * 0.8}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Progress tracker */}
      <div
        className="mb-10 p-5 rounded-2xl relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 0% 50%, rgba(160,3,0,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex items-center justify-between mb-3">
          <span
            className="text-sm"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Sellers Revealed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-3xl font-bold"
              style={{
                color: "#ffffff",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {unlocked.length}
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              / {TOTAL}
            </span>
            <span
              className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(160,3,0,0.2)",
                color: "#ff8fa3",
                fontFamily: "'DM Sans', sans-serif",
                border: "1px solid rgba(160,3,0,0.3)",
              }}
            >
              {percent}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {/* Track glow */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, #7a0200, #A00300, #ff6b8a)",
              boxShadow: "0 0 12px rgba(160,3,0,0.6)",
            }}
          >
            {/* Animated shimmer on bar */}
            <div
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                animation: "shimmer 2s linear infinite",
                backgroundSize: "200% auto",
              }}
            />
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-2 px-0">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: unlocked.includes(i)
                  ? "#A00300"
                  : "rgba(255,255,255,0.1)",
                boxShadow: unlocked.includes(i)
                  ? "0 0 6px rgba(160,3,0,0.8)"
                  : "none",
                transform: unlocked.includes(i) ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: TOTAL }, (_, id) => (
          <SellerCard key={id} id={id} unlocked={unlocked.includes(id)} />
        ))}
      </div>

      {/* All unlocked celebration banner */}
      {unlocked.length === TOTAL && (
        <div
          className="mt-10 py-6 px-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(160,3,0,0.15), rgba(0,9,48,0.8))",
            border: "1px solid rgba(160,3,0,0.35)",
            boxShadow: "0 0 60px rgba(160,3,0,0.12)",
          }}
        >
          {/* Background shimmer */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                "linear-gradient(135deg, transparent, rgba(255,143,163,0.1), transparent)",
            }}
          />

          <div className="text-3xl mb-3">🌹🌺🌸</div>

          <h2
            className="text-2xl font-bold shimmer-text mb-1"
            style={{ letterSpacing: "0.02em" }}
          >
            All Sellers Revealed
          </h2>
          <p
            className="text-sm"
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
            }}
          >
            The Women's Day Sale Week is officially here. Shop now.
          </p>

          <button
            className="mt-5 px-8 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #A00300, #cc0400)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 0 24px rgba(160,3,0,0.5)",
              border: "none",
            }}
          >
            Shop the Sale
          </button>
        </div>
      )}
    </div>
  );
}

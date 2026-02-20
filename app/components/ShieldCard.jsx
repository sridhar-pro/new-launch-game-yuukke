"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const TOTAL = 9;

// ViewBox 0 0 420 500
// Shield: M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z
const SPOTS = [
  { id: 0, cx: 112, cy: 116 }, // top-left
  { id: 1, cx: 210, cy: 92 }, // top-center
  { id: 2, cx: 308, cy: 116 }, // top-right
  { id: 3, cx: 84, cy: 218 }, // mid-left
  { id: 4, cx: 210, cy: 202 }, // mid-center
  { id: 5, cx: 336, cy: 218 }, // mid-right
  { id: 6, cx: 130, cy: 318 }, // lower-left
  { id: 7, cx: 290, cy: 318 }, // lower-right
  { id: 8, cx: 210, cy: 398 }, // bottom tip
];

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [5, 7],
  [4, 6],
  [4, 7],
  [6, 8],
  [7, 8],
];

// Photo radius (clip) — bigger than before
const PR = 27;
// Circle radius
const CR = 30;

function fireworks() {
  const colors = [
    "#A00300",
    "#ff8fa3",
    "#ffffff",
    "#ffd6e0",
    "#ff4d6d",
    "#FFD700",
  ];
  [0.2, 0.5, 0.8].forEach((x, i) => {
    setTimeout(() => {
      confetti({
        particleCount: 130,
        spread: 95,
        colors,
        origin: { x, y: 0.38 },
      });
    }, i * 270);
  });
}

export default function ShieldProgress({ unlocked = [] }) {
  const [launched, setLaunched] = useState(false);
  const [popping, setPopping] = useState(new Set());
  const [revealing, setRevealing] = useState(new Set()); // tracks which spots are mid-animation
  const prev = useRef([]);

  useEffect(() => {
    const fresh = unlocked.filter((id) => !prev.current.includes(id));
    if (fresh.length > 0) {
      // Start reveal animation phase
      setRevealing((p) => {
        const n = new Set(p);
        fresh.forEach((id) => n.add(id));
        return n;
      });
      setPopping((p) => {
        const n = new Set(p);
        fresh.forEach((id) => n.add(id));
        return n;
      });

      confetti({
        particleCount: 65,
        spread: 70,
        colors: ["#A00300", "#ff8fa3", "#ffd6e0"],
        origin: { y: 0.45 },
      });

      // Clear reveal after animation completes
      setTimeout(() => {
        setRevealing((p) => {
          const n = new Set(p);
          fresh.forEach((id) => n.delete(id));
          return n;
        });
      }, 1800);
      setTimeout(() => {
        setPopping((p) => {
          const n = new Set(p);
          fresh.forEach((id) => n.delete(id));
          return n;
        });
      }, 900);
    }
    if (unlocked.length === TOTAL && prev.current.length < TOTAL) {
      setTimeout(() => {
        setLaunched(true);
        fireworks();
        setTimeout(fireworks, 1700);
      }, 700);
    }
    prev.current = [...unlocked];
  }, [unlocked]);

  const on = (id) => unlocked.includes(id);
  const conn = ([a, b]) => on(a) && on(b);
  const done = unlocked.length === TOTAL;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .sp {
          font-family:'DM Sans',sans-serif;
          min-height:100vh;
          background:#000930;
          display:flex; flex-direction:column; align-items:center;
          padding:44px 16px 80px;
          position:relative; overflow:hidden;
        }
        .sp::before {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 90% 60% at 50% 0%,   rgba(160,3,0,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 70% 45% at 50% 100%, rgba(160,3,0,0.07) 0%, transparent 60%);
          pointer-events:none;
        }
        .sp-bg-dots {
          position:absolute; inset:0;
          background-image:radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size:28px 28px; pointer-events:none;
        }

        /* Header */
        .sp-hdr { position:relative; z-index:2; text-align:center; margin-bottom:36px; width:100%; max-width:520px; }
        .sp-eyebrow { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:14px; }
        .sp-el { flex:1; max-width:44px; height:1px; background:linear-gradient(90deg,transparent,#A00300); }
        .sp-er { flex:1; max-width:44px; height:1px; background:linear-gradient(90deg,#A00300,transparent); }
        .sp-et { font-size:9px; letter-spacing:.38em; text-transform:uppercase; color:#A00300; font-weight:600; }
        .sp-h1 {
          font-family:'Playfair Display',serif;
          font-size:clamp(2rem,7vw,3.5rem);
          font-weight:900; color:#fff; line-height:1.08;
        }
        .sp-h1 em {
          font-style:italic;
          background:linear-gradient(120deg,#ff8fa3 0%,#A00300 45%,#ff8fa3 100%);
          background-size:220% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:sp-shim 4s linear infinite;
        }
        .sp-sub { margin-top:10px; font-size:12.5px; color:rgba(255,255,255,.3); font-weight:300; letter-spacing:.04em; }
        .sp-pill {
          display:inline-flex; align-items:center; gap:9px; margin-top:18px;
          background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
          border-radius:999px; padding:7px 18px;
        }
        .sp-pill-dot {
          width:7px; height:7px; border-radius:50%;
          background:#A00300; box-shadow:0 0 10px #A00300;
          animation:sp-pulse 2s ease-in-out infinite;
        }
        .sp-pill-n { font-size:13px; font-weight:600; color:#fff; }
        .sp-pill-l { font-size:10px; color:rgba(255,255,255,.28); letter-spacing:.12em; }

        /* Shield */
        .sp-shield {
          position:relative; z-index:2;
          width:100%; max-width:520px;
          filter:
            drop-shadow(0 50px 100px rgba(160,3,0,0.34))
            drop-shadow(0 12px 32px rgba(0,0,0,0.75));
        }
        .sp-shield svg { width:100%; display:block; overflow:visible; }
        .sp-glow-floor {
          position:absolute; bottom:-34px; left:50%; transform:translateX(-50%);
          width:55%; height:32px;
          background:radial-gradient(ellipse, rgba(160,3,0,0.45) 0%, transparent 70%);
          filter:blur(12px); pointer-events:none;
        }

        /* Roses */
        .sp-roses { position:relative; z-index:2; margin-top:36px; display:flex; gap:18px; font-size:1.4rem; opacity:.4; }
        .sp-roses span { display:inline-block; animation:sp-float 3.5s ease-in-out infinite; }
        .sp-roses span:nth-child(2){ animation-delay:1.1s; }
        .sp-roses span:nth-child(3){ animation-delay:2.2s; }

        /* ── UNLOCK REVEAL ANIMATIONS ── */

        /* 1. Ring burst — expands outward and fades */
        @keyframes sp-ring-burst {
          0%   { r: 0;  opacity: 1; stroke-width: 4; }
          40%  { opacity: 0.8; }
          100% { r: 55; opacity: 0; stroke-width: 0.5; }
        }

        /* 2. Petals that fly outward */
        @keyframes sp-petal-0  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(-40px,-40px) scale(1) rotate(-30deg); opacity:0} }
        @keyframes sp-petal-1  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(0px,-55px) scale(1) rotate(10deg); opacity:0} }
        @keyframes sp-petal-2  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(40px,-40px) scale(1) rotate(30deg); opacity:0} }
        @keyframes sp-petal-3  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(50px,0px) scale(1) rotate(45deg); opacity:0} }
        @keyframes sp-petal-4  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(40px,40px) scale(1) rotate(60deg); opacity:0} }
        @keyframes sp-petal-5  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(-40px,40px) scale(1) rotate(-60deg); opacity:0} }
        @keyframes sp-petal-6  { 0%{transform:translate(0,0) scale(0) rotate(0deg); opacity:1}   100%{transform:translate(-52px,0px) scale(1) rotate(-45deg); opacity:0} }

        /* 3. Photo iris — the clip radius grows from 0 */
        @keyframes sp-iris {
          0%   { transform: scale(0); opacity:0; }
          30%  { opacity:1; }
          60%  { transform: scale(1.1); }
          80%  { transform: scale(0.97); }
          100% { transform: scale(1); opacity:1; }
        }

        /* 4. Shimmer sweep across photo */
        @keyframes sp-sweep {
          0%   { opacity:0; transform:translateX(-100%) skewX(-15deg); }
          40%  { opacity:0.6; }
          100% { opacity:0; transform:translateX(200%) skewX(-15deg); }
        }

        /* 5. Pop scale for whole group */
        @keyframes sp-pop {
          0%   { transform:scale(0.3); opacity:0; }
          55%  { transform:scale(1.15); opacity:1; }
          100% { transform:scale(1); }
        }

        /* Persistent glow ring */
        @keyframes sp-glow-r  { 0%,100%{opacity:.35} 50%{opacity:.85} }

        /* Connection draw */
        @keyframes sp-conn    { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }

        /* Shield pulse when done */
        @keyframes sp-spulse  { 0%,100%{opacity:.07} 50%{opacity:.18} }

        /* General */
        @keyframes sp-shim  { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes sp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)} }
        @keyframes sp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }

        /* Overlay */
        .sp-ov {
          position:fixed; inset:0; z-index:200;
          display:flex; align-items:center; justify-content:center;
          background:rgba(0,9,48,0); opacity:0; pointer-events:none;
          transition:opacity .7s ease, background .7s ease;
        }
        .sp-ov.on { opacity:1; pointer-events:all; background:rgba(0,9,48,0.94); }
        .sp-ov-inner {
          text-align:center; padding:0 24px; max-width:420px;
          transform:translateY(36px) scale(0.9); opacity:0;
          transition:transform 1s cubic-bezier(0.34,1.56,0.64,1) .12s, opacity .7s ease .12s;
        }
        .sp-ov.on .sp-ov-inner { transform:translateY(0) scale(1); opacity:1; }
        .sp-ov-roses { font-size:2rem; margin-bottom:18px; animation:sp-float 3s ease-in-out infinite; }
        .sp-ov-pre { font-family:'Playfair Display',serif; font-style:italic; font-size:13px; letter-spacing:.2em; color:rgba(255,255,255,.42); margin-bottom:10px; }
        .sp-ov-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(2.8rem,11vw,5.5rem);
          font-weight:900; font-style:italic; line-height:1;
          background:linear-gradient(135deg,#fff 0%,#ff8fa3 35%,#A00300 65%,#FFD700 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:sp-shim 2.5s linear infinite;
        }
        .sp-ov-post { font-size:11px; letter-spacing:.25em; text-transform:uppercase; color:rgba(255,255,255,.32); margin-top:10px; }
        .sp-ov-div { width:56px; height:1px; margin:22px auto; background:linear-gradient(90deg,transparent,#A00300,transparent); }
        .sp-ov-desc { font-size:13px; font-weight:300; color:rgba(255,255,255,.36); line-height:1.75; letter-spacing:.03em; margin-bottom:28px; }
        .sp-ov-cta {
          display:inline-block; padding:13px 38px; border-radius:999px;
          background:linear-gradient(135deg,#A00300,#cc0400);
          color:#fff; font-family:'DM Sans',sans-serif;
          font-size:12px; font-weight:600; letter-spacing:.18em; text-transform:uppercase;
          border:none; cursor:pointer;
          box-shadow:0 0 44px rgba(160,3,0,.65), 0 4px 20px rgba(0,0,0,.5);
          transition:transform .2s, box-shadow .2s;
        }
        .sp-ov-cta:hover { transform:scale(1.05); box-shadow:0 0 64px rgba(160,3,0,.85), 0 4px 20px rgba(0,0,0,.5); }
        .sp-ov-close {
          display:block; margin:14px auto 0;
          background:none; border:1px solid rgba(255,255,255,.12);
          color:rgba(255,255,255,.33); border-radius:999px;
          padding:7px 22px; font-size:11px; letter-spacing:.1em;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .sp-ov-close:hover { color:#fff; border-color:rgba(255,255,255,.36); }
      `}</style>

      <div className="sp">
        <div className="sp-bg-dots" />

        {/* Header */}
        <header className="sp-hdr">
          <div className="sp-eyebrow">
            <div className="sp-el" />
            <span className="sp-et">Women's Day Sale Week</span>
            <div className="sp-er" />
          </div>
          <h1 className="sp-h1">
            The Women
            <br />
            Behind <em>Yuukke</em>
          </h1>
          <p className="sp-sub">9 remarkable women. Revealed one by one.</p>
          <div className="sp-pill">
            <div className="sp-pill-dot" />
            <span className="sp-pill-n">
              {unlocked.length} / {TOTAL}
            </span>
            <span className="sp-pill-l">REVEALED</span>
          </div>
        </header>

        {/* Shield — viewBox 0 0 420 500 */}
        <div className="sp-shield">
          <svg viewBox="0 0 420 500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="spFace" cx="50%" cy="28%" r="75%">
                <stop offset="0%" stopColor="#101c52" />
                <stop offset="100%" stopColor="#000930" />
              </radialGradient>
              <linearGradient id="spBevel" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="40%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
              </linearGradient>
              <linearGradient id="spBorder" x1="0%" y1="0%" x2="100%" y2="110%">
                <stop offset="0%" stopColor="#A00300" stopOpacity="0.95" />
                <stop offset="50%" stopColor="rgba(160,3,0,0.4)" />
                <stop offset="100%" stopColor="#A00300" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="spGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="45%" stopColor="#fff" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
              <radialGradient id="spSpot" cx="50%" cy="34%" r="68%">
                <stop offset="0%" stopColor="#ff9cb4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#A00300" stopOpacity="0.55" />
              </radialGradient>
              {/* Per-spot clip paths */}
              {SPOTS.map((s) => (
                <clipPath key={s.id} id={`spC${s.id}`}>
                  <circle cx={s.cx} cy={s.cy} r={PR} />
                </clipPath>
              ))}
              {/* Sweep shimmer gradient */}
              <linearGradient id="spSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* 3D depth shadows */}
            <path
              d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
              fill="rgba(0,0,0,0.65)"
              transform="translate(6,10)"
            />
            <path
              d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
              fill="rgba(160,3,0,0.14)"
              transform="translate(3,5)"
            />

            {/* Shield face */}
            <path
              d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
              fill="url(#spFace)"
            />

            {done && (
              <path
                d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
                fill="#A00300"
                style={{ animation: "sp-spulse 2.4s ease-in-out infinite" }}
              />
            )}

            {/* Bevel */}
            <path
              d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
              fill="url(#spBevel)"
              opacity="0.5"
            />

            {/* Inner border */}
            <path
              d="M210 30 L378 84 L378 248 C378 342 286 420 210 442 C134 420 42 342 42 248 L42 84 Z"
              fill="none"
              stroke={done ? "rgba(255,215,0,0.22)" : "rgba(160,3,0,0.15)"}
              strokeWidth="1"
            />

            {/* Outer border */}
            <path
              d="M210 14 L396 72 L396 248 C396 352 296 438 210 462 C124 438 24 352 24 248 L24 72 Z"
              fill="none"
              stroke={done ? "url(#spGold)" : "url(#spBorder)"}
              strokeWidth={done ? "2.8" : "2"}
              style={done ? { filter: "drop-shadow(0 0 9px gold)" } : {}}
            />

            {/* Crown notch */}
            <path
              d="M162 30 L210 14 L258 30"
              fill="none"
              stroke={done ? "rgba(255,215,0,0.7)" : "rgba(160,3,0,0.55)"}
              strokeWidth="1.6"
            />

            {/* Watermark */}
            <text
              x="210"
              y="176"
              textAnchor="middle"
              fontSize="9"
              fontFamily="Playfair Display, serif"
              letterSpacing="7"
              fill={done ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.05)"}
            >
              {done ? "✦ SHE LEADS ✦" : "· Yuukke ·"}
            </text>

            {/* Connections */}
            {CONNECTIONS.map(([a, b], i) => {
              const sa = SPOTS[a],
                sb = SPOTS[b],
                active = conn([a, b]);
              return (
                <line
                  key={i}
                  x1={sa.cx}
                  y1={sa.cy}
                  x2={sb.cx}
                  y2={sb.cy}
                  stroke={
                    active ? "rgba(160,3,0,0.78)" : "rgba(255,255,255,0.06)"
                  }
                  strokeWidth={active ? "1.8" : "1"}
                  strokeDasharray={active ? "600" : "5 6"}
                  strokeDashoffset={active ? "0" : undefined}
                  style={
                    active
                      ? {
                          filter: "drop-shadow(0 0 5px rgba(160,3,0,0.9))",
                          animation: "sp-conn .55s ease forwards",
                        }
                      : {}
                  }
                />
              );
            })}

            {/* Spots */}
            {SPOTS.map(({ id, cx, cy }) => {
              const unlk = on(id);
              const isAnim = popping.has(id);
              const isReveal = revealing.has(id);

              return (
                <g
                  key={id}
                  style={
                    isAnim
                      ? {
                          animation:
                            "sp-pop .7s cubic-bezier(0.34,1.56,0.64,1) forwards",
                        }
                      : {}
                  }
                >
                  {/* ── UNLOCK BURST EFFECTS (only during reveal) ── */}
                  {isReveal && (
                    <>
                      {/* Expanding ring 1 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="none"
                        stroke="#A00300"
                        strokeWidth="3"
                        style={{
                          animation:
                            "sp-ring-burst 0.9s cubic-bezier(0.2,0.8,0.4,1) forwards",
                          transformOrigin: `${cx}px ${cy}px`,
                        }}
                      />
                      {/* Expanding ring 2 — delayed */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="none"
                        stroke="#ff8fa3"
                        strokeWidth="2"
                        style={{
                          animation:
                            "sp-ring-burst 1s cubic-bezier(0.2,0.8,0.4,1) 0.18s forwards",
                          transformOrigin: `${cx}px ${cy}px`,
                          opacity: 0,
                        }}
                      />
                      {/* Expanding ring 3 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="none"
                        stroke="rgba(255,215,0,0.7)"
                        strokeWidth="1.5"
                        style={{
                          animation:
                            "sp-ring-burst 1.1s cubic-bezier(0.2,0.8,0.4,1) 0.32s forwards",
                          transformOrigin: `${cx}px ${cy}px`,
                          opacity: 0,
                        }}
                      />

                      {/* Petals */}
                      {[0, 1, 2, 3, 4, 5, 6].map((p) => (
                        <ellipse
                          key={p}
                          cx={cx}
                          cy={cy}
                          rx="4"
                          ry="7"
                          fill={p % 2 === 0 ? "#ff8fa3" : "#A00300"}
                          opacity="0"
                          style={{
                            transformOrigin: `${cx}px ${cy}px`,
                            animation: `sp-petal-${p} 0.95s cubic-bezier(0.2,0.8,0.3,1) ${0.05 * p}s forwards`,
                          }}
                        />
                      ))}
                    </>
                  )}

                  {/* Persistent outer pulse ring (unlocked) */}
                  {unlk && !isReveal && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={CR + 12}
                      fill="none"
                      stroke="rgba(160,3,0,0.2)"
                      strokeWidth="1.5"
                      style={{
                        animation: "sp-glow-r 3.2s ease-in-out infinite",
                      }}
                    />
                  )}

                  {/* Drop shadow */}
                  <circle
                    cx={cx + 1.5}
                    cy={cy + 2.5}
                    r={CR + 1}
                    fill="rgba(0,0,0,0.6)"
                  />

                  {/* Main spot circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={CR}
                    fill={unlk ? "url(#spSpot)" : "rgba(255,255,255,0.03)"}
                    stroke={unlk ? "#A00300" : "rgba(255,255,255,0.08)"}
                    strokeWidth={unlk ? "2.2" : "1.2"}
                    style={
                      unlk
                        ? { filter: "drop-shadow(0 0 14px rgba(160,3,0,0.75))" }
                        : {}
                    }
                  />

                  {/* 3D highlight */}
                  <circle
                    cx={cx - 7}
                    cy={cy - 8}
                    r="9"
                    fill="rgba(255,255,255,0.08)"
                  />
                  <circle
                    cx={cx - 4}
                    cy={cy - 5}
                    r="4"
                    fill="rgba(255,255,255,0.13)"
                  />

                  {/* Photo or locked state */}
                  {unlk ? (
                    <g
                      style={
                        isReveal
                          ? {
                              animation:
                                "sp-iris 1.1s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                              transformOrigin: `${cx}px ${cy}px`,
                            }
                          : {}
                      }
                    >
                      <image
                        href={`/known/person${id + 1}.jpg`}
                        x={cx - PR}
                        y={cy - PR}
                        width={PR * 2}
                        height={PR * 2}
                        clipPath={`url(#spC${id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                      {/* Tint overlay */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={PR}
                        fill="rgba(160,3,0,0.08)"
                        clipPath={`url(#spC${id})`}
                      />
                      {/* Rose-pink ring */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={PR}
                        fill="none"
                        stroke="rgba(255,143,163,0.5)"
                        strokeWidth="1.5"
                      />

                      {/* Shimmer sweep on reveal */}
                      {isReveal && (
                        <rect
                          x={cx - PR}
                          y={cy - PR}
                          width={PR * 2}
                          height={PR * 2}
                          fill="url(#spSweep)"
                          clipPath={`url(#spC${id})`}
                          style={{
                            animation: "sp-sweep 0.8s ease 0.3s forwards",
                            opacity: 0,
                          }}
                        />
                      )}
                    </g>
                  ) : (
                    <>
                      {/* Locked — center dot + number */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill="rgba(255,255,255,0.1)"
                      />
                      <text
                        x={cx}
                        y={cy + CR + 10}
                        textAnchor="middle"
                        fontSize="9"
                        fill="rgba(255,255,255,0.16)"
                        fontFamily="DM Sans, sans-serif"
                      >
                        {String(id + 1).padStart(2, "0")}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Tip diamond */}
            <path
              d="M206 450 L210 462 L214 450 L210 455 Z"
              fill={done ? "rgba(255,215,0,0.6)" : "rgba(160,3,0,0.35)"}
            />
          </svg>

          <div className="sp-glow-floor" />
        </div>
      </div>

      {/* Launch overlay */}
      <div className={`sp-ov ${launched ? "on" : ""}`}>
        <div className="sp-ov-inner">
          <p className="sp-ov-pre">The Shield is Complete</p>
          <div className="sp-ov-title">
            Women's Day
            <br />
            Sale Week
          </div>
          <p className="sp-ov-post">is officially launched</p>
          <div className="sp-ov-div" />
          <p className="sp-ov-desc">
            9 remarkable women. One movement.
            <br />
            Shop now and celebrate with us.
          </p>
          <button className="sp-ov-cta">Shop the Sale</button>
          <button className="sp-ov-close" onClick={() => setLaunched(false)}>
            View Shield
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../../lib/firebase";

const persons = [
  { id: 0, name: "Person 1" },
  { id: 1, name: "Person 2" },
  { id: 2, name: "Person 3" },
  { id: 3, name: "Person 4" },
  { id: 4, name: "Person 5" },
  { id: 5, name: "Person 6" },
  { id: 6, name: "Person 7" },
  { id: 7, name: "Person 8" },
  { id: 8, name: "Person 9" },
];

export default function ManualApprovalPage() {
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState({});
  const [flashing, setFlashing] = useState(null);

  useEffect(() => {
    const unlockRef = ref(db, "sale/unlocked");
    const unsubscribe = onValue(unlockRef, (snapshot) => {
      setUnlocked(snapshot.exists() ? snapshot.val() : []);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (id) => {
    setLoading((l) => ({ ...l, [id]: true }));
    const unlockRef = ref(db, "sale/unlocked");
    const snapshot = await get(unlockRef);
    const current = snapshot.exists() ? snapshot.val() : [];
    if (!current.includes(id)) {
      await set(unlockRef, [...current, id]);
      setFlashing(id);
      setTimeout(() => setFlashing(null), 1200);
    }
    setLoading((l) => ({ ...l, [id]: false }));
  };

  const handleRevoke = async (id) => {
    setLoading((l) => ({ ...l, [id]: true }));
    const unlockRef = ref(db, "sale/unlocked");
    const snapshot = await get(unlockRef);
    const current = snapshot.exists() ? snapshot.val() : [];
    await set(
      unlockRef,
      current.filter((i) => i !== id),
    );
    setLoading((l) => ({ ...l, [id]: false }));
  };

  const approvedCount = unlocked.length;
  const percent = Math.round((approvedCount / persons.length) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ma-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #000930;
          padding: 52px 20px 80px;
          position: relative;
          overflow: hidden;
        }

        /* Atmosphere */
        .ma-root::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 55% at 50% 0%,   rgba(160,3,0,0.2)  0%, transparent 65%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(160,3,0,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .ma-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Layout */
        .ma-inner {
          position: relative; z-index: 2;
          width: 100%; max-width: 680px;
          margin: 0 auto;
        }

        /* Header */
        .ma-header { margin-bottom: 40px; }
        .ma-eyebrow {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
        }
        .ma-el { flex:1; max-width:44px; height:1px; background:linear-gradient(90deg,transparent,#A00300); }
        .ma-er { flex:1; max-width:44px; height:1px; background:linear-gradient(90deg,#A00300,transparent); }
        .ma-et { font-size:9px; letter-spacing:.38em; text-transform:uppercase; color:#A00300; font-weight:600; }

        .ma-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.9rem, 5vw, 3rem);
          font-weight: 900; color: #fff; line-height: 1.08;
        }
        .ma-title em {
          font-style: italic;
          background: linear-gradient(120deg, #ff8fa3, #A00300, #ff8fa3);
          background-size: 220% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ma-shim 4s linear infinite;
        }
        .ma-sub {
          margin-top: 8px; font-size: 12.5px;
          color: rgba(255,255,255,.3); font-weight: 300; letter-spacing: .04em;
        }

        /* Progress summary card */
        .ma-summary {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 20px 24px;
          margin-bottom: 28px;
          position: relative; overflow: hidden;
        }
        .ma-summary::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(160,3,0,0.5), transparent);
        }
        .ma-summary-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .ma-summary-label {
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,.35); font-weight: 500;
        }
        .ma-summary-count {
          display: flex; align-items: baseline; gap: 6px;
        }
        .ma-count-big {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1;
        }
        .ma-count-of { font-size: 13px; color: rgba(255,255,255,.3); }
        .ma-pct {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 999px; letter-spacing: .08em;
          background: rgba(160,3,0,0.18);
          border: 1px solid rgba(160,3,0,0.3);
          color: #ff8fa3;
        }

        /* Progress bar */
        .ma-bar-track {
          height: 6px; border-radius: 999px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .ma-bar-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #7a0200, #A00300, #ff6b8a);
          box-shadow: 0 0 10px rgba(160,3,0,0.6);
          transition: width 0.7s ease;
          position: relative; overflow: hidden;
        }
        .ma-bar-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          background-size: 200% auto;
          animation: ma-shim 2s linear infinite;
        }

        /* Step dots */
        .ma-dots-row {
          display: flex; gap: 6px; margin-top: 10px;
        }
        .ma-step-dot {
          flex: 1; height: 3px; border-radius: 999px;
          transition: all 0.5s;
        }
        .ma-step-dot.on {
          background: #A00300;
          box-shadow: 0 0 6px rgba(160,3,0,0.7);
        }
        .ma-step-dot.off { background: rgba(255,255,255,0.08); }

        /* Person list */
        .ma-list { display: flex; flex-direction: column; gap: 10px; }

        /* Person row */
        .ma-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: border-color 0.4s, background 0.4s, box-shadow 0.4s;
          position: relative; overflow: hidden;
        }
        .ma-row::before {
          content: ''; position: absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        }
        .ma-row.approved {
          background: rgba(160,3,0,0.06);
          border-color: rgba(160,3,0,0.28);
          box-shadow: 0 0 30px rgba(160,3,0,0.06) inset;
        }
        .ma-row.flash {
          animation: ma-flash-row 1.1s ease forwards;
        }
        @keyframes ma-flash-row {
          0%   { box-shadow: 0 0 0px rgba(160,3,0,0); }
          30%  { box-shadow: 0 0 40px rgba(160,3,0,0.4) inset; border-color: rgba(255,143,163,0.6); }
          100% { box-shadow: 0 0 30px rgba(160,3,0,0.06) inset; }
        }

        /* Avatar */
        .ma-avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          overflow: hidden; position: relative;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          transition: border-color 0.4s;
        }
        .ma-row.approved .ma-avatar {
          border-color: rgba(160,3,0,0.5);
          box-shadow: 0 0 12px rgba(160,3,0,0.3);
        }
        .ma-avatar img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; border-radius: 50%;
        }
        .ma-avatar-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.25);
        }

        /* Person info */
        .ma-info { flex: 1; min-width: 0; }
        .ma-name {
          font-size: 14px; font-weight: 600; color: #fff;
          letter-spacing: 0.02em;
        }
        .ma-id-label {
          font-size: 10px; color: rgba(255,255,255,0.25);
          letter-spacing: 0.15em; text-transform: uppercase;
          margin-top: 2px;
        }

        /* Status badge */
        .ma-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 999px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
        }
        .ma-badge.approved-badge {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #10b981;
        }
        .ma-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 6px currentColor;
          animation: ma-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes ma-dot-pulse {
          0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.65)}
        }

        /* Approve button */
        .ma-btn-approve {
          padding: 8px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #A00300, #7a0200);
          color: #fff; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          box-shadow: 0 4px 18px rgba(160,3,0,0.45);
          position: relative; overflow: hidden;
          white-space: nowrap;
        }
        .ma-btn-approve::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:1px;
          background: rgba(255,255,255,0.18);
        }
        .ma-btn-approve:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(160,3,0,0.6); }
        .ma-btn-approve:active { transform: translateY(0); }
        .ma-btn-approve:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* Revoke button */
        .ma-btn-revoke {
          padding: 8px 16px; border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.3); cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          transition: all 0.2s; white-space: nowrap;
        }
        .ma-btn-revoke:hover { border-color: rgba(239,68,68,0.4); color: #ef4444; }
        .ma-btn-revoke:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Button row */
        .ma-btn-row { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* Spinner */
        .ma-spinner {
          width: 12px; height: 12px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff; border-radius: 50%;
          animation: ma-spin 0.7s linear infinite;
          display: inline-block; vertical-align: middle; margin-right: 6px;
        }
        @keyframes ma-spin { to { transform: rotate(360deg); } }

        /* All done banner */
        .ma-done-banner {
          margin-top: 28px;
          padding: 20px 24px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(160,3,0,0.12), rgba(0,9,48,0.8));
          border: 1px solid rgba(160,3,0,0.35);
          box-shadow: 0 0 60px rgba(160,3,0,0.1);
          text-align: center;
        }
        .ma-done-roses { font-size: 1.6rem; margin-bottom: 10px; }
        .ma-done-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 900; font-style: italic;
          background: linear-gradient(120deg, #fff, #ff8fa3, #A00300);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ma-done-sub {
          margin-top: 6px; font-size: 12px;
          color: rgba(255,255,255,.35); font-weight: 300;
        }

        @keyframes ma-shim {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="ma-root">
        <div className="ma-dots" />

        <div className="ma-inner">
          {/* Header */}
          <div className="ma-header">
            <div className="ma-eyebrow">
              <div className="ma-el" />
              <span className="ma-et">Women's Day Sale Week</span>
              <div className="ma-er" />
            </div>
            <h1 className="ma-title">
              Manual <em>Reveal</em>
              <br />
              Panel
            </h1>
            <p className="ma-sub">
              Approve each person to reveal them on the live shield.
            </p>
          </div>

          {/* Progress summary */}
          <div className="ma-summary">
            <div className="ma-summary-top">
              <div>
                <div className="ma-summary-label">Shield Progress</div>
                <div className="ma-summary-count" style={{ marginTop: 6 }}>
                  <span className="ma-count-big">{approvedCount}</span>
                  <span className="ma-count-of">
                    / {persons.length} revealed
                  </span>
                </div>
              </div>
              <span className="ma-pct">{percent}%</span>
            </div>
            <div className="ma-bar-track">
              <div className="ma-bar-fill" style={{ width: `${percent}%` }}>
                <div className="ma-bar-shimmer" />
              </div>
            </div>
            <div className="ma-dots-row">
              {persons.map((p) => (
                <div
                  key={p.id}
                  className={`ma-step-dot ${unlocked.includes(p.id) ? "on" : "off"}`}
                />
              ))}
            </div>
          </div>

          {/* Person list */}
          <div className="ma-list">
            {persons.map((person, idx) => {
              const isApproved = unlocked.includes(person.id);
              const isLoading = loading[person.id];
              const isFlash = flashing === person.id;
              return (
                <div
                  key={person.id}
                  className={`ma-row${isApproved ? " approved" : ""}${isFlash ? " flash" : ""}`}
                >
                  {/* Avatar */}
                  <div className="ma-avatar">
                    {isApproved ? (
                      <img
                        src={`/known/person${person.id + 1}.jpg`}
                        alt={person.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="ma-avatar-fallback">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="ma-info">
                    <div className="ma-name">{person.name}</div>
                    <div className="ma-id-label">
                      Spot {String(person.id + 1).padStart(2, "0")} · Shield
                      Position
                    </div>
                  </div>

                  {/* Actions */}
                  {isApproved ? (
                    <div className="ma-btn-row">
                      <div className="ma-badge approved-badge">
                        <span className="ma-badge-dot" />
                        Revealed
                      </div>
                      <button
                        className="ma-btn-revoke"
                        onClick={() => handleRevoke(person.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="ma-spinner" />…
                          </>
                        ) : (
                          "Revoke"
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="ma-btn-approve"
                      onClick={() => handleApprove(person.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="ma-spinner" />
                          Revealing…
                        </>
                      ) : (
                        "✦ Reveal"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* All done banner */}
          {approvedCount === persons.length && (
            <div className="ma-done-banner">
              <div className="ma-done-title">All 9 Women Revealed</div>
              <p className="ma-done-sub">
                The shield is complete. Women's Day Sale Week is live.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

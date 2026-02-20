"use client";

import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";
import {
  loadModels,
  loadKnownFaces,
  matchFaceFromVideo,
} from "../utils/faceEngine";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

const statusConfig = {
  "Loading models...": {
    color: "#6b7280",
    label: "INITIALIZING",
    pulse: false,
  },
  Ready: { color: "#10b981", label: "READY", pulse: true },
  "Matching...": { color: "#ff8fa3", label: "SCANNING", pulse: true },
  "Not matched": { color: "#ef4444", label: "NO MATCH", pulse: false },
};

export default function AdminCamera({ onUnlock }) {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [matchLabel, setMatchLabel] = useState(null);

  const [unlockedList, setUnlockedList] = useState([]);

  useEffect(() => {
    const unlockRef = ref(db, "sale/unlocked");

    const unsubscribe = onValue(unlockRef, (snapshot) => {
      if (snapshot.exists()) {
        setUnlockedList(snapshot.val());
      } else {
        setUnlockedList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function init() {
      await loadModels();
      await loadKnownFaces();
      setReady(true);
      setStatus("Ready");
    }
    init();
  }, []);

  const capture = async () => {
    if (!ready) return;
    setScanning(true);
    setMatchLabel(null);
    setStatus("Matching...");
    const video = webcamRef.current.video;
    const match = await matchFaceFromVideo(video);
    if (match) {
      const id = parseInt(match.replace("person", "")) - 1;
      onUnlock(id);
      setMatchLabel(`Revealed: ${match}`);
      setStatus("Ready");
    } else {
      setStatus("Not matched");
      setTimeout(() => setStatus("Ready"), 2200);
    }
    setScanning(false);
  };

  const cfg = statusConfig[status] || {
    color: "#6b7280",
    label: status.toUpperCase(),
    pulse: false,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ac-root {
          min-height: 100vh;
          background: #000930;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Atmosphere */
        .ac-root::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%,   rgba(160,3,0,0.2)  0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(160,3,0,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Dot grid */
        .ac-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Ambient corner glows */
        .ac-glow-tl {
          position: absolute; top: -120px; left: -120px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(160,3,0,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .ac-glow-br {
          position: absolute; bottom: -120px; right: -120px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(160,3,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Card */
        .ac-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          margin: 24px;
          padding: 36px 32px 32px;
          background: rgba(5, 8, 28, 0.88);
          border: 1px solid rgba(160,3,0,0.3);
          border-radius: 24px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 40px 80px rgba(0,0,0,0.7),
            0 0 100px rgba(160,3,0,0.1);
          backdrop-filter: blur(28px);
        }

        /* Card top shine */
        .ac-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160,3,0,0.6), rgba(255,143,163,0.3), rgba(160,3,0,0.6), transparent);
          border-radius: 24px 24px 0 0;
        }

        /* Header */
        .ac-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px;
        }

        /* Rose icon wrap */
        .ac-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(160,3,0,0.12);
          border: 1px solid rgba(160,3,0,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(160,3,0,0.2);
        }

        .ac-title-block {}
        .ac-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 900;
          color: #fff; line-height: 1.1;
          letter-spacing: -0.01em;
        }
        .ac-title em {
          font-style: italic;
          background: linear-gradient(120deg, #ff8fa3, #A00300, #ff8fa3);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ac-shim 4s linear infinite;
        }
        .ac-subtitle {
          margin-top: 3px;
          font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.28); font-weight: 400;
        }

        /* Eyebrow divider */
        .ac-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
        }
        .ac-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160,3,0,0.4), transparent);
        }
        .ac-divider-text {
          font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
          color: rgba(160,3,0,0.7); font-weight: 600;
        }

        /* Camera wrapper */
        .ac-cam-wrap {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
          background: #02041a;
          border: 1px solid rgba(160,3,0,0.2);
          box-shadow: 0 0 40px rgba(160,3,0,0.08) inset;
        }
        .ac-cam-wrap video {
          display: block; width: 100%; border-radius: 16px;
        }

        /* Scanner overlay */
        .ac-scanner {
          position: absolute; inset: 0;
          pointer-events: none; border-radius: 16px; overflow: hidden;
        }
        .ac-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 45%, rgba(0,9,48,0.6) 100%);
          border-radius: 16px;
        }

        /* Corners — elegant thin lines */
        .ac-corner {
          position: absolute; width: 22px; height: 22px;
          border-color: #A00300; border-style: solid; opacity: 0.85;
        }
        .ac-corner.tl { top:12px; left:12px; border-width:1.5px 0 0 1.5px; border-radius:5px 0 0 0; }
        .ac-corner.tr { top:12px; right:12px; border-width:1.5px 1.5px 0 0; border-radius:0 5px 0 0; }
        .ac-corner.bl { bottom:12px; left:12px; border-width:0 0 1.5px 1.5px; border-radius:0 0 0 5px; }
        .ac-corner.br { bottom:12px; right:12px; border-width:0 1.5px 1.5px 0; border-radius:0 0 5px 0; }

        /* Corner dots */
        .ac-corner::after {
          content: '';
          position: absolute;
          width: 4px; height: 4px; border-radius: 50%;
          background: #A00300;
          box-shadow: 0 0 6px #A00300;
        }
        .ac-corner.tl::after { top:-1px; left:-1px; }
        .ac-corner.tr::after { top:-1px; right:-1px; }
        .ac-corner.bl::after { bottom:-1px; left:-1px; }
        .ac-corner.br::after { bottom:-1px; right:-1px; }

        /* Scan line */
        .ac-scan-line {
          position: absolute; left: 5%; right: 5%;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, #A00300, #ff8fa3, #A00300, transparent);
          opacity: 0; box-shadow: 0 0 14px #A00300, 0 0 28px rgba(160,3,0,0.4);
        }
        .ac-scan-line.active {
          opacity: 1;
          animation: ac-scan 1.8s cubic-bezier(0.45,0,0.55,1) infinite;
        }
        @keyframes ac-scan {
          0%   { top: 5%; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 95%; opacity: 0; }
        }

        /* Scanning face outline overlay */
        .ac-face-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 120px; height: 140px;
          border: 1.5px solid rgba(160,3,0,0.0);
          border-radius: 50%;
          transition: border-color 0.4s;
        }
        .ac-face-ring.active {
          border-color: rgba(160,3,0,0.5);
          animation: ac-face-pulse 1.6s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(160,3,0,0.2) inset;
        }
        @keyframes ac-face-pulse {
          0%,100% { border-color: rgba(160,3,0,0.3); box-shadow: 0 0 20px rgba(160,3,0,0.1) inset; }
          50%      { border-color: rgba(255,143,163,0.6); box-shadow: 0 0 30px rgba(160,3,0,0.25) inset; }
        }

        /* Status row */
        .ac-status {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px; padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }
        .ac-status-left { display: flex; align-items: center; gap: 9px; }
        .ac-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--dot-c);
          box-shadow: 0 0 10px var(--dot-c);
          flex-shrink: 0;
        }
        .ac-dot.pulse { animation: ac-dot-pulse 1.5s ease-in-out infinite; }
        @keyframes ac-dot-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.65); }
        }
        .ac-status-label {
          font-size: 10px; letter-spacing: 0.2em;
          color: var(--dot-c); font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        }
        .ac-match {
          font-size: 11px; color: #10b981; letter-spacing: 0.05em;
          font-weight: 500; display: flex; align-items: center; gap: 5px;
          animation: ac-fadein 0.4s ease;
        }
        @keyframes ac-fadein { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }

        /* Button */
        .ac-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #A00300 0%, #7a0200 100%);
          border: none; border-radius: 14px;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s;
          box-shadow: 0 4px 24px rgba(160,3,0,0.5), 0 0 0 1px rgba(255,100,100,0.1) inset;
        }
        .ac-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(160,3,0,0.65), 0 0 0 1px rgba(255,143,163,0.2) inset;
        }
        .ac-btn:active:not(:disabled) { transform: translateY(0); }
        .ac-btn:disabled { opacity: 0.38; cursor: not-allowed; }

        /* Button shimmer */
        .ac-btn-shim {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
          transform: translateX(-100%);
        }
        .ac-btn:hover .ac-btn-shim { animation: ac-shimmer 0.55s ease forwards; }
        @keyframes ac-shimmer { to { transform: translateX(100%); } }

        /* Button top highlight */
        .ac-btn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        }

        /* Spinner */
        .ac-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff; border-radius: 50%;
          animation: ac-spin 0.7s linear infinite;
          margin-right: 10px; vertical-align: middle;
        }
        @keyframes ac-spin { to { transform: rotate(360deg); } }

        /* Footer */
        .ac-footer {
          margin-top: 20px; text-align: center;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .ac-footer-line {
          flex: 1; max-width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08));
        }
        .ac-footer-line.r {
          background: linear-gradient(90deg, rgba(255,255,255,0.08), transparent);
        }
        .ac-footer-text {
          font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(255,255,255,0.13);
        }

        @keyframes ac-shim {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="ac-root">
        <div className="ac-dots" />
        <div className="ac-glow-tl" />
        <div className="ac-glow-br" />

        <div className="ac-card">
          {/* Header */}
          <div className="ac-header">
            <div className="ac-icon-wrap">
              {/* Rose / women symbol */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A00300"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C12 2 8.5 6 8.5 10a3.5 3.5 0 007 0C15.5 6 12 2 12 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 13.5V22M9 19h6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10c0 0-3.5 1-4 3.5s1.5 4 4 4 4.5-1.5 4-4-4-3.5-4-3.5z"
                />
              </svg>
            </div>
            <div className="ac-title-block">
              <div className="ac-title">
                <em>Yuukke</em> ·
              </div>
              <div className="ac-subtitle">Women's Day Launch</div>
            </div>
          </div>

          {/* Divider */}
          <div className="ac-divider">
            <div className="ac-divider-line" />
            <span className="ac-divider-text">Face Recognition</span>
            <div className="ac-divider-line" />
          </div>

          {/* Camera */}
          <div className="ac-cam-wrap">
            <Webcam
              ref={webcamRef}
              style={{ display: "block", width: "100%", borderRadius: 16 }}
            />
            <div className="ac-scanner">
              <div className="ac-vignette" />
              <div className={`ac-scan-line${scanning ? " active" : ""}`} />
              <div className={`ac-face-ring${scanning ? " active" : ""}`} />
              <div className="ac-corner tl" />
              <div className="ac-corner tr" />
              <div className="ac-corner bl" />
              <div className="ac-corner br" />
            </div>
          </div>

          {/* Status */}
          <div className="ac-status">
            <div className="ac-status-left" style={{ "--dot-c": cfg.color }}>
              <div className={`ac-dot${cfg.pulse ? " pulse" : ""}`} />
              <span className="ac-status-label">{cfg.label}</span>
            </div>
            {(matchLabel || unlockedList.length > 0) && (
              <span className="ac-match">
                {matchLabel ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {matchLabel}
                  </>
                ) : (
                  <>Approved Users: {unlockedList.join(", ")}</>
                )}
              </span>
            )}
          </div>

          {/* Button */}
          <button
            className="ac-btn"
            onClick={capture}
            disabled={!ready || scanning}
          >
            <div className="ac-btn-shim" />
            {scanning && <span className="ac-spinner" />}
            {scanning ? "Recognising…" : "Capture & Reveal"}
          </button>

          {/* Footer */}
          <div className="ac-footer">
            <div className="ac-footer-line" />
            <span className="ac-footer-text">Yuukke · Women's Day 2025</span>
            <div className="ac-footer-line r" />
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import confetti from "canvas-confetti";

const TOTAL = 10;

export default function ShieldWall({ unlocked }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!unlocked.length) return;

    const last = unlocked[unlocked.length - 1];
    const slot = document.getElementById(`slot-${last}`);

    if (slot) {
      gsap.fromTo(
        slot,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
      );
    }

    if (unlocked.length === TOTAL) {
      confetti({ particleCount: 250, spread: 150 });
    }
  }, [unlocked]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto aspect-[4/5]"
    >
      {/* Shield Background */}
      <img
        src="/shield-bg.jpg"
        alt="Shield"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Socket Overlay */}
      {socketPositions.map((pos, index) => {
        const isUnlocked = unlocked.includes(index);

        return (
          <div
            key={index}
            id={`slot-${index}`}
            className="absolute flex items-center justify-center rounded-full overflow-hidden transition-all duration-500"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.size,
              height: pos.size,
              transform: "translate(-50%, -50%)",
            }}
          >
            {isUnlocked ? (
              <img
                src={`/known/person${index + 1}.jpg`}
                className="w-full h-full object-cover rounded-full border-4 border-yellow-400 shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-full opacity-80" />
            )}
          </div>
        );
      })}

      {/* Final Tick */}
      {unlocked.length === TOTAL && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 rounded-full p-6 shadow-2xl animate-bounce">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

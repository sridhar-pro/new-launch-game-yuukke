"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/app/lib/firebase";
import ShieldProgress from "@/app/components/ShieldCard";

export default function ProgressPage() {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    const unlockRef = ref(db, "sale/unlocked");
    const unsubscribe = onValue(unlockRef, (snapshot) => {
      setUnlocked(snapshot.exists() ? snapshot.val() : []);
    });
    return () => unsubscribe();
  }, []);

  // ShieldProgress owns its own full-page layout and background
  return <ShieldProgress unlocked={unlocked} />;
}

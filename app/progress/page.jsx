"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getFirebaseDB } from "@/app/lib/firebase";
import ShieldProgress from "@/app/components/ShieldCard";

export default function ProgressPage() {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    const db = getFirebaseDB();
    if (!db) return;

    const unlockRef = ref(db, "sale/unlocked");

    const unsubscribe = onValue(unlockRef, (snapshot) => {
      if (snapshot.exists()) {
        setUnlocked(snapshot.val()); // ✅ correct setter
      } else {
        setUnlocked([]); // ✅ correct setter
      }
    });

    return () => unsubscribe();
  }, []);

  return <ShieldProgress unlocked={unlocked} />;
}

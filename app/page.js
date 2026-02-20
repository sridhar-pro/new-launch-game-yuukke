"use client";

export const dynamic = "force-dynamic";

import { ref, get, set } from "firebase/database";
import { getFirebaseDB } from "@/app/lib/firebase";
import AdminCamera from "@/app/components/AdminCamera";

export default function AdminPage() {
  const handleUnlock = async (id) => {
    const db = getFirebaseDB();
    if (!db) return; // prevent SSR/build crash

    const unlockRef = ref(db, "sale/unlocked");
    const snapshot = await get(unlockRef);

    let current = snapshot.exists() ? snapshot.val() : [];

    if (!current.includes(id)) {
      await set(unlockRef, [...current, id]);
    }
  };

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <AdminCamera onUnlock={handleUnlock} />
    </div>
  );
}

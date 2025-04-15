import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { app } from "./firebase-config";

// Fetch top N leaderboard entries from Firestore
export async function fetchLeaderboardEntries(topN = 10) {
  const db = getFirestore(app);
  const leaderboardRef = collection(db, "leaderboard");
  const q = query(leaderboardRef, orderBy("score", "desc"), limit(topN));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, idx) => ({
    id: doc.id,
    ...doc.data(),
    rank: idx + 1,
  }));
}

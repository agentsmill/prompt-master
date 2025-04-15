import React, { useEffect, useState } from "react";
import "../../styles/index.css";
import LeaderboardList from "./LeaderboardList";
import { fetchLeaderboardEntries } from "../../firebase/firestore-utils";
import { useUser } from "../../context/UserContext";

function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser ? useUser() : { user: null };

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const data = await fetchLeaderboardEntries(10);
        setEntries(data);
      } catch (e) {
        setEntries([]);
      }
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  return (
    <section className="leaderboard-container">
      <h1>Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <LeaderboardList
          entries={entries.map((entry) => ({
            ...entry,
            highlight: user && entry.userId === user.uid,
          }))}
        />
      )}
    </section>
  );
}

export default Leaderboard;

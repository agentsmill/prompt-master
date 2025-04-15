import React from "react";
import LeaderboardEntry from "./LeaderboardEntry";

function LeaderboardList({ entries }) {
  return (
    <ul>
      {entries.map((entry, idx) => (
        <LeaderboardEntry
          key={entry.id || idx}
          username={entry.username || entry.displayName || "Anonymous"}
          score={entry.score}
          rank={entry.rank}
          highlight={entry.highlight}
        />
      ))}
    </ul>
  );
}

export default LeaderboardList;

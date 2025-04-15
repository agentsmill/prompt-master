import React from "react";

function LeaderboardEntry({ username, score, rank, highlight }) {
  return (
    <li style={highlight ? { fontWeight: "bold", color: "#007bff" } : {}}>
      #{rank} {username}: {score}
    </li>
  );
}

export default LeaderboardEntry;

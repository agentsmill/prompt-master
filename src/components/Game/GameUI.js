import React from "react";

function GameUI({ gameState, onAction }) {
  // Placeholder UI for game state
  return (
    <div>
      <p>Game State: {JSON.stringify(gameState)}</p>
      <button onClick={() => onAction("advance")}>Advance</button>
    </div>
  );
}

export default GameUI;

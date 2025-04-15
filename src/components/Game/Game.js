import React from "react";
import "../../styles/index.css";
import { GameStateProvider, useGameState } from "./GameState";
import { advanceGameState } from "./GameLogic";
import GameUI from "./GameUI";

function GameInner() {
  const { gameState, setGameState } = useGameState();

  const handleAction = (action) => {
    if (action === "advance" && !gameState.completed) {
      setGameState(advanceGameState(gameState));
    }
  };

  return (
    <section className="game-container">
      <h1>Prompt Engineering Game</h1>
      <GameUI gameState={gameState} onAction={handleAction} />
      {gameState.completed && (
        <div>
          <h2>Game Completed!</h2>
          <p>Your score: {gameState.score}</p>
          {/* TODO: Add navigation to leaderboard or restart */}
        </div>
      )}
    </section>
  );
}

function Game() {
  return (
    <GameStateProvider>
      <GameInner />
    </GameStateProvider>
  );
}

export default Game;

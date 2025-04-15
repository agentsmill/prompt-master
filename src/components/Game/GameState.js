import React, { createContext, useContext, useState } from "react";
import { initializeGameState } from "./GameLogic";

const GameStateContext = createContext();

export function GameStateProvider({ children }) {
  const [gameState, setGameState] = useState(initializeGameState());

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  return useContext(GameStateContext);
}

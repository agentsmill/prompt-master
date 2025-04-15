export function initializeGameState() {
  // Initial game state structure
  return {
    step: 0,
    score: 0,
    completed: false,
  };
}

export function advanceGameState(gameState) {
  // Example logic: advance step, increment score, mark as completed at step 3
  const nextStep = gameState.step + 1;
  return {
    ...gameState,
    step: nextStep,
    score: gameState.score + 10,
    completed: nextStep >= 3,
  };
}

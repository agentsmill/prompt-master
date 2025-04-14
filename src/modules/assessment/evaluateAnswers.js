/**
 * Evaluates user answers against correct answers and returns a score.
 * @param {Array} userAnswers - Array of user answers.
 * @param {Array} correctAnswers - Array of correct answers.
 * @returns {number} Score (number of correct answers).
 */
export function evaluateAnswers(userAnswers, correctAnswers) {
  if (!Array.isArray(userAnswers) || !Array.isArray(correctAnswers)) return 0;
  let score = 0;
  for (let i = 0; i < correctAnswers.length; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
      score++;
    }
  }
  return score;
}

import { evaluateAnswers } from "../evaluateAnswers";

describe("Assessment Module", () => {
  it("evaluates user answers and returns a score", () => {
    const userAnswers = ["A", "B", "C"];
    const correctAnswers = ["A", "B", "D"];
    const score = evaluateAnswers(userAnswers, correctAnswers);
    expect(score).toBe(2);
  });
});

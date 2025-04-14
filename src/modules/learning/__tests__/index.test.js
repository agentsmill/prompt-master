import { loadLesson } from "../lessonLoader";

describe("Learning Module", () => {
  it("loads and displays a lesson", () => {
    const lesson = loadLesson("lesson-1");
    expect(lesson).toHaveProperty("id", "lesson-1");
    expect(lesson).toHaveProperty("title");
    expect(lesson).toHaveProperty("content");
  });
});

import React from "react";
import { useParams } from "react-router-dom";
import { loadLesson } from "../../modules/learning/lessonLoader";

function LessonDetailPage() {
  const { lessonId } = useParams();
  // Get language from localStorage, default to "pl"
  const lang = localStorage.getItem("mp_lang") || "pl";
  const lesson = loadLesson(lessonId, lang);

  // Convert lessonId to integer for navigation logic
  const lessonNum = parseInt(lessonId, 10);

  return (
    <section className="pixel-container">
      <h2 className="pixel-title">{lesson.title}</h2>
      <p className="pixel-intro">{lesson.content}</p>
      <div
        style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {lessonNum > 1 && (
          <button
            className="btn btn-outline"
            onClick={() =>
              (window.location.hash = `#/lessons/${lessonNum - 1}`)
            }
          >
            Poprzedni poziom
          </button>
        )}
        <button
          className="btn btn-outline"
          onClick={() => (window.location.hash = "#/lessons")}
        >
          Lista poziomów
        </button>
        {/* Assume there are at least 2 lessons for now */}
        {lessonNum < 2 && (
          <button
            className="btn"
            onClick={() =>
              (window.location.hash = `#/lessons/${lessonNum + 1}`)
            }
          >
            Następny poziom
          </button>
        )}
      </div>
    </section>
  );
}

export default LessonDetailPage;

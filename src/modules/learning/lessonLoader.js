/**
 * Loads a lesson by ID (mock implementation).
 * In a real app, this would fetch from Firebase or local storage.
 */
const lessons = {
  1: {
    pl: {
      id: "1",
      title: "Wprowadzenie do Prompt Engineeringu",
      content:
        "Prompt engineering to sztuka tworzenia skutecznych poleceń dla modeli AI. W tym poziomie poznasz podstawy i zobaczysz przykłady dobrych promptów.",
    },
    en: {
      id: "1",
      title: "Introduction to Prompt Engineering",
      content:
        "Prompt engineering is the art of crafting effective instructions for AI models. In this level, you'll learn the basics and see examples of good prompts.",
    },
  },
  2: {
    pl: {
      id: "2",
      title: "Techniki Precyzowania",
      content:
        "Dowiesz się, jak zadawać precyzyjne pytania i ograniczać odpowiedzi AI do pożądanych zakresów.",
    },
    en: {
      id: "2",
      title: "Precision Techniques",
      content:
        "You'll learn how to ask precise questions and constrain AI responses to desired ranges.",
    },
  },
  // Add more lessons as needed
};

export function loadLesson(lessonId, lang = "pl") {
  const lesson = lessons[lessonId];
  if (!lesson) {
    return {
      id: lessonId,
      title: lang === "pl" ? "Nie znaleziono poziomu" : "Level Not Found",
      content:
        lang === "pl"
          ? "Ten poziom nie istnieje lub nie został jeszcze dodany."
          : "This level does not exist or has not been added yet.",
    };
  }
  return lesson[lang] || lesson["pl"];
}

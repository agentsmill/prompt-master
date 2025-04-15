import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";

const translations = {
  pl: {
    title: "⚡ Mistrz Promptów Energetycznych ⚡",
    subtitle: "Interaktywny Trening Prompt Engineeringu",
    intro: `Witaj! Ta gra pomoże Ci opanować sztukę tworzenia skutecznych promptów dla modeli AI, skupiając się na tematyce transformacji energetycznej.

Nauczysz się różnych technik, od podstawowych po zaawansowane, i przećwiczysz je w praktyce.`,
    howto: "Jak Grać?",
    list: [
      "✅ Czytaj wyjaśnienie każdej techniki (z przykładami!).",
      "✅ Rozwiązuj zadania i zdobywaj punkty.",
      "✅ Awansuj w rankingu i zostań Mistrzem Promptów!",
    ],
    newGame: "Nowa Gra",
    lang: "Polski",
    switchLang: "English",
  },
  en: {
    title: "⚡ Prompt Master of Energy ⚡",
    subtitle: "Interactive Prompt Engineering Training",
    intro: `Welcome! This game will help you master the art of creating effective prompts for AI models, focusing on energy transformation topics.

You will learn various techniques, from basic to advanced, and practice them in real scenarios.`,
    howto: "How to Play?",
    list: [
      "✅ Read the explanation for each technique (with examples!).",
      "✅ Solve tasks and earn points.",
      "✅ Climb the leaderboard and become the Prompt Master!",
    ],
    newGame: "New Game",
    lang: "English",
    switchLang: "Polski",
  },
};

function LandingPage() {
  const [lang, setLang] = useState(
    () => localStorage.getItem("mp_lang") || "pl"
  );
  const t = translations[lang];
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("mp_lang", lang);
  }, [lang]);

  const handleNewGame = () => {
    navigate("/main"); // Go to MainScreen per new architecture
  };

  return (
    <section className="pixel-container">
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}
      >
        <button
          className="btn btn-outline"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "0.8rem",
          }}
          onClick={() => setLang(lang === "pl" ? "en" : "pl")}
        >
          {t.switchLang}
        </button>
      </div>
      <h1 className="pixel-title">{t.title}</h1>
      <h2 className="pixel-subtitle">{t.subtitle}</h2>
      <p className="pixel-intro">{t.intro}</p>
      <h3 className="pixel-howto">{t.howto}</h3>
      <ul className="pixel-list">
        {t.list.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <button
        className="btn"
        style={{
          marginTop: 24,
          fontFamily: "'Press Start 2P', cursive",
          fontSize: "1rem",
        }}
        onClick={handleNewGame}
      >
        {t.newGame}
      </button>
    </section>
  );
}

export default LandingPage;

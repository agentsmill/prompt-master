import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/index.css";

function MainScreen() {
  const navigate = useNavigate();

  return (
    <section className="main-screen-container">
      <h1>Welcome to the Prompt Engineering E-Learning Platform!</h1>
      <p>
        Here you can learn, practice, and master prompt engineering skills
        through interactive modules and games.
      </p>
      <h2>Instructions</h2>
      <ul>
        <li>Read the instructions for each module or game.</li>
        <li>Complete tasks to earn points and improve your ranking.</li>
        <li>Check the leaderboard to see how you compare with others.</li>
      </ul>
      <div className="main-screen-navigation" style={{ marginTop: 24 }}>
        <button className="btn" onClick={() => navigate("/game")}>
          Start Game
        </button>
        <button
          className="btn btn-outline"
          style={{ marginLeft: 16 }}
          onClick={() => navigate("/leaderboard")}
        >
          Leaderboard
        </button>
      </div>
    </section>
  );
}

export default MainScreen;

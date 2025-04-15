import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

// Import monitoring system
import initializeMonitoring from "./monitoring/monitoring-setup";

// Core components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LoadingScreen from "./components/common/LoadingScreen";

// Pages
import LandingPage from "./components/LandingPage/LandingPage";
import MainScreen from "./components/MainScreen/MainScreen";
import Game from "./components/Game/Game";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import MonitoringDashboard from "./components/admin/MonitoringDashboard";

// Context
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NetworkStatusProvider } from "./context/NetworkStatusContext";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Initialize monitoring system
    if (process.env.NODE_ENV === "production") {
      initializeMonitoring();
    }

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NetworkStatusProvider>
      <ThemeProvider>
        <UserProvider value={{ user }}>
          <Router>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/main" element={<MainScreen />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </NetworkStatusProvider>
  );
}

export default App;

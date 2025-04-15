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
import HomePage from "./components/pages/HomePage";
import LessonsPage from "./components/pages/LessonsPage";
import LessonDetailPage from "./components/pages/LessonDetailPage";
import ProfilePage from "./components/pages/ProfilePage";
import LeaderboardPage from "./components/pages/LeaderboardPage";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import NotFoundPage from "./components/pages/NotFoundPage";
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/lessons" element={<LessonsPage />} />
                  <Route
                    path="/lessons/:lessonId"
                    element={<LessonDetailPage />}
                  />
                  <Route
                    path="/profile"
                    element={user ? <ProfilePage /> : <Navigate to="/login" />}
                  />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route
                    path="/login"
                    element={!user ? <LoginPage /> : <Navigate to="/profile" />}
                  />
                  <Route
                    path="/register"
                    element={
                      !user ? <RegisterPage /> : <Navigate to="/profile" />
                    }
                  />
                  <Route
                    path="/admin/monitoring"
                    element={
                      user &&
                      user.email === process.env.REACT_APP_ADMIN_EMAIL ? (
                        <MonitoringDashboard />
                      ) : (
                        <Navigate to="/" />
                      )
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
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

/**
 * UI Interaction Handler
 * Initializes the GameEngine and connects UI elements (prompt input) to it.
 */
import { GameEngine } from "./GameEngine.js";

// Wait for the DOM to be fully loaded before initializing
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing UI and Game Engine...");

  // --- Get UI Element References ---
  const promptInput = document.getElementById("prompt-input");
  const submitButton = document.getElementById("submit-prompt");
  const canvasElement = document.getElementById("game-canvas"); // Needed for engine

  // Screen Elements
  const screens = {
    start: document.getElementById("start-screen"),
    instructions: document.getElementById("instructions-screen"),
    game: document.getElementById("game-screen"),
    summary: document.getElementById("summary-screen"),
    educational: document.getElementById("educational-screen"),
  };

  // Button Elements
  const startGameBtn = document.getElementById("start-game-btn");
  const instructionsBtn = document.getElementById("instructions-btn");
  const educationBtn = document.getElementById("education-btn");
  const backToStartBtns = document.querySelectorAll(".back-to-start-btn"); // Multiple back buttons
  const finalScoreSpan = document.getElementById("final-score");
  const langButtons = document.querySelectorAll(".lang-btn");
  // Auth elements
  const authContainer = document.getElementById("auth-container");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfoDiv = document.getElementById("user-info");
  const userNameSpan = document.getElementById("user-name");
  // Leaderboard elements
  const leaderboardBtn = document.getElementById("leaderboard-btn");
  const leaderboardList = document.getElementById("leaderboard-list");
  const leaderboardScreen = document.getElementById("leaderboard-screen");

  // --- Internationalization (i18n) --- 
  let currentLang = localStorage.getItem('preferredLang') || 'en'; // Default to English
  let translations = {};

  async function loadTranslations(lang) {
      try {
          const response = await fetch(`js/locales/${lang}.json`);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          translations = await response.json();
          console.log(`Translations loaded for ${lang}`);
      } catch (error) {
          console.error(`Could not load translations for ${lang}:`, error);
          // Optionally load default (e.g., English) as fallback
          if (lang !== 'en') {
              await loadTranslations('en'); 
          }
      }
  }

  function applyTranslations() {
      if (!translations) return;
      console.log("Applying translations...");
      
      // Helper function to set text or attribute
      const setText = (selector, textKey, attribute = null, defaultText = null) => {
          const element = document.querySelector(selector);
          if (element && translations[textKey]) {
              if (attribute) {
                  element.setAttribute(attribute, translations[textKey]);
              } else {
                  element.textContent = translations[textKey];
              }
          } else if (element) {
               console.warn(`Translation key '${textKey}' not found for selector '${selector}'`);
          } else {
               console.warn(`Element not found for selector: ${selector}`);
          }
      };
      
      // Apply translations using keys from JSON files
      setText('h1', 'appTitle');
      setText('#start-screen h2', 'startScreenTitle');
      setText('#start-game-btn', 'startGameBtn');
      setText('#instructions-btn', 'instructionsBtn');
      setText('#education-btn', 'educationBtn');
      setText('#instructions-screen h2', 'instructionsScreenTitle');
      setText('.back-to-start-btn', 'backBtn'); // Applies to first found, need to handle multiples
      document.querySelectorAll(".back-to-start-btn").forEach(btn => { // Handle multiple back buttons
          if (translations.backBtn) btn.textContent = translations.backBtn;
      });
      setText('#summary-screen h2', 'summaryScreenTitle');
      setText('#summary-screen p:nth-of-type(2)', 'summaryScorePrefix'); // Target score prefix paragraph
       // Keep score span separate: document.getElementById("final-score") 
       setText('#summary-screen p:nth-of-type(1)', 'summaryText'); // Target summary text paragraph
      setText('#summary-screen .back-to-start-btn', 'playAgainBtn'); // Specifically target Play Again button
      setText('#education-screen h2', 'educationScreenTitle');
      setText('#prompt-input', 'promptPlaceholder', 'placeholder');
      setText('#submit-prompt', 'submitBtn');
      setText('.lang-btn[data-lang="en"]', 'langEn');
      setText('.lang-btn[data-lang="pl"]', 'langPl');
      // Apply translations for new buttons
      setText('#login-btn', 'loginBtnText', null, "Login with Google"); // Add default text
      setText('#logout-btn', 'logoutBtnText', null, "Logout");
      setText('#leaderboard-btn', 'leaderboardBtnText', null, "Leaderboard");
      setText('#leaderboard-screen h2', 'leaderboardTitleText', null, "Leaderboard");

      // Instructions Paragraphs
      setText('#instructions-screen p:nth-of-type(1)', 'instructionsP1');
      setText('#instructions-screen p:nth-of-type(2)', 'instructionsP2');
      setText('#instructions-screen p:nth-of-type(3)', 'instructionsP3');
      
       // Education Paragraphs (Using more specific selectors or adding IDs would be more robust)
      const eduScreen = document.getElementById('educational-screen');
      if (eduScreen) {
          const setEduText = (pIndex, titleKey, textKey) => {
              const p = eduScreen.querySelectorAll('p')[pIndex];
              if (p && translations[titleKey] && translations[textKey]) {
                  p.innerHTML = `<strong>${translations[titleKey]}</strong> ${translations[textKey]}`;
              }
          };
          setEduText(0, 'educationP1Title', 'educationP1Text');
          setEduText(1, 'educationP2Title', 'educationP2Text');
          setEduText(2, null, 'educationP3Text'); // Paragraph 3 has no title key
          setEduText(3, 'educationP4Title', 'educationP4Text');
          setEduText(4, 'educationP5Title', 'educationP5Text');
          setEduText(5, 'educationP6Title', 'educationP6Text');
          setEduText(6, 'educationP7Title', 'educationP7Text');
          setEduText(7, 'educationP8Title', 'educationP8Text');
          setEduText(8, 'educationP9Title', 'educationP9Text');
          setEduText(9, 'educationP10Title', 'educationP10Text');
          setEduText(10, 'educationP11Title', 'educationP11Text');
      }
      
      console.log("Translations applied.");
  }

  async function setLanguage(lang) {
      if (lang !== 'en' && lang !== 'pl') {
          console.warn(`Unsupported language: ${lang}. Defaulting to 'en'.`);
          lang = 'en';
      }
      currentLang = lang;
      localStorage.setItem('preferredLang', lang); // Save preference
      document.documentElement.lang = lang; // Update html lang attribute
      await loadTranslations(lang);
      applyTranslations();

       // Update active state on buttons
       langButtons.forEach(btn => {
           if (btn.dataset.lang === lang) {
               btn.classList.add('active'); // Needs CSS for .active state
           } else {
               btn.classList.remove('active');
           }
       });
  }

  // Add event listeners to language buttons
  langButtons.forEach(button => {
      button.addEventListener('click', (event) => {
          setLanguage(event.target.dataset.lang);
      });
  });

  // --- Basic Validation ---
  if (!promptInput || !submitButton || !canvasElement) {
    console.error(
      "UI Error: Required elements (prompt-input, submit-prompt, or game-canvas) not found in the DOM."
    );
    // Display an error message to the user?
    const errorContainer =
      document.getElementById("game-container") || document.body;
    const errorMsg = document.createElement("p");
    errorMsg.textContent =
      "Error: UI components failed to load. Please refresh.";
    errorMsg.style.color = "red";
    errorMsg.style.marginTop = "10px";
    errorContainer.appendChild(errorMsg);
    return; // Stop initialization
  }

  // --- Initialize Game Engine ---
  console.log("Instantiating GameEngine...");
  // Define the game over handler function before creating the engine
  const handleGameOver = (finalScore) => {
    console.log(`UI: Received game over signal with score: ${finalScore}`);
    if (finalScoreSpan) {
      finalScoreSpan.textContent = finalScore; // Update score display
    }
    // Attempt to submit score if user is logged in
    submitScore(finalScore);
    // Switch to summary screen
    showScreen("summary"); 
  };

  // Pass the handleGameOver callback to the engine
  const engine = new GameEngine("game-canvas", handleGameOver);

  if (engine && engine.ctx) {
    // Check if engine initialized correctly (found canvas)
    console.log("GameEngine started.");
    engine.start();
  } else {
    console.error(
      "Failed to initialize GameEngine properly. Check console for details."
    );
    // Potentially display another error message in the UI
    return;
  }

  // --- Screen Management Logic ---
  let currentScreen = "start"; // Initial screen

  function showScreen(screenId) {
    console.log(`UI: Switching to screen: ${screenId}`);
    // Hide all screens
    Object.values(screens).forEach((screen) => {
      if (screen) screen.classList.remove("active");
    });

    // Show the target screen
    const targetScreen = screens[screenId];
    if (targetScreen) {
      targetScreen.classList.add("active");
      currentScreen = screenId;
    } else {
      console.error(`UI Error: Screen with ID '${screenId}' not found.`);
      // Fallback to start screen if target is invalid
      screens.start?.classList.add("active");
      currentScreen = "start";
    }

    // If navigating to leaderboard, fetch data
    if (screenId === "leaderboard" && leaderboardScreen) {
        displayLeaderboard();
    }

    // Special handling for game screen: Reset and start engine
    if (screenId === "game") {
      if (engine) {
        if (currentScreen !== "game") { // Reset only if coming from another screen
          console.log("UI: Resetting GameEngine before starting.");
          engine.reset();
        }
        if (!engine.running) { // Start if not already running
          console.log("UI: Starting GameEngine as game screen is shown.");
          engine.start();
        }
      }
    } else if (screenId !== "game" && engine && engine.running) {
      console.log("UI: Stopping GameEngine as game screen is hidden.");
      engine.stop(); // Stop engine if navigating away from game screen
    }
  }

  // --- Authentication Logic --- 
  const googleProvider = new firebase.auth.GoogleAuthProvider();

  loginBtn?.addEventListener('click', () => {
      auth.signInWithPopup(googleProvider)
          .then((result) => {
              console.log("Login successful:", result.user);
              // Auth state change will handle UI update
          })
          .catch((error) => {
              console.error("Login failed:", error);
              alert(`Login failed: ${error.message}`);
          });
  });

  logoutBtn?.addEventListener('click', () => {
      auth.signOut()
          .then(() => {
              console.log("Logout successful.");
               // Auth state change will handle UI update
          })
          .catch((error) => {
              console.error("Logout failed:", error);
          });
  });

  auth.onAuthStateChanged((user) => {
      currentUser = user; // Update current user state
      if (user) {
          // User is signed in
          console.log("User signed in:", user.displayName);
          if (userInfoDiv) userInfoDiv.style.display = 'block';
          if (userNameSpan) userNameSpan.textContent = `Hi, ${user.displayName}!`;
          if (loginBtn) loginBtn.style.display = 'none';
      } else {
          // User is signed out
          console.log("User signed out.");
          if (userInfoDiv) userInfoDiv.style.display = 'none';
          if (userNameSpan) userNameSpan.textContent = '';
          if (loginBtn) loginBtn.style.display = 'block';
      }
  });

  // --- Leaderboard Logic --- 
  async function submitScore(score) {
      if (!currentUser) {
          console.log("User not logged in, score not submitted.");
          // Optionally prompt user to log in to save score
          return;
      }
      if (!db) {
           console.error("Firestore not initialized, cannot submit score.");
           return;
      }

      console.log(`Submitting score ${score} for user ${currentUser.displayName}`);
      try {
          await db.collection("leaderboard").add({
              userId: currentUser.uid,
              userName: currentUser.displayName || "Anonymous",
              score: score,
              timestamp: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
          });
          console.log("Score submitted successfully!");
      } catch (error) {
          console.error("Error submitting score:", error);
      }
  }

  async function displayLeaderboard() {
      if (!db || !leaderboardList) return;

      leaderboardList.innerHTML = '<li>Loading...</li>'; // Clear previous entries

      try {
          const q = db.collection("leaderboard")
                      .orderBy("score", "desc")
                      .limit(10);
          const querySnapshot = await q.get();
          
          leaderboardList.innerHTML = ''; // Clear loading message
          if (querySnapshot.empty) {
              leaderboardList.innerHTML = '<li>No scores yet!</li>';
              return;
          }

          let rank = 1;
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              const li = document.createElement('li');
              li.textContent = `#${rank}: ${data.userName} - ${data.score}`;
              li.style.margin = "5px 0";
              li.style.borderBottom = "1px solid var(--grid-gray)";
              li.style.paddingBottom = "3px";
              leaderboardList.appendChild(li);
              rank++;
          });
      } catch (error) {
          console.error("Error fetching leaderboard:", error);
          leaderboardList.innerHTML = '<li>Error loading scores.</li>';
      }
  }

   // Add listener for leaderboard button
   leaderboardBtn?.addEventListener("click", () => showScreen("leaderboard"));

  // --- Event Listener for Prompt Submission ---
  submitButton.addEventListener("click", () => {
    const promptText = promptInput.value.trim(); // Get and trim the input

    if (promptText) {
      console.log(`UI: Submit button clicked. Prompt: "${promptText}"`);
      // Pass the prompt to the engine
      engine.handlePrompt(promptText);

      // Clear the input field after submission
      promptInput.value = "";
    } else {
      console.log("UI: Submit button clicked, but prompt input is empty.");
      // Optionally provide feedback to the user (e.g., shake the input box?)
    }
  });

  // Optional: Add listener for 'Enter' key in textarea (Shift+Enter for newline)
  promptInput.addEventListener("keydown", (event) => {
    // Check if Enter is pressed without the Shift key
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline insertion
      submitButton.click(); // Trigger the button click handler
    }
  });

  // --- Screen Navigation Event Listeners ---
  startGameBtn?.addEventListener("click", () => showScreen("game"));
  instructionsBtn?.addEventListener("click", () => showScreen("instructions"));
  educationBtn?.addEventListener("click", () => showScreen("educational"));

  backToStartBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Specifically handle 'Play Again' which comes from the summary screen
      const parentScreenId = btn.closest('.screen')?.id;
      if (parentScreenId === 'summary-screen') {
        // No need to explicitly call reset here, showScreen('game') will handle it.
         console.log("UI: Play Again clicked, preparing for new game...");
      }
       showScreen("start"); // All back buttons go to start screen
    });
  });

  // --- Initial Setup ---
  setLanguage(currentLang).then(() => { // Load initial language and apply translations
        showScreen("start"); // Show start screen after language is loaded
         console.log("UI initialization complete. Event listeners attached. Initial language set.");
    }); 
});

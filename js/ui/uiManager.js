/**
 * uiManager.js
 * Handles DOM manipulation, event listeners, and UI updates.
 */
export class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.elements = {
            // Screens
            startScreen: document.getElementById('start-screen'),
            gameScreen: document.getElementById('game-screen'),
            instructionsScreen: document.getElementById('instructions-screen'),
            educationalScreen: document.getElementById('educational-screen'),
            leaderboardScreen: document.getElementById('leaderboard-screen'),
            summaryScreen: document.getElementById('summary-screen'),
            // Auth Elements
            authContainer: document.getElementById('auth-container'),
            loginBtn: document.getElementById('login-btn'),
            anonLoginBtn: document.getElementById('anon-login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            userInfo: document.getElementById('user-info'),
            userName: document.getElementById('user-name'),
            // Game UI Elements (Assuming structure from previous examples)
            levelDisplay: document.getElementById('player-level'),
            energyDisplay: document.getElementById('player-energy'),
            challengeTitle: document.getElementById('challenge-title'),
            challengeDescription: document.getElementById('challenge-description'),
            challengeTask: document.getElementById('challenge-task'),
            promptInput: document.getElementById('prompt-input'),
            submitPromptBtn: document.getElementById('submit-prompt-btn'),
            feedbackBox: document.getElementById('feedback-box'),
            // Buttons
            startGameBtn: document.getElementById('start-game-btn'),
            instructionsBtn: document.getElementById('instructions-btn'),
            educationBtn: document.getElementById('education-btn'),
            leaderboardBtn: document.getElementById('leaderboard-btn'),
            backToStartBtns: document.querySelectorAll('.back-to-start-btn'),
            langBtns: document.querySelectorAll('.lang-btn'),
            // Leaderboard
            leaderboardList: document.getElementById('leaderboard-list'),
             // API Key Input
            apiKeyInput: document.getElementById('api-key-input'),
            setApiKeyBtn: document.getElementById('set-api-key-btn'),
            apiKeyStatus: document.getElementById('api-key-status'),
        };
        this.currentScreen = this.elements.startScreen; // Default to start screen
    }

    init() {
        this.setupEventListeners();
        this.showScreen('start-screen'); // Show start screen initially
        // Check initial auth state (optional)
    }

    showScreen(screenId) {
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element && element.classList && element.classList.contains('screen')) {
                element.classList.remove('active');
            }
        });

        // Show the target screen
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.classList.add('active');
            this.currentScreen = screenToShow;
        } else {
            console.error(`Screen with ID ${screenId} not found.`);
        }
    }

    setupEventListeners() {
        // --- Screen Navigation --- 
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => {
                // this.showScreen('game-screen'); // Or directly to challenge UI if preferred
                this.gameEngine.startGame(); // Let engine handle starting logic
            });
        }
        if (this.elements.instructionsBtn) {
            this.elements.instructionsBtn.addEventListener('click', () => this.showScreen('instructions-screen'));
        }
        if (this.elements.educationBtn) {
            this.elements.educationBtn.addEventListener('click', () => this.showScreen('educational-screen'));
        }
        if (this.elements.leaderboardBtn) {
            this.elements.leaderboardBtn.addEventListener('click', () => {
                this.showScreen('leaderboard-screen');
                this.gameEngine.leaderboard.displayLeaderboard(); // Fetch and display scores
            });
        }
        this.elements.backToStartBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('start-screen'));
        });

        // --- Game Actions --- 
        if (this.elements.submitPromptBtn) {
            this.elements.submitPromptBtn.addEventListener('click', () => {
                const userPrompt = this.elements.promptInput.value;
                this.gameEngine.handlePromptSubmission(userPrompt);
            });
        }
         // Allow Enter key submission in textarea
        if (this.elements.promptInput) {
             this.elements.promptInput.addEventListener('keypress', (event) => {
                 if (event.key === 'Enter' && !event.shiftKey) { // Submit on Enter, allow Shift+Enter for newline
                     event.preventDefault(); // Prevent default Enter behavior (newline)
                     this.elements.submitPromptBtn.click(); // Trigger the button click
                 }
             });
         }

        // --- Authentication --- 
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => this.gameEngine.auth.signInWithGoogle());
        }
        if (this.elements.anonLoginBtn) {
            this.elements.anonLoginBtn.addEventListener('click', () => this.gameEngine.auth.signInAnonymously());
        }
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.gameEngine.auth.signOutUser());
        }

        // --- Language Selection --- 
        this.elements.langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.gameEngine.translator.changeLanguage(lang);
                console.log(`Language changed to: ${lang}`);
            });
        });
        
        // --- API Key Setting --- 
        if (this.elements.setApiKeyBtn && this.elements.apiKeyInput && this.elements.apiKeyStatus) {
             this.elements.setApiKeyBtn.addEventListener('click', () => {
                 const apiKey = this.elements.apiKeyInput.value.trim();
                 if (apiKey && apiKey.startsWith('sk-')) { // Basic check
                     this.gameEngine.setApiKey(apiKey);
                     this.elements.apiKeyStatus.textContent = 'Key Set!';
                     this.elements.apiKeyInput.value = ''; // Clear field after setting
                     this.elements.apiKeyStatus.style.color = 'var(--accent-green)';
                     // Optionally disable after setting
                     // this.elements.apiKeyInput.disabled = true;
                     // this.elements.setApiKeyBtn.disabled = true;
                      setTimeout(() => { this.elements.apiKeyStatus.textContent = ''; }, 3000); // Clear status after 3s
                 } else {
                     this.elements.apiKeyStatus.textContent = 'Invalid Key';
                     this.elements.apiKeyStatus.style.color = 'var(--accent-red)';
                     setTimeout(() => { this.elements.apiKeyStatus.textContent = ''; }, 3000); // Clear status after 3s
                 }
             });
         }
    }

    // --- Update UI Methods --- 

    updateStats(level, energy) {
        if (this.elements.levelDisplay) this.elements.levelDisplay.textContent = level;
        if (this.elements.energyDisplay) this.elements.energyDisplay.textContent = energy;
    }

    updateChallengeUI(title, description, task, placeholder) {
        if (this.elements.challengeTitle) this.elements.challengeTitle.textContent = title;
        if (this.elements.challengeDescription) this.elements.challengeDescription.innerHTML = description; // Use innerHTML if text includes <br>
        if (this.elements.challengeTask) this.elements.challengeTask.innerHTML = `<strong>Your Task:</strong> ${task}`; // Use innerHTML
        if (this.elements.promptInput) {
             this.elements.promptInput.value = ''; // Clear input on new challenge
             this.elements.promptInput.placeholder = placeholder || 'Enter your prompt...';
        }
         if (this.elements.feedbackBox) {
            this.elements.feedbackBox.textContent = 'Awaiting your prompt...';
            this.elements.feedbackBox.className = 'feedback-box'; // Reset feedback style
         }
    }
    
    updateFeedback(message, isSuccess) {
        if (!this.elements.feedbackBox) return;
        this.elements.feedbackBox.textContent = message;
        if (isSuccess === true) {
            this.elements.feedbackBox.className = 'feedback-box success';
        } else if (isSuccess === false) {
            this.elements.feedbackBox.className = 'feedback-box error';
        } else {
            this.elements.feedbackBox.className = 'feedback-box'; // Neutral
        }
    }

    showGameOver(finalScore) {
        const finalScoreElement = document.getElementById('final-score');
        if (finalScoreElement) {
            finalScoreElement.textContent = finalScore;
        }
        this.showScreen('game-over-screen');
         // TODO: Add event listener for restart button if not already handled
    }

    showLoading(isLoading) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = isLoading ? 'flex' : 'none';
        }
    }

     updateAuthState(user) {
        if (user) {
            // User is signed in
            if (this.elements.userInfo) this.elements.userInfo.style.display = 'block';
            if (this.elements.userName) this.elements.userName.textContent = user.displayName || (user.isAnonymous ? 'Guest' : 'User');
            if (this.elements.loginBtn) this.elements.loginBtn.style.display = 'none';
            if (this.elements.anonLoginBtn) this.elements.anonLoginBtn.style.display = 'none';
            if (this.elements.logoutBtn) this.elements.logoutBtn.style.display = 'inline-block';
        } else {
            // User is signed out
            if (this.elements.userInfo) this.elements.userInfo.style.display = 'none';
            if (this.elements.userName) this.elements.userName.textContent = '';
            if (this.elements.loginBtn) this.elements.loginBtn.style.display = 'inline-block';
            if (this.elements.anonLoginBtn) this.elements.anonLoginBtn.style.display = 'inline-block';
            if (this.elements.logoutBtn) this.elements.logoutBtn.style.display = 'none';
        }
    }
    
     updateLeaderboard(scores) {
        if (!this.elements.leaderboardList) return;
        this.elements.leaderboardList.innerHTML = ''; // Clear existing list
        if (scores.length === 0) {
            this.elements.leaderboardList.innerHTML = '<li>No scores yet. Be the first!</li>';
            return;
        }
        scores.forEach((scoreEntry, index) => {
            const li = document.createElement('li');
            const rank = index + 1;
            const name = scoreEntry.userName || 'Anonymous'; // Use userName field
            const score = scoreEntry.score;
            li.textContent = `#${rank}: ${name} - ${score} Energy`;
            this.elements.leaderboardList.appendChild(li);
        });
    }
    
    translateUI() {
        // Use translator instance from gameEngine
        const t = this.gameEngine.translator.t.bind(this.gameEngine.translator);
        
        // Translate static text elements
        // Example: Document title might need updating if dynamic
        // document.title = t('gameTitle'); 

        // Translate button texts, labels, placeholders etc.
        // Start Screen
        if(this.elements.startScreen) this.elements.startScreen.querySelector('h2').textContent = t('welcome');
        if(this.elements.startGameBtn) this.elements.startGameBtn.textContent = t('startGame');
        if(this.elements.instructionsBtn) this.elements.instructionsBtn.textContent = t('instructions');
        if(this.elements.educationBtn) this.elements.educationBtn.textContent = t('learnMore');
        if(this.elements.leaderboardBtn) this.elements.leaderboardBtn.textContent = t('leaderboard');

        // Instructions Screen
        if(this.elements.instructionsScreen) {
             this.elements.instructionsScreen.querySelector('h2').textContent = t('howToPlayTitle');
             const instructionsParas = this.elements.instructionsScreen.querySelectorAll('p');
             if(instructionsParas.length >= 3) {
                 instructionsParas[0].textContent = t('howToPlayWelcome');
                 instructionsParas[1].textContent = t('howToPlayMission');
                 instructionsParas[2].textContent = t('howToPlayAction');
             }
        }

        // Educational Screen
        if(this.elements.educationalScreen) {
            this.elements.educationalScreen.querySelector('h2').textContent = t('learnTitle');
             const learnParas = this.elements.educationalScreen.querySelectorAll('p');
             if(learnParas.length >= 8) { // Adjust index based on actual paragraphs
                 learnParas[0].innerHTML = `<strong>${t('whatIsPromptTitle')}</strong> ${t('whatIsPromptText')}`;
                 learnParas[1].innerHTML = `<strong>${t('whatIsPETitle')}</strong> ${t('whatIsPEText')}`;
                 learnParas[2].textContent = t('llmPredictionEngine');
                 learnParas[3].innerHTML = `<strong>${t('fewShotTitle')}</strong> ${t('fewShotText')}`;
                 learnParas[4].innerHTML = `<strong>${t('rolePromptingTitle')}</strong> ${t('rolePromptingText')}`;
                 learnParas[5].innerHTML = `<strong>${t('systemPromptingTitle')}</strong> ${t('systemPromptingText')}`;
                 learnParas[6].innerHTML = `<strong>${t('contextualPromptingTitle')}</strong> ${t('contextualPromptingText')}`;
                 learnParas[7].innerHTML = `<strong>${t('cotTitle')}</strong> ${t('cotText')}`;
             }
        }
        
        // Leaderboard Screen
        if(this.elements.leaderboardScreen) this.elements.leaderboardScreen.querySelector('h2').textContent = t('leaderboardTitle');

        // Back Buttons
        this.elements.backToStartBtns.forEach(btn => btn.textContent = t('back'));

        // Auth Buttons
        if(this.elements.loginBtn) this.elements.loginBtn.textContent = t('loginGoogle');
        if(this.elements.anonLoginBtn) this.elements.anonLoginBtn.textContent = t('playGuest');
        if(this.elements.logoutBtn) this.elements.logoutBtn.textContent = t('logout');

        // Challenge UI (Placeholders might need translation if static)
        // if(this.elements.promptInput) this.elements.promptInput.placeholder = t('promptPlaceholder');
        // if(this.elements.feedbackBox) this.elements.feedbackBox.textContent = t('feedbackAwaiting');
        if(this.elements.submitPromptBtn) this.elements.submitPromptBtn.textContent = t('submitPrompt');

        // Game Stats
        const levelSpan = this.elements.levelDisplay?.parentElement;
        if (levelSpan) levelSpan.firstChild.textContent = `${t('level')}: `;
        const energySpan = this.elements.energyDisplay?.parentElement;
        if (energySpan) energySpan.firstChild.textContent = `${t('energy')}: `;
        
        // API Key Area
         const apiKeyLabel = this.elements.apiKeyInput?.previousElementSibling;
         if (apiKeyLabel) apiKeyLabel.textContent = `${t('openaiKey')}:`;
         if (this.elements.setApiKeyBtn) this.elements.setApiKeyBtn.textContent = t('setApiKey');

        console.log("UI Translated to", this.gameEngine.translator.currentLanguage);
    }

    // Add other UI update methods as needed (e.g., updateTimer, showScoreUpdate, etc.)
} 
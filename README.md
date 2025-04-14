# Mistrz Promptów - Prompt Engineering Learning Application

![Mistrz Promptów Logo](https://via.placeholder.com/150x150.png?text=MP)

A Polish interactive learning application for teaching prompt engineering techniques, focusing on energy-related topics.

## Overview

Mistrz Promptów ("Prompt Master" in English) is an educational application designed to teach users the art of prompt engineering through interactive lessons, practical exercises, and real-time feedback. The application focuses on energy-related topics, making it particularly relevant for users interested in the energy sector.

The application features:

- Interactive lessons on various prompt engineering techniques
- Practical exercises with real-time feedback
- Scoring system and leaderboard
- User progress tracking
- Offline capabilities
- Responsive design for various devices

## Architecture

The application follows a modular architecture with four core modules:

1. **UI Module**: Handles presentation and user interaction
2. **Learning Module**: Manages educational content and learning progression
3. **Assessment Module**: Evaluates user responses and provides feedback
4. **User Module**: Manages user accounts, authentication, and personalization

The application is built as a client-side application deployed on GitHub Pages, with Firebase providing backend services (Authentication, Firestore, Functions).

For detailed architecture information, see:

- [Architecture Document](architecture.md)
- [Component Structure](component-structure.md)
- [Data Flow Diagram](data-flow.md)
- [Architecture Diagrams](architecture-diagram.md)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git
- Firebase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/mistrz-promptow.git
   cd mistrz-promptow
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration (see `.env.example` for reference):

   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=G-your-measurement-id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Deployment

The application is configured for automatic deployment to GitHub Pages using GitHub Actions. When changes are pushed to the main branch, the CI/CD pipeline automatically builds, tests, and deploys the application.

For manual deployment, you can use:

```bash
npm run deploy
```

For detailed deployment instructions, see the [Deployment Guide](docs/deployment-guide.md).

## Continuous Integration/Continuous Deployment

The repository includes a GitHub Actions workflow that:

1. Runs all tests on every pull request and push to main
2. Builds the application for production
3. Automatically deploys to GitHub Pages when changes are merged to main

This ensures code quality and provides a streamlined deployment process.

## Project Structure

```
mistrz-promptow/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # UI components
│   ├── modules/          # Core modules
│   │   ├── ui/           # UI module
│   │   ├── learning/     # Learning module
│   │   ├── assessment/   # Assessment module
│   │   └── user/         # User module
│   ├── services/         # Service layer
│   ├── utils/            # Utility functions
│   ├── firebase/         # Firebase configuration
│   ├── styles/           # CSS styles
│   ├── index.js          # Entry point
│   └── App.js            # Main application component
├── docs/                 # Documentation
├── .github/              # GitHub Actions workflows
├── .env                  # Environment variables (not in repo)
├── .gitignore            # Git ignore file
├── package.json          # npm package configuration
├── webpack.config.js     # Webpack configuration
└── README.md             # Project readme
```

## Core Features

### Learning Module

The Learning Module manages the educational content and learning progression:

- Lesson Manager: Loads and displays lesson content
- Content Renderer: Formats and displays educational content
- Progress Tracker: Tracks user progress through lessons
- Example System: Provides interactive examples of prompt techniques

### Assessment Module

The Assessment Module handles evaluation of user responses and provides feedback:

- Prompt Evaluator: Evaluates user-created prompts
- Scoring System: Calculates scores based on prompt quality
- Feedback Generator: Provides detailed feedback on user submissions
- Leaderboard Manager: Manages and displays user rankings

### User Module

The User Module manages user accounts, authentication, and personalization:

- Authentication Manager: Handles user login/registration
- Profile Manager: Manages user profiles and preferences
- Progress Synchronization: Syncs user progress across devices
- Settings Controller: Manages user application settings

### UI Module

The UI Module is responsible for the presentation layer and user interaction:

- Theme System: Responsive design with support for light/dark modes
- Navigation: Menu system for moving between different sections
- Accessibility Layer: Ensuring the application is accessible to all users
- Offline UI: Visual indicators and functionality for offline mode

## Security

The application implements comprehensive security measures:

- Firebase Authentication for user management
- Firestore Security Rules for data access control
- Client-side data validation
- Secure data storage for offline mode
- HTTPS for all communications

For detailed security information, see the [Security Plan](security-plan.md).

## Offline Capabilities

The application is designed to work offline:

- Service Worker for caching static assets
- IndexedDB for storing user data offline
- Background synchronization when connection is restored
- Offline UI indicators

## Testing

The application includes comprehensive testing:

- Unit tests for individual components and functions
- Integration tests for module interactions
- End-to-end tests for user flows
- Security tests for vulnerability detection

Run tests with:

```bash
npm test
```

## Development Roadmap

The development is organized into six phases:

1. **Foundation**: Project setup and core infrastructure
2. **Core Modules**: Implementation of the four core modules
3. **Firebase Integration**: Integration with Firebase services
4. **Offline Capabilities**: Implementation of offline functionality
5. **Security and Performance**: Security measures and performance optimization
6. **Testing and Deployment**: Final testing and production deployment

For the detailed roadmap, see the [Project Roadmap](project-roadmap.md).

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [User Guide](docs/user-guide.md)
- [Developer Documentation](docs/developer-documentation.md)
- [API Documentation](docs/api-documentation.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Security Documentation](docs/security-documentation.md)
- [Troubleshooting Guide](docs/troubleshooting-guide.md)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services
- [GitHub Pages](https://pages.github.com/) for hosting
- [GitHub Actions](https://github.com/features/actions) for CI/CD
- All contributors and supporters of the project

## Contact

For questions or feedback, please open an issue in the GitHub repository.

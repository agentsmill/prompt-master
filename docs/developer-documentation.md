# Developer Documentation for Mistrz Promptów

## Introduction

This document provides an overview of the architecture, code structure, and contribution guidelines for developers working on the Mistrz Promptów application.

## Architecture Overview

The application follows a modular architecture with four core modules:

1. **UI Module**: Handles presentation and user interaction.
2. **Learning Module**: Manages educational content and learning progression.
3. **Assessment Module**: Evaluates user responses and provides feedback.
4. **User Module**: Manages user accounts, authentication, and personalization.

The application is built as a client-side application deployed on GitHub Pages, with Firebase providing backend services (Authentication, Firestore, Functions).

## Code Structure

The project is organized as follows:

- **public/**: Contains static assets.
- **src/**: Contains the source code.
  - **components/**: UI components.
  - **modules/**: Core modules.
    - **ui/**: UI module.
    - **learning/**: Learning module.
    - **assessment/**: Assessment module.
    - **user/**: User module.
  - **services/**: Service layer.
  - **utils/**: Utility functions.
  - **firebase/**: Firebase configuration.
  - **styles/**: CSS styles.
  - **index.js**: Entry point.
  - **App.js**: Main application component.

## Contribution Guidelines

1. **Fork the Repository**: Create a personal fork of the repository.
2. **Create a Feature Branch**: Use `git checkout -b feature/your-feature-name` to create a new branch.
3. **Commit Changes**: Use `git commit -m 'Add some feature'` to commit your changes.
4. **Push to Branch**: Use `git push origin feature/your-feature-name` to push your changes.
5. **Open a Pull Request**: Submit a pull request for review.

## Development Setup

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

3. Create a `.env` file in the root directory with your Firebase configuration.

4. Start the development server:
   ```bash
   npm start
   ```

## Testing

- **Unit Tests**: Run `npm test` to execute unit tests.
- **E2E Tests**: Use Cypress for end-to-end testing.

## Contact

For questions or feedback, please contact [your-email@example.com](mailto:your-email@example.com).

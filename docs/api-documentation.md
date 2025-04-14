# API Documentation for Firebase Integration

## Introduction

This document provides detailed information on the Firebase integration within the Mistrz Promptów application, including setup instructions and usage examples.

## Firebase Services Used

1. **Authentication**: Manages user sign-in and sign-up processes.
2. **Firestore**: Stores and retrieves user data and application content.
3. **Functions**: Executes backend logic in response to events.

## Setup Instructions

### Firebase Project Setup

1. **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Enable Authentication**: Navigate to the Authentication section and enable Email/Password sign-in.
3. **Create Firestore Database**: Set up a Firestore database in test mode for initial development.
4. **Deploy Firestore Security Rules**: Use the following command to deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Firebase Configuration

Create a `.env` file in the root directory with the following configuration:

```
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=G-your-measurement-id
```

## Usage Examples

### Authentication

- **Sign Up**: Use Firebase Authentication to create a new user account.
- **Sign In**: Authenticate users with email and password.

### Firestore

- **Data Storage**: Store user progress and lesson content in Firestore collections.
- **Data Retrieval**: Fetch user-specific data and application content as needed.

### Functions

- **Event Handling**: Use Firebase Functions to handle events such as user registration or data updates.

## Best Practices

- **Security Rules**: Regularly update and review Firestore security rules to protect user data.
- **Environment Variables**: Keep Firebase configuration in environment variables to secure sensitive information.

## Contact

For questions or feedback, please contact [your-email@example.com](mailto:your-email@example.com).

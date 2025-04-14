# Mistrz Promptów - Architecture Document

## Overview

This document outlines the architecture for "Mistrz Promptów" - a Polish prompt engineering learning application. The application is designed to teach users prompt engineering techniques through interactive lessons, focusing on energy-related topics.

## System Architecture

The application follows a modular architecture with clear separation of concerns, optimized for GitHub Pages deployment while leveraging Firebase for backend functionality.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │ UI Module   │  │ Learning    │  │ Assessment  │  │ User    │  │
│  │             │  │ Module      │  │ Module      │  │ Module  │  │
│  └─────┬───────┘  └──────┬──────┘  └──────┬──────┘  └────┬────┘  │
│        │                 │                │               │       │
│        └─────────────────┼────────────────┼───────────────┘       │
│                          │                │                       │
└──────────────────────────┼────────────────┼───────────────────────┘
                           │                │
                           ▼                ▼
          ┌────────────────────────────────────────────┐
          │              Firebase Services             │
          │  ┌─────────────┐  ┌─────────────────────┐  │
          │  │ Firestore   │  │ Firebase Auth       │  │
          │  │ Database    │  │                     │  │
          │  └─────────────┘  └─────────────────────┘  │
          │  ┌─────────────┐  ┌─────────────────────┐  │
          │  │ Firebase    │  │ Firebase Hosting    │  │
          │  │ Functions   │  │ (GitHub Pages)      │  │
          │  └─────────────┘  └─────────────────────┘  │
          └────────────────────────────────────────────┘
```

## Core Modules

### 1. UI Module

Responsible for the presentation layer and user interaction.

**Components:**

- **Theme System**: Responsive design with support for light/dark modes and various device sizes
- **Navigation**: Menu system for moving between different sections
- **Accessibility Layer**: Ensuring the application is accessible to all users
- **Offline UI**: Visual indicators and functionality for offline mode

**Technical Implementation:**

- HTML5, CSS3 with responsive design principles
- CSS variables for theming
- Flexbox/Grid for layout
- Media queries for device adaptation

### 2. Learning Module

Manages the educational content and learning progression.

**Components:**

- **Lesson Manager**: Loads and displays lesson content
- **Content Renderer**: Formats and displays educational content
- **Progress Tracker**: Tracks user progress through lessons
- **Example System**: Provides interactive examples of prompt techniques

**Technical Implementation:**

- Modular JavaScript for lesson loading
- Content stored in Firestore with local caching
- Offline-first approach with IndexedDB backup
- Lazy loading of lesson content

### 3. Assessment Module

Handles evaluation of user responses and provides feedback.

**Components:**

- **Prompt Evaluator**: Evaluates user-created prompts
- **Scoring System**: Calculates scores based on prompt quality
- **Feedback Generator**: Provides detailed feedback on user submissions
- **Leaderboard Manager**: Manages and displays user rankings

**Technical Implementation:**

- Client-side evaluation logic with predefined criteria
- Firestore integration for storing results
- Batch processing for offline submissions
- Conflict resolution for synchronization

### 4. User Module

Manages user accounts, authentication, and personalization.

**Components:**

- **Authentication Manager**: Handles user login/registration
- **Profile Manager**: Manages user profiles and preferences
- **Progress Synchronization**: Syncs user progress across devices
- **Settings Controller**: Manages user application settings

**Technical Implementation:**

- Firebase Authentication with email/password and social login options
- Secure user data storage in Firestore
- Local storage for offline user data
- JWT token management

## Data Architecture

### Database Schema

**Firestore Collections:**

1. **users**

   ```
   {
     uid: string,
     displayName: string,
     email: string,
     createdAt: timestamp,
     lastLogin: timestamp,
     preferences: {
       theme: string,
       language: string,
       notifications: boolean
     }
   }
   ```

2. **user_progress**

   ```
   {
     userId: string,
     lessonId: string,
     completed: boolean,
     score: number,
     attempts: number,
     lastAttemptAt: timestamp,
     responses: [
       {
         promptId: string,
         userResponse: string,
         score: number,
         feedback: array
       }
     ]
   }
   ```

3. **leaderboard**

   ```
   {
     userId: string,
     displayName: string,
     totalScore: number,
     completedLessons: number,
     lastUpdated: timestamp
   }
   ```

4. **lesson_content**
   ```
   {
     lessonId: string,
     title: string,
     technique: string,
     explanation: string,
     tasks: [
       {
         taskId: string,
         type: string,
         content: string,
         options: array,
         evaluationCriteria: object
       }
     ],
     order: number,
     difficulty: string
   }
   ```

### Local Storage

For offline functionality, the application will use:

- **IndexedDB**: For storing lesson content, user progress, and pending submissions
- **LocalStorage**: For user preferences and session information
- **Cache API**: For caching static assets and content

## Integration Architecture

### Firebase Integration

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase SDK Layer                       │
└───────┬─────────────────┬──────────────────┬────────────────┘
        │                 │                  │
        ▼                 ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌────────────────┐
│ Authentication│ │ Firestore     │ │ Functions      │
└───────────────┘ └───────────────┘ └────────────────┘
```

**Implementation Details:**

- Firebase SDK initialization in a dedicated module
- Service layer for abstracting Firebase operations
- Retry mechanisms for failed operations
- Batch processing for synchronization
- Security rules enforcement on client-side

## Security Architecture

### Authentication & Authorization

- **User Authentication**: Firebase Authentication with email/password and optional social logins
- **Role-Based Access**: Admin roles for content management
- **Token Management**: Secure handling of authentication tokens

### Data Security

- **Firestore Rules**: Granular access control based on user roles and ownership
- **Input Validation**: Client and server-side validation of all user inputs
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Rate Limiting**: Protection against abuse through Firebase Functions

### Firestore Security Rules

```
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only accessible by the user
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // User progress - only accessible by the user
    match /user_progress/{progressId} {
      allow read, write: if request.auth != null &&
                          request.auth.uid == resource.data.userId;
    }

    // Leaderboard - readable by all, writable by admin
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }

    // Lesson content - readable by all, writable by admin
    match /lesson_content/{lesson} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

## Offline Capabilities

### Offline Strategy

1. **Content Caching**:

   - Lesson content cached in IndexedDB
   - Static assets cached via Service Worker
   - Prefetching of likely-to-be-needed content

2. **Offline Operations**:

   - Complete lessons without internet connection
   - Store results locally
   - Queue submissions for synchronization

3. **Synchronization**:

   - Background sync when connection is restored
   - Conflict resolution for concurrent changes
   - Progress indicators for sync status

4. **Graceful Degradation**:
   - Fallback UI for unavailable features
   - Clear user messaging about offline status
   - Prioritization of core functionality

## Responsive Design

### Device Support Strategy

1. **Responsive Breakpoints**:

   - Mobile: 320px - 480px
   - Tablet: 481px - 768px
   - Desktop: 769px+

2. **Adaptive Components**:

   - Flexible layouts using CSS Grid/Flexbox
   - Component reorganization based on screen size
   - Touch-friendly UI elements for mobile

3. **Performance Optimization**:
   - Image optimization for different devices
   - Reduced animations on low-power devices
   - Lazy loading of non-critical content

## Deployment Architecture

### GitHub Pages Deployment

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Local          │     │  GitHub         │     │  GitHub Pages   │
│  Development    │────▶│  Repository     │────▶│  Hosting        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Firebase       │
                                               │  Services       │
                                               └─────────────────┘
```

**Implementation Requirements:**

- Static file deployment compatible with GitHub Pages
- Environment-based configuration for development/production
- Build process for optimizing assets
- CDN integration for improved performance

### CI/CD Pipeline

1. **Build Process**:

   - Linting and code quality checks
   - Bundling and minification
   - Asset optimization
   - Environment configuration injection

2. **Testing**:

   - Unit tests for core functionality
   - Integration tests for Firebase interaction
   - Accessibility testing
   - Cross-browser compatibility testing

3. **Deployment**:
   - Automated deployment to GitHub Pages
   - Firebase configuration deployment
   - Cache invalidation
   - Deployment verification

## Error Handling & Monitoring

### Error Management

1. **Client-Side Errors**:

   - Global error boundary
   - Graceful degradation
   - User-friendly error messages
   - Automatic retry for transient errors

2. **Server-Side Errors**:

   - Firebase Functions error handling
   - Structured error responses
   - Rate limiting and circuit breaking

3. **Monitoring**:
   - Error logging to Firebase Analytics
   - Performance monitoring
   - User behavior tracking
   - Alerting for critical issues

## Implementation Roadmap

### Phase 1: Foundation

- Setup project structure
- Implement core UI components
- Configure Firebase integration
- Establish authentication flow

### Phase 2: Core Functionality

- Implement Learning Module
- Develop Assessment Module
- Create basic User Module
- Setup offline capabilities

### Phase 3: Enhancement

- Implement Leaderboard
- Add advanced feedback mechanisms
- Optimize for performance
- Enhance responsive design

### Phase 4: Finalization

- Comprehensive testing
- Security audit
- Documentation
- Deployment to production

## Conclusion

This architecture provides a solid foundation for building the "Mistrz Promptów" application. It emphasizes modularity, security, offline capabilities, and responsive design while leveraging Firebase for backend functionality. The implementation should follow this architecture to ensure a scalable, maintainable, and user-friendly application.

# Mistrz Promptów - Architecture Diagrams

This document contains visual representations of the "Mistrz Promptów" application architecture using Mermaid diagrams.

## System Architecture Diagram

```mermaid
graph TD
    subgraph "Client Application"
        UI[UI Module]
        Learning[Learning Module]
        Assessment[Assessment Module]
        User[User Module]

        UI --- Learning
        UI --- Assessment
        UI --- User
        Learning --- Assessment
    end

    subgraph "Client-Side Storage"
        IndexedDB[(IndexedDB)]
        LocalStorage[(LocalStorage)]
        CacheAPI[(Cache API)]

        User --- IndexedDB
        Learning --- IndexedDB
        Assessment --- IndexedDB
        User --- LocalStorage
    end

    subgraph "Firebase Services"
        Auth[Firebase Auth]
        Firestore[(Firestore Database)]
        Functions[Firebase Functions]
        Hosting[Firebase Hosting/GitHub Pages]

        User --- Auth
        Learning --- Firestore
        Assessment --- Firestore
        User --- Firestore
        Firestore --- Functions
    end

    ServiceWorker[Service Worker]

    UI --- ServiceWorker
    ServiceWorker --- CacheAPI
    ServiceWorker --- IndexedDB
    ServiceWorker --- Firestore
```

## Module Structure Diagram

```mermaid
graph TD
    subgraph "UI Module"
        Layout[Layout Components]
        Common[Common Components]
        Theme[Theme System]
        Responsive[Responsive Components]

        Layout --- Common
        Layout --- Theme
        Layout --- Responsive
    end

    subgraph "Learning Module"
        LessonManager[Lesson Manager]
        ContentComponents[Content Components]
        ProgressTracker[Progress Tracker]
        OfflineContent[Offline Content]

        LessonManager --- ContentComponents
        LessonManager --- ProgressTracker
        LessonManager --- OfflineContent
    end

    subgraph "Assessment Module"
        PromptEvaluator[Prompt Evaluator]
        InputComponents[Input Components]
        FeedbackComponents[Feedback Components]
        LeaderboardComponents[Leaderboard Components]

        PromptEvaluator --- InputComponents
        PromptEvaluator --- FeedbackComponents
        PromptEvaluator --- LeaderboardComponents
    end

    subgraph "User Module"
        AuthManager[Auth Manager]
        ProfileManager[Profile Manager]
        SyncManager[Sync Manager]
        SettingsManager[Settings Manager]

        AuthManager --- ProfileManager
        AuthManager --- SyncManager
        AuthManager --- SettingsManager
    end

    UI[UI Module] --- Learning[Learning Module]
    UI --- Assessment[Assessment Module]
    UI --- User[User Module]
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant BL as Business Logic
    participant Cache as Client Cache
    participant SW as Service Worker
    participant FB as Firebase Services

    User->>UI: Interact with application
    UI->>BL: Process interaction

    alt Online Mode
        BL->>FB: Request data
        FB->>BL: Return data
        BL->>Cache: Store data
        BL->>UI: Update UI
    else Offline Mode
        BL->>Cache: Request cached data
        Cache->>BL: Return cached data
        BL->>UI: Update UI
        BL->>SW: Queue sync operation
    end

    Note over SW,FB: When online connection is restored
    SW->>FB: Sync pending operations
    FB->>SW: Confirm sync
    SW->>Cache: Update cache
    SW->>UI: Update UI (if active)
```

## Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as Auth UI
    participant AuthManager
    participant FB as Firebase Auth
    participant Firestore

    User->>UI: Enter credentials
    UI->>AuthManager: Submit login
    AuthManager->>FB: Authenticate
    FB->>AuthManager: Return auth result

    alt Authentication Success
        AuthManager->>Firestore: Update last login
        AuthManager->>UI: Show success
        UI->>User: Redirect to app
    else Authentication Failure
        FB->>AuthManager: Return error
        AuthManager->>UI: Show error
        UI->>User: Request retry
    end
```

## Offline Capabilities Diagram

```mermaid
graph TD
    subgraph "Online State"
        OnlineData[Data Operations]
        OnlineAuth[Authentication]
        OnlineSync[Real-time Sync]

        OnlineData --> OnlineSync
        OnlineAuth --> OnlineSync
    end

    subgraph "Offline State"
        OfflineData[Cached Data]
        OfflineAuth[Cached Auth State]
        OfflineQueue[Pending Operations Queue]

        OfflineData --> OfflineQueue
    end

    subgraph "Transition"
        NetworkDetector[Network Detector]
        SyncManager[Sync Manager]
        ConflictResolver[Conflict Resolver]

        NetworkDetector --> SyncManager
        SyncManager --> ConflictResolver
    end

    OnlineState[Online State] --> NetworkDetector
    NetworkDetector --> OfflineState[Offline State]
    OfflineState --> NetworkDetector
    OfflineQueue --> SyncManager
    SyncManager --> OnlineSync
```

## Security Implementation Diagram

```mermaid
graph TD
    subgraph "Client-Side Security"
        InputValidation[Input Validation]
        TokenManagement[Token Management]
        SecureStorage[Secure Storage]
        EncryptionService[Encryption Service]

        InputValidation --> TokenManagement
        TokenManagement --> SecureStorage
        SecureStorage --> EncryptionService
    end

    subgraph "Firebase Security"
        AuthRules[Authentication Rules]
        FirestoreRules[Firestore Security Rules]
        FunctionsSecurity[Functions Security]

        AuthRules --> FirestoreRules
        FirestoreRules --> FunctionsSecurity
    end

    subgraph "Data Protection"
        TransitEncryption[HTTPS/SSL]
        RestEncryption[Data at Rest Encryption]
        AccessControl[Access Control]

        TransitEncryption --> RestEncryption
        RestEncryption --> AccessControl
    end

    Client[Client Application] --> InputValidation
    Client --> TransitEncryption
    TokenManagement --> AuthRules
    AccessControl --> FirestoreRules
```

## Deployment Architecture Diagram

```mermaid
graph TD
    subgraph "Development Environment"
        LocalDev[Local Development]
        Testing[Testing]
        BuildProcess[Build Process]

        LocalDev --> Testing
        Testing --> BuildProcess
    end

    subgraph "CI/CD Pipeline"
        GitHubRepo[GitHub Repository]
        GitHubActions[GitHub Actions]
        BuildArtifacts[Build Artifacts]

        GitHubRepo --> GitHubActions
        GitHubActions --> BuildArtifacts
    end

    subgraph "Production Environment"
        GitHubPages[GitHub Pages]
        FirebaseServices[Firebase Services]
        CDN[Content Delivery]

        GitHubPages --> CDN
        FirebaseServices --> CDN
    end

    BuildProcess --> GitHubRepo
    BuildArtifacts --> GitHubPages
    BuildArtifacts --> FirebaseServices
    CDN --> Users[End Users]
```

## Component Interaction Diagram

```mermaid
graph TD
    subgraph "Core Components"
        AppInitializer[App Initializer]
        Router[Router]
        EventBus[Event Bus]
        ErrorBoundary[Error Boundary]

        AppInitializer --> Router
        AppInitializer --> EventBus
        AppInitializer --> ErrorBoundary
    end

    subgraph "UI Components"
        Header[Header]
        Footer[Footer]
        Navigation[Navigation]
        ContentArea[Content Area]

        Header --> Navigation
        Navigation --> ContentArea
        ContentArea --> Footer
    end

    subgraph "Learning Components"
        LessonDisplay[Lesson Display]
        ExplanationDisplay[Explanation Display]
        TaskDisplay[Task Display]
        ProgressDisplay[Progress Display]

        LessonDisplay --> ExplanationDisplay
        LessonDisplay --> TaskDisplay
        LessonDisplay --> ProgressDisplay
    end

    subgraph "Assessment Components"
        PromptInput[Prompt Input]
        MultipleChoice[Multiple Choice]
        FeedbackDisplay[Feedback Display]
        ScoreDisplay[Score Display]

        PromptInput --> FeedbackDisplay
        MultipleChoice --> FeedbackDisplay
        FeedbackDisplay --> ScoreDisplay
    end

    Router --> Header
    Router --> ContentArea
    ContentArea --> LessonDisplay
    ContentArea --> PromptInput
    ContentArea --> MultipleChoice
    EventBus --> ProgressDisplay
    EventBus --> ScoreDisplay
    ErrorBoundary --> ContentArea
```

These diagrams provide a visual representation of the "Mistrz Promptów" application architecture, showing the relationships between components, data flow, and system interactions.

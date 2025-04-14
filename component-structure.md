# Mistrz Promptów - Component Structure

This document outlines the detailed component structure for the "Mistrz Promptów" application, showing the relationships and interactions between components within each module.

## Component Hierarchy

```
App
├── Core
│   ├── AppInitializer
│   ├── ConfigManager
│   ├── ErrorBoundary
│   ├── EventBus
│   ├── Router
│   └── ServiceWorkerManager
│
├── UI Module
│   ├── Layout
│   │   ├── Header
│   │   ├── Footer
│   │   ├── Navigation
│   │   └── ContentArea
│   │
│   ├── Common
│   │   ├── Button
│   │   ├── Modal
│   │   ├── Notification
│   │   ├── ProgressBar
│   │   ├── Loader
│   │   └── ErrorDisplay
│   │
│   ├── Theme
│   │   ├── ThemeProvider
│   │   ├── ThemeToggle
│   │   └── StyleVariables
│   │
│   └── Responsive
│       ├── DeviceDetector
│       ├── BreakpointManager
│       └── AdaptiveContainer
│
├── Learning Module
│   ├── LessonManager
│   │   ├── LessonLoader
│   │   ├── LessonNavigator
│   │   └── LessonRenderer
│   │
│   ├── ContentComponents
│   │   ├── ExplanationDisplay
│   │   ├── ExampleDisplay
│   │   ├── TaskDisplay
│   │   └── ResourceLinks
│   │
│   ├── ProgressTracker
│   │   ├── ProgressCalculator
│   │   ├── ProgressDisplay
│   │   └── ProgressSynchronizer
│   │
│   └── OfflineContent
│       ├── ContentCacheManager
│       ├── OfflineIndicator
│       └── SyncStatusDisplay
│
├── Assessment Module
│   ├── PromptEvaluator
│   │   ├── CriteriaChecker
│   │   ├── ScoreCalculator
│   │   └── FeedbackGenerator
│   │
│   ├── InputComponents
│   │   ├── PromptInputArea
│   │   ├── MultipleChoiceSelector
│   │   └── ProcessDescriptionInput
│   │
│   ├── FeedbackComponents
│   │   ├── FeedbackDisplay
│   │   ├── ScoreDisplay
│   │   └── ImprovementSuggestions
│   │
│   └── LeaderboardComponents
│       ├── LeaderboardDisplay
│       ├── RankingCalculator
│       └── UserComparisonView
│
└── User Module
    ├── AuthManager
    │   ├── LoginComponent
    │   ├── RegistrationComponent
    │   ├── PasswordRecovery
    │   └── SocialLoginIntegration
    │
    ├── ProfileManager
    │   ├── ProfileEditor
    │   ├── AchievementDisplay
    │   └── StatisticsView
    │
    ├── SyncManager
    │   ├── DataSynchronizer
    │   ├── ConflictResolver
    │   └── SyncStatusIndicator
    │
    └── SettingsManager
        ├── PreferencesEditor
        ├── NotificationSettings
        └── PrivacySettings
```

## Component Interactions

### Core Data Flow

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  User Module    │◄────►│  Core           │◄────►│  Firebase       │
│                 │      │                 │      │  Services       │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │                        ▲
         │                        │                        │
         ▼                        ▼                        │
┌─────────────────┐      ┌─────────────────┐              │
│                 │      │                 │              │
│  UI Module      │◄────►│  Learning       │──────────────┘
│                 │      │  Module         │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────┐
│                                         │
│            Assessment Module            │
│                                         │
└─────────────────────────────────────────┘
```

### Learning Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ LessonManager │────►│ContentRenderer│────►│ TaskDisplay   │
└───────┬───────┘     └───────────────┘     └───────┬───────┘
        │                                           │
        ▼                                           ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ProgressTracker│◄────┤PromptEvaluator│◄────┤InputComponents│
└───────┬───────┘     └───────┬───────┘     └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ UserProfile   │     │FeedbackDisplay│
└───────────────┘     └───────────────┘
```

### Authentication Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ LoginComponent│────►│ AuthManager   │────►│ Firebase Auth │
└───────────────┘     └───────┬───────┘     └───────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │ UserProfile   │
                      └───────┬───────┘
                              │
                              ▼
                      ┌───────────────┐
                      │ProgressTracker│
                      └───────────────┘
```

### Offline Synchronization Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│OfflineContent │────►│ SyncManager   │────►│ Firebase      │
└───────┬───────┘     └───────┬───────┘     └───────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ContentCache   │     │ConflictResolver│
└───────────────┘     └───────────────┘
```

## Component Responsibilities

### UI Module Components

#### Layout Components

- **Header**: Application branding, user status, main navigation
- **Footer**: Credits, links, version information
- **Navigation**: Menu system for navigating between sections
- **ContentArea**: Main content display area with adaptive layout

#### Common Components

- **Button**: Reusable button component with various styles
- **Modal**: Popup dialog for alerts, confirmations, and forms
- **Notification**: Toast-style notifications for user feedback
- **ProgressBar**: Visual indicator for progress and loading
- **Loader**: Loading animation for asynchronous operations
- **ErrorDisplay**: Standardized error message display

#### Theme Components

- **ThemeProvider**: Manages application theming
- **ThemeToggle**: UI for switching between light/dark modes
- **StyleVariables**: CSS variables for consistent styling

#### Responsive Components

- **DeviceDetector**: Detects device type and capabilities
- **BreakpointManager**: Manages responsive breakpoints
- **AdaptiveContainer**: Container that adapts to screen size

### Learning Module Components

#### LessonManager Components

- **LessonLoader**: Loads lesson content from Firestore or cache
- **LessonNavigator**: Controls navigation between lessons
- **LessonRenderer**: Renders lesson content with appropriate formatting

#### ContentComponents

- **ExplanationDisplay**: Displays technique explanations
- **ExampleDisplay**: Shows examples of prompt techniques
- **TaskDisplay**: Presents tasks for user completion
- **ResourceLinks**: Additional learning resources

#### ProgressTracker Components

- **ProgressCalculator**: Calculates user progress percentages
- **ProgressDisplay**: Visual representation of progress
- **ProgressSynchronizer**: Syncs progress with Firestore

#### OfflineContent Components

- **ContentCacheManager**: Manages cached lesson content
- **OfflineIndicator**: Indicates offline status
- **SyncStatusDisplay**: Shows synchronization status

### Assessment Module Components

#### PromptEvaluator Components

- **CriteriaChecker**: Checks user responses against criteria
- **ScoreCalculator**: Calculates scores based on criteria
- **FeedbackGenerator**: Generates feedback based on evaluation

#### InputComponents

- **PromptInputArea**: Text area for entering prompts
- **MultipleChoiceSelector**: Selection interface for multiple choice
- **ProcessDescriptionInput**: Interface for process description tasks

#### FeedbackComponents

- **FeedbackDisplay**: Displays feedback on user responses
- **ScoreDisplay**: Shows user scores
- **ImprovementSuggestions**: Provides suggestions for improvement

#### LeaderboardComponents

- **LeaderboardDisplay**: Displays user rankings
- **RankingCalculator**: Calculates user rankings
- **UserComparisonView**: Compares user performance with others

### User Module Components

#### AuthManager Components

- **LoginComponent**: User login interface
- **RegistrationComponent**: User registration interface
- **PasswordRecovery**: Password recovery functionality
- **SocialLoginIntegration**: Integration with social login providers

#### ProfileManager Components

- **ProfileEditor**: Interface for editing user profiles
- **AchievementDisplay**: Displays user achievements
- **StatisticsView**: Shows user statistics

#### SyncManager Components

- **DataSynchronizer**: Synchronizes data between client and server
- **ConflictResolver**: Resolves data conflicts
- **SyncStatusIndicator**: Indicates synchronization status

#### SettingsManager Components

- **PreferencesEditor**: Interface for editing user preferences
- **NotificationSettings**: Controls for notification settings
- **PrivacySettings**: Settings for user privacy

## State Management

### Global State

- User authentication status
- Current lesson and progress
- Application theme and preferences
- Network connectivity status

### Local Component State

- Form inputs and validation
- UI component visibility
- Temporary user interactions
- Component-specific loading states

### Persistent State

- User profile and progress (Firestore + IndexedDB)
- Lesson content cache (IndexedDB)
- User preferences (LocalStorage)
- Authentication tokens (SecureStorage)

## Event System

### Core Events

- Authentication events (login, logout, token refresh)
- Navigation events (route changes)
- Network events (online, offline)
- Error events (API errors, validation errors)

### Learning Events

- Lesson navigation (next, previous, jump to)
- Content loaded events
- Progress update events
- Task completion events

### Assessment Events

- Submission events
- Evaluation complete events
- Score update events
- Feedback display events

## Implementation Guidelines

1. **Component Development**:

   - Develop components from the bottom up
   - Create reusable base components first
   - Implement higher-level components using composition
   - Use consistent naming conventions

2. **State Management**:

   - Use a centralized state management approach
   - Implement proper state isolation
   - Ensure unidirectional data flow
   - Handle asynchronous state changes properly

3. **Event Handling**:

   - Implement a publish-subscribe pattern
   - Use event delegation where appropriate
   - Ensure proper event cleanup
   - Document event payloads

4. **Error Handling**:

   - Implement error boundaries
   - Use consistent error reporting
   - Provide user-friendly error messages
   - Log errors for debugging

5. **Performance Optimization**:
   - Lazy load non-critical components
   - Implement proper memoization
   - Optimize render cycles
   - Use efficient data structures

This component structure provides a detailed blueprint for implementing the "Mistrz Promptów" application. It ensures a modular, maintainable, and scalable codebase while facilitating collaboration among developers.

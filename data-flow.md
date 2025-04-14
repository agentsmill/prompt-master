# Mistrz Promptów - Data Flow Diagram

This document illustrates the data flow within the "Mistrz Promptów" application, focusing on how data moves between components, modules, and external services.

## System-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Application                             │
│                                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐              │
│  │             │      │             │      │             │              │
│  │  UI Layer   │◄────►│ Business    │◄────►│ Data Access │              │
│  │             │      │ Logic Layer │      │ Layer       │              │
│  └─────────────┘      └─────────────┘      └──────┬──────┘              │
│                                                   │                      │
└───────────────────────────────────────────────────┼──────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client-Side Storage                             │
│                                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐              │
│  │             │      │             │      │             │              │
│  │  IndexedDB  │      │ LocalStorage│      │ Cache API   │              │
│  │             │      │             │      │             │              │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘              │
│         │                    │                    │                      │
└─────────┼────────────────────┼────────────────────┼──────────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Firebase Services                              │
│                                                                         │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐              │
│  │             │      │             │      │             │              │
│  │  Firestore  │      │ Auth        │      │ Functions   │              │
│  │  Database   │      │             │      │             │              │
│  └─────────────┘      └─────────────┘      └─────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow Diagrams

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌────────────┐     ┌─────────────┐
│          │     │              │     │            │     │             │
│  User    │────►│ Auth UI      │────►│ Auth       │────►│ Firebase    │
│          │     │ Components   │     │ Manager    │     │ Auth        │
│          │     │              │     │            │     │             │
└──────────┘     └──────────────┘     └─────┬──────┘     └──────┬──────┘
                                            │                   │
                                            │                   │
                                            ▼                   │
                                     ┌────────────┐             │
                                     │            │             │
                                     │ Local      │◄────────────┘
                                     │ Storage    │
                                     │            │
                                     └─────┬──────┘
                                           │
                                           │
                                           ▼
                                     ┌────────────┐
                                     │            │
                                     │ App State  │
                                     │            │
                                     └────────────┘
```

### Learning Content Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│ Lesson     │────►│ Content    │────►│ Firestore  │────►│ Lesson     │
│ Manager    │     │ Service    │     │ Database   │     │ Collection │
│            │     │            │     │            │     │            │
└─────┬──────┘     └─────┬──────┘     └──────┬─────┘     └────────────┘
      │                  │                   │
      │                  │                   │
      │                  ▼                   │
      │           ┌────────────┐             │
      │           │            │             │
      │           │ IndexedDB  │◄────────────┘
      │           │ Cache      │
      │           │            │
      │           └─────┬──────┘
      │                 │
      ▼                 ▼
┌────────────┐    ┌────────────┐
│            │    │            │
│ UI         │◄───┤ Content    │
│ Components │    │ Renderer   │
│            │    │            │
└────────────┘    └────────────┘
```

### User Progress Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│ Assessment │────►│ Progress   │────►│ Sync       │────►│ Firestore  │
│ Module     │     │ Tracker    │     │ Manager    │     │ Database   │
│            │     │            │     │            │     │            │
└────────────┘     └─────┬──────┘     └──────┬─────┘     └──────┬─────┘
                         │                   │                  │
                         │                   │                  │
                         ▼                   │                  │
                  ┌────────────┐             │                  │
                  │            │             │                  │
                  │ IndexedDB  │◄────────────┘                  │
                  │ Storage    │                                │
                  │            │                                │
                  └─────┬──────┘                                │
                        │                                       │
                        │                                       │
                        ▼                                       ▼
                 ┌────────────┐                         ┌────────────┐
                 │            │                         │            │
                 │ Progress   │                         │ Leaderboard│
                 │ Display    │                         │ Service    │
                 │            │                         │            │
                 └────────────┘                         └────────────┘
```

### Offline Synchronization Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│ Network    │────►│ Sync       │────►│ Pending    │
│ Monitor    │     │ Manager    │     │ Queue      │
│            │     │            │     │            │
└────────────┘     └─────┬──────┘     └──────┬─────┘
                         │                   │
                         │                   │
                         ▼                   ▼
                  ┌────────────┐     ┌────────────┐
                  │            │     │            │
                  │ Online     │     │ Offline    │
                  │ Operations │     │ Operations │
                  │            │     │            │
                  └─────┬──────┘     └──────┬─────┘
                        │                   │
                        ▼                   ▼
                 ┌────────────┐     ┌────────────┐
                 │            │     │            │
                 │ Firebase   │     │ IndexedDB  │
                 │ Services   │     │ Storage    │
                 │            │     │            │
                 └────────────┘     └────────────┘
```

## Data Transformation Processes

### User Input to Evaluation

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│ User Input │────►│ Input      │────►│ Validation │────►│ Evaluation │
│            │     │ Processor  │     │ Engine     │     │ Engine     │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └─────┬──────┘
                                                               │
                                                               │
                                                               ▼
                                                        ┌────────────┐
                                                        │            │
                                                        │ Feedback   │
                                                        │ Generator  │
                                                        │            │
                                                        └─────┬──────┘
                                                              │
                                                              │
                                                              ▼
                                                       ┌────────────┐
                                                       │            │
                                                       │ Score      │
                                                       │ Calculator │
                                                       │            │
                                                       └─────┬──────┘
                                                             │
                                                             │
                                                             ▼
                                                      ┌────────────┐
                                                      │            │
                                                      │ Progress   │
                                                      │ Updater    │
                                                      │            │
                                                      └────────────┘
```

### Leaderboard Update Process

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│ User       │────►│ Score      │────►│ Ranking    │────►│ Leaderboard│
│ Progress   │     │ Aggregator │     │ Calculator │     │ Updater    │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └─────┬──────┘
                                                               │
                                                               │
                                                               ▼
                                                        ┌────────────┐
                                                        │            │
                                                        │ Firestore  │
                                                        │ Database   │
                                                        │            │
                                                        └────────────┘
```

## Data States

### User Data States

1. **Unauthenticated**: No user data available
2. **Authenticated, Unsynced**: User authenticated but data not yet synchronized
3. **Authenticated, Synced**: User authenticated with fully synchronized data
4. **Offline, Cached**: User data available from local cache
5. **Offline, Pending Sync**: User has made changes that need to be synchronized

### Lesson Content States

1. **Uncached**: Content not available locally
2. **Cached**: Content available in IndexedDB
3. **Loading**: Content being fetched from Firestore
4. **Rendered**: Content displayed to user
5. **Updated**: New version available but not yet cached

### Progress Data States

1. **Initial**: No progress recorded
2. **In Progress**: Lesson started but not completed
3. **Completed, Unsynced**: Lesson completed but not synchronized
4. **Completed, Synced**: Lesson completed and synchronized
5. **Conflict**: Local and remote progress data differ

## Offline Data Strategy

### Data Prioritization

1. **Critical Data** (Highest Priority)

   - User authentication state
   - Current lesson content
   - User progress for current lesson

2. **Important Data** (Medium Priority)

   - User profile information
   - Completed lesson progress
   - Feedback history

3. **Non-Critical Data** (Lowest Priority)
   - Leaderboard information
   - Historical statistics
   - Optional content resources

### Synchronization Strategy

1. **On Connection Restored**:

   - Synchronize critical data first
   - Queue important data for background sync
   - Schedule non-critical data for later sync

2. **Conflict Resolution**:

   - User progress: Merge strategy (higher scores win)
   - User profile: Latest update wins
   - Lesson content: Server version always wins

3. **Sync Indicators**:
   - Visual indicators for sync status
   - Progress tracking for large sync operations
   - Error reporting for failed synchronization

## Security Considerations in Data Flow

1. **Data Validation**:

   - Client-side validation before submission
   - Server-side validation in Firebase Functions
   - Schema validation in Firestore Rules

2. **Authentication Checks**:

   - Token validation for all authenticated requests
   - Role-based access control in Firestore Rules
   - Expiration and refresh of authentication tokens

3. **Data Encryption**:

   - Sensitive data encrypted in transit (HTTPS)
   - Sensitive data encrypted at rest in Firestore
   - Secure storage of authentication tokens

4. **Rate Limiting and Abuse Prevention**:
   - Rate limiting on Firebase Functions
   - Throttling of rapid-fire requests
   - Monitoring for suspicious activity patterns

This data flow diagram provides a comprehensive view of how data moves through the "Mistrz Promptów" application, ensuring a clear understanding of data management, synchronization, and security considerations.

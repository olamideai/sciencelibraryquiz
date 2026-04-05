# Science Library Quiz

Master the sciences, one quiz at a time.

## Project Type
Pure HTML/CSS/JavaScript single-page application (SPA). Firebase for authentication and database.

## Features
- 6-Tier Ranking System (Novice to Legend)
- Achievement Badge System
- Friend & Challenge System
- Dynamic Admin Panel
- Streak System

## Setup Instructions

### Firebase Setup
1. Create a Firebase project.
2. Enable Email/Password Authentication.
3. Create a Firestore database.
4. Set up the following rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /scores/{scoreId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    // Add other rules for achievements, friends, challenges, etc.
  }
}
```

### Environment Variables
Create a `.env` file (or set in deployment dashboard):
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `ADMIN_PIN`

### Admin Access
Access via URL hash `/#admin`. Default PIN is `123456`.

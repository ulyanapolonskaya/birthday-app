# Firestore Security Rules

These are the security rules that need to be applied in the Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny access to everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## How to Apply These Rules

1. Go to the Firebase Console
2. Select your project (`birthday-app`)
3. Go to Firestore Database
4. Click on the "Rules" tab
5. Replace the existing rules with the rules above
6. Click "Publish"

## What These Rules Do

- **User Data Isolation**: Each user can only access their own data under `/users/{userId}/`
- **Authentication Required**: Only authenticated users can read/write data
- **Default Deny**: Everything else is denied by default for security

## Data Structure

The app stores data in this structure:
```
/users/{userId}/birthdays/{birthdayId}
{
  name: string,
  dob: string,
  notes: string
}
```

Where `{userId}` is the authenticated user's UID and `{birthdayId}` is the document ID for each birthday entry. 
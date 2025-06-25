# Firebase Integration TODO List

## Completed ✅

- [x] Created Firebase project `birthday-app`
- [x] Enabled Firebase Authentication
- [x] Created Firestore Database

---

## TODO List – Firebase Integration

### 🔧 1. **Get Firebase SDK Configuration**

- [x] Go to **Firebase Console → Project settings**
- [x] In the **"Your apps"** section, choose **Web app**
- [x] Register your app (give it a name, skip hosting if using GitHub Pages)

### 🌐 2. **Include Firebase SDK in Your App**

- [x] Add Firebase SDK scripts to your HTML (auth + firestore)
- [x] Initialize Firebase in your JavaScript using the config:
```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP53BQEBgT8ZoX6XbBZhS1LydZ_a3_yT0",
  authDomain: "birthday-app-d90d0.firebaseapp.com",
  projectId: "birthday-app-d90d0",
  storageBucket: "birthday-app-d90d0.firebasestorage.app",
  messagingSenderId: "669484208673",
  appId: "1:669484208673:web:e3bb23be7e0af8ee058960"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

### 🔐 3. **Set Up Authentication in Your App**

- [x] Create a way for users to:
  - [x] Sign up / log in (or auto sign in anonymously)
  - [x] Track current user session (e.g. onAuthStateChanged)

### 💾 4. **Connect to Firestore**

- [x] On user login:
  - [x] Load birthday list for that specific user from Firestore
  - [x] Display the data in your app

### ✏️ 5. **Enable Adding/Editing/Deleting Birthdays**

- [x] When user adds/edits/deletes a birthday:
  - [x] Save the updated list to Firestore under their user ID

### 🧹 6. **Add Data**

- [x] Copy birthday data into Firestore

### 🔒 7. **Secure Firestore Access**

- [x] Go to **Firestore → Rules**
- [x] Update rules to allow users to only read/write their own data
- [x] Publish the rules

*Note: Security rules are documented in `firestore-security-rules.md` and need to be applied in Firebase Console*

### 🧪 8. **Test Everything**

- [ ] Create a test user
- [ ] Add/edit/delete birthdays and refresh page
- [ ] Confirm data persists and belongs to correct user
- [ ] Try logging in as another user to verify separation

### 🧼 9. **Clean Up Unused Code**

- [x] Remove old localStorage logic
- [x] Simplify code now that everything's in Firestore

### 📝 Optional: Future Enhancements

- [ ] Add logout button
- [ ] Add form validation

// ==========================================
// FIREBASE CONFIGURATION
// firebase-config.js
//
// ⚠️ Replace ALL values below with your
//    actual Firebase project credentials!
//
// Get them from:
// Firebase Console → Project Settings → Your apps → Web app
// ==========================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ==========================================
// ✅ Done! Don't edit below this line.
// ==========================================

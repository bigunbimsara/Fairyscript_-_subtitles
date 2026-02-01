// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyCC0l4fhJiLcmSpXszstS6D11ql5QCmYok",
    authDomain: "fairyscript-sinhala-subtitles.firebaseapp.com",
    projectId: "fairyscript-sinhala-subtitles",
    storageBucket: "fairyscript-sinhala-subtitles.firebasestorage.app",
    messagingSenderId: "G-9NRFHWKGVZ",
    appId: "1:334912178411:web:420bdb4fabdb15e55656ae"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// GitHub OAuth provider
const githubProvider = new firebase.auth.GithubAuthProvider();

console.log('Firebase initialized successfully');
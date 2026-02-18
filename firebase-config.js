// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyC_DPgBum7-4__KIvYkpEsynCc_ScLHZsg",
    authDomain: "fairyscript-subs-cf9ef.firebaseapp.com",
    projectId: "fairyscript-subs-cf9ef",
    storageBucket: "fairyscript-subs-cf9ef.firebasestorage.app",
    messagingSenderId: "132470944565",
    appId: "1:132470944565:web:bc6854b82018de8d72527c"
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
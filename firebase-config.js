// Firebase Configuration
// Replace these values with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyBO2Ol_528mfytCxczHQ6Q1vWegL3_u8ec",
    authDomain: "fairyscript-subs.firebaseapp.com",
    projectId: "fairyscript-subs",
    storageBucket: "fairyscript-subs.firebasestorage.app",
    messagingSenderId: "475233385864",
    appId: "1:475233385864:web:e531218ce18a29b010ce3d"
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

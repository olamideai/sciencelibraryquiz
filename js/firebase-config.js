// Firebase Configuration - Using your provided API
const firebaseConfig = {
    apiKey: "AIzaSyBoYdFQ1jKVUO0H0QrJpgWN-wMnwoervgU",
    authDomain: "sciencelibraryquiz.firebaseapp.com",
    projectId: "sciencelibraryquiz",
    storageBucket: "sciencelibraryquiz.firebasestorage.app",
    messagingSenderId: "881405928204",
    appId: "1:881405928204:web:26437c0c0b7d6c9344df29"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Admin PIN (stored here for client-side admin access verification)
// In production, this should be verified via Cloud Function
const ADMIN_PIN = '123456'; // Change this to your 6-digit PIN

// Collection references
const collections = {
    users: db.collection('users'),
    scores: db.collection('scores'),
    questions: db.collection('questions'),
    achievements: db.collection('achievements'),
    friends: db.collection('friends'),
    challenges: db.collection('challenges'),
    subjectSettings: db.collection('subjectSettings'),
    adminSettings: db.collection('adminSettings'),
    counters: db.collection('counters')
};

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .catch(err => {
        if (err.code === 'failed-precondition') {
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.log('Persistence not supported');
        }
    });

console.log('Firebase initialized successfully');

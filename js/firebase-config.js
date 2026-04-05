// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBoYdFQ1jKVUO0H0QrJpgWN-wMnwoervgU",
    authDomain: "sciencelibraryquiz.firebaseapp.com",
    projectId: "sciencelibraryquiz",
    storageBucket: "sciencelibraryquiz.firebasestorage.app",
    messagingSenderId: "881405928204",
    appId: "1:881405928204:web:26437c0c0b7d6c9344df29"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Admin PIN (set to 123456 as default)
const ADMIN_PIN = '123456';

// Database collections
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

// Enable persistence for offline use
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported');
    }
});

window.auth = auth;
window.db = db;
window.storage = storage;
window.collections = collections;
window.ADMIN_PIN = ADMIN_PIN;

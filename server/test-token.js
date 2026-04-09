// test-token.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// 🔴 PASTE YOUR FIREBASE WEB CONFIG HERE
const firebaseConfig = {
    apiKey: "AIzaSyDRWiZJs2gfV8xvQvqKF2N2_TTev9jurwQ",
    authDomain: "civicpulse-b3220.firebaseapp.com",
    projectId: "civicpulse-b3220",
    storageBucket: "civicpulse-b3220.firebasestorage.app",
    messagingSenderId: "54648515202",
    appId: "1:54648515202:web:39e9698e318ed5b754a29b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔴 USE A REAL USER FROM FIREBASE AUTH
const email = "test@test.com";
const password = "password123";

async function getToken() {
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();

        console.log("\n✅ COPY THIS TOKEN ↓↓↓\n");
        console.log(token);
        console.log("\n===========================\n");

    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
}

getToken();
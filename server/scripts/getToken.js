// server/scripts/getToken.js
// Run: node scripts/getToken.js coordinator
// Run: node scripts/getToken.js volunteer

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log("ENV PATH:", require('path').resolve(__dirname, '../../.env'));
console.log("API KEY:", process.env.FIREBASE_WEB_API_KEY);
const firebaseConfig = {
    apiKey: process.env.FIREBASE_WEB_API_KEY,   // Add this to .env
    authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const USERS = {
    coordinator: { email: 'coordinator@test.com', password: 'Test@1234' },
    volunteer:   { email: 'volunteer@test.com',   password: 'Test@1234' },
    community:   { email: 'community@test.com',   password: 'Test@1234' },
};

const role = process.argv[2] || 'coordinator';
const user = USERS[role];

if (!user) {
    console.error('Usage: node scripts/getToken.js [coordinator|volunteer|community]');
    process.exit(1);
}

signInWithEmailAndPassword(auth, user.email, user.password)
    .then(async (cred) => {
        const token = await cred.user.getIdToken();
        console.log('\n========== COPY THIS TOKEN ==========');
        console.log(`Role: ${role}`);
        console.log(`UID: ${cred.user.uid}`);
        console.log(`\nBearer ${token}`);
        console.log('=====================================\n');
        console.log('⚠️  Token expires in 1 hour. Re-run to get fresh token.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Login failed:', err.message);
        process.exit(1);
    });
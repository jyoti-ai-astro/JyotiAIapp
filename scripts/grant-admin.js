// scripts/grant-admin.js
//
// One-time script to make a Firebase user an admin (isAdmin: true)
const admin = require('firebase-admin');
const path = require('path');

// 1) Load service account JSON (downloaded from Firebase)
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

// 2) Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function grantAdmin(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user UID: ${user.uid}`);
    console.log('⏳ Setting custom claims { isAdmin: true } ...');
    await admin.auth().setCustomUserClaims(user.uid, {
      isAdmin: true,
    });
    console.log('✨ Done! User is now an admin.');
    console.log('👉 Email:', email);
    console.log('👉 Claims: { isAdmin: true }');
  } catch (err) {
    console.error('❌ Error while granting admin:', err);
  } finally {
    process.exit(0);
  }
}

// ✏️ CHANGE THIS EMAIL IF NEEDED
const ADMIN_EMAIL = 'diptanshu.ojha1@gmail.com';

grantAdmin(ADMIN_EMAIL);


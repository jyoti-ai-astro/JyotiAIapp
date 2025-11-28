// scripts/setAdmin.ts
import 'dotenv/config';
import { getAdminAuth } from '@/lib/firebase/admin';

async function setAdmin(email: string) {
  try {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      console.error('❌ Firebase Admin not initialized. Check environment variables.');
      console.error('Required: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL');
      process.exit(1);
    }
    console.log(`🔍 Looking up user: ${email}`);
    const user = await adminAuth.getUserByEmail(email);
    console.log(`✅ Found user UID: ${user.uid}`);
    console.log('⏳ Setting custom claims { isAdmin: true } ...');
    await adminAuth.setCustomUserClaims(user.uid, {
      ...(user.customClaims || {}),
      isAdmin: true,
    });
    console.log('✨ Done! User is now an admin.');
    console.log('👉 Email:', email);
    console.log('👉 Claims: { isAdmin: true }');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to set admin claim:', error);
    process.exit(1);
  }
}

// Change this email if needed:
setAdmin('diptanshu.ojha1@gmail.com');

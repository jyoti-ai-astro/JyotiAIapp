import crypto from 'node:crypto'
import admin from 'firebase-admin'

const required = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_PASSWORD',
]

const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

const email = String(process.env.BOOTSTRAP_ADMIN_EMAIL).trim().toLowerCase()
const password = String(process.env.BOOTSTRAP_ADMIN_PASSWORD)
const name = String(process.env.BOOTSTRAP_ADMIN_NAME || 'JyotiAI SuperAdmin').trim()

if (!email.includes('@')) {
  console.error('BOOTSTRAP_ADMIN_EMAIL must be a valid email address.')
  process.exit(1)
}

if (password.length < 14) {
  console.error('BOOTSTRAP_ADMIN_PASSWORD must be at least 14 characters long.')
  process.exit(1)
}

const privateKey = String(process.env.FIREBASE_ADMIN_PRIVATE_KEY).replace(/\\n/g, '\n')

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    })

const db = app.firestore()
const admins = db.collection('admins')
const existing = await admins.limit(1).get()

if (!existing.empty) {
  console.error('Bootstrap refused: the admins collection is not empty. Use the audited Staff flow for additional admins.')
  process.exit(2)
}

const duplicateEmail = await admins.where('email', '==', email).limit(1).get()
if (!duplicateEmail.empty) {
  console.error('Bootstrap refused: an admin with this email already exists.')
  process.exit(2)
}

const salt = crypto.randomBytes(16).toString('hex')
const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex')
const uid = crypto.randomUUID()
const now = new Date()

await admins.doc(uid).set({
  email,
  name,
  role: 'SuperAdmin',
  passwordHash,
  passwordSalt: salt,
  passwordVersion: 'scrypt-v1',
  createdAt: now,
  createdBy: 'local-bootstrap',
  bootstrapVersion: 1,
})

await db.collection('admin_audit').add({
  action: 'staff.bootstrap_superadmin',
  actorUid: uid,
  targetUid: uid,
  targetEmail: email,
  reason: 'Initial SuperAdmin bootstrap',
  source: 'local-bootstrap',
  createdAt: now,
})

console.log(`SuperAdmin created successfully for ${email}.`)
console.log('Remove BOOTSTRAP_ADMIN_PASSWORD from .env.local before starting the web app again.')

# What's Next - Implementation Guide

## ✅ Just Completed

### 1. **Firebase Admin Integration** ✅
- Complete Firebase Admin SDK setup with session cookie management
- User profile creation/update logic in Firestore
- Secure authentication flow with HTTP-only cookies

### 2. **User Management APIs** ✅
- `/api/user/get` - Get current user profile
- `/api/user/update` - Update user profile
- `/api/auth/logout` - Logout endpoint
- Client-side user service (`lib/services/user-service.ts`)

### 3. **Onboarding Flow** ✅
- Basic onboarding page structure
- Birth details form (DOB, TOB, POB)
- Multi-step flow ready for expansion

### 4. **Login Flow Enhancement** ✅
- Automatic redirect to onboarding for new users
- User store integration
- Session persistence

## 🎯 Immediate Next Steps (Priority Order)

### 1. **Set Up Firebase Project** (Required)
Before testing, you need to:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Google, Facebook, Email Link)
3. Create Firestore database
4. Create Storage bucket
5. Generate service account key for Admin SDK
6. Add all credentials to `.env.local`

**See `SETUP.md` for detailed instructions**

### 2. **Test Authentication Flow**
Once Firebase is configured:
```bash
npm run dev
```
- Test Google login
- Verify user creation in Firestore
- Test onboarding flow
- Verify session persistence

### 3. **Complete Onboarding Flow**
Enhance `/app/onboarding/page.tsx`:
- [ ] Add geocoding for Place of Birth (Google Geocoding API)
- [ ] Integrate Kundali generation after birth details
- [ ] Add Rashi confirmation step with calculated values
- [ ] Add Numerology calculation step
- [ ] Add palm upload step
- [ ] Add face upload step
- [ ] Add aura capture step

### 4. **Swiss Ephemeris Integration**
For accurate kundali calculations:
- [ ] Install Swiss Ephemeris data files
- [ ] Implement planet position calculations
- [ ] Implement house cusp calculations
- [ ] Implement dasha calculations
- [ ] Test with sample birth data

### 5. **Firestore Security Rules**
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Server-only writes
    }
    // Add more rules...
  }
}
```

### 6. **Image Upload System**
For palm/face/aura scans:
- [ ] Create Firebase Storage upload utility
- [ ] Add image compression
- [ ] Create upload UI components
- [ ] Implement progress indicators

## 📋 Medium Priority

### 7. **Dashboard Enhancements**
- Daily horoscope generation
- Spiritual graph visualization
- Timeline view
- Chakra/aura visualizations

### 8. **AI Vision Integration**
- OpenAI Vision for palmistry
- Gemini Vision for face reading
- Image preprocessing pipeline

### 9. **RAG System Setup**
- Pinecone index creation
- Document ingestion pipeline
- Vector embedding system

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 🐛 Common Issues & Solutions

### Issue: "Firebase Admin not initialized"
**Solution**: Check that all Firebase Admin environment variables are set in `.env.local`

### Issue: "Session cookie not working"
**Solution**: Ensure `NODE_ENV` is set correctly and cookies are being sent with requests

### Issue: "Firestore permission denied"
**Solution**: Set up Firestore security rules and ensure user is authenticated

## 📚 Files to Review

1. **`lib/firebase/admin.ts`** - Firebase Admin initialization
2. **`app/api/auth/login/route.ts`** - Complete login flow
3. **`app/api/user/get/route.ts`** - User profile retrieval
4. **`app/onboarding/page.tsx`** - Onboarding UI
5. **`lib/services/user-service.ts`** - Client-side user API

## 🎯 Current Status

**✅ Ready to Test:**
- Authentication flow (once Firebase is configured)
- User profile management
- Basic onboarding

**🚧 Needs Implementation:**
- Swiss Ephemeris integration
- AI Vision APIs
- RAG system
- Image uploads
- Dashboard features

**Next Milestone:** Complete onboarding flow with kundali generation

---

**Last Updated:** After Firebase Admin Integration
**Next Focus:** Firebase setup and testing


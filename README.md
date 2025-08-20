# MPC Wallet Phone App

A React Native mobile application for secure Multi-Party Computation (MPC) wallet operations. This app serves as a secure signing device that pairs with browser wallets for MPC-based transactions.

## 🚨 Security Notice

**IMPORTANT**: This repository contains template files only. Before using this app, you must:

1. **Configure Firebase credentials** (see setup instructions below)
2. **Set up your own Firebase project**
3. **Never commit actual API keys to version control**

## 🚀 Features

- **Firebase Authentication**: Email/password and Google Sign-In support
- **MPC Wallet Pairing**: Secure pairing with browser wallets
- **Sepolia Testnet Support**: Create and manage wallets on Sepolia
- **Secure Key Storage**: Private keys stored securely on device
- **Orchestrator Integration**: Works with MPC orchestrator service

## 📱 Tech Stack

- **React Native** with Expo
- **Firebase** for authentication and backend
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Lucide React Native** for icons

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Firebase project
- iOS Simulator or Android Emulator

### 1. Clone the Repository

```bash
git clone https://github.com/yogendra-17/phoneSSO
cd phoneSSO
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication (Email/Password and Google Sign-In)

#### Step 2: Configure Firebase Credentials

**For Web App:**
1. Copy `config/firebase.template.ts` to `config/firebase.ts`
2. Replace placeholder values with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

**For Android:**
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. **IMPORTANT**: This file is gitignored for security

**For iOS:**
1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/FirebaseAuthApp/` directory
3. **IMPORTANT**: This file is gitignored for security

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Orchestrator Configuration
ORCHESTRATOR_URL=http://localhost:8080
```

### 5. Run the App

```bash
# Start Expo development server
npm run dev

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🔐 Security Configuration

### Firebase Security Rules

Configure Firebase Security Rules to restrict access:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read public data
    match /public/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

### API Key Restrictions

1. **Restrict API Key Usage** in Firebase Console:
   - Go to Project Settings > General
   - Under "Your apps", find your API key
   - Click "Restrict key"
   - Set appropriate restrictions (HTTP referrers, app restrictions)

2. **Enable App Check** for additional security

## 📁 Project Structure

```
phoneSSO/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── QRScanner.tsx      # QR code scanner component
├── config/               # Configuration files
│   ├── firebase.ts       # Firebase configuration (gitignored)
│   └── firebase.template.ts # Template for Firebase setup
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── services/             # API services
│   └── orchestrator.ts   # Orchestrator service
├── utils/                # Utility functions
│   └── firebaseDebug.ts  # Firebase debugging utilities
├── android/              # Android-specific files
├── ios/                  # iOS-specific files
└── README.md            # This file
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start Expo development server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run build:web    # Build for web
npm run lint         # Run ESLint
```

### Debugging

The app includes comprehensive debugging utilities:

- **Firebase Debug**: Use debug buttons in auth screen
- **Network Logging**: All API calls are logged with 🔥 emojis
- **Error Handling**: Detailed error messages with step information

## 🚨 Security Checklist

Before deploying to production:

- [ ] Firebase API keys are restricted
- [ ] Environment variables are properly set
- [ ] Firebase Security Rules are configured
- [ ] App Check is enabled
- [ ] No sensitive files are committed to git
- [ ] Private keys are stored securely on device
- [ ] HTTPS is used for all API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the Firebase Console for authentication errors
2. Verify your Firebase configuration
3. Check the console logs for detailed error messages
4. Ensure your orchestrator service is running

## 🔗 Related Projects

- **Browser Wallet**: Web application for MPC wallet operations
- **Orchestrator Service**: Backend service for MPC coordination
- **Cloud Node**: MPC computation node

---

**⚠️ Remember**: Never commit actual API keys or sensitive credentials to version control!
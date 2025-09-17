# Firebase Setup Instructions

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCSumRHmaBa5XKeUYfUQo6mwjTzaTQVIpo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=family-planner-dev-31ff2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=family-planner-dev-31ff2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=family-planner-dev-31ff2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=325445970266
NEXT_PUBLIC_FIREBASE_APP_ID=1:325445970266:web:493746503db4ddd92d2b63
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KX43CQ506B
```

## Authentication Setup

### Google Authentication Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `family-planner-dev-31ff2`
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your domain to **Authorized domains**:
   - `localhost` (for development)
   - Your production domain (when deployed)

### Email Link Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email link (passwordless sign-in)**
3. Configure the action URL to match your domain

## Usage

### Firebase Services

Import Firebase services from the configuration file:

```typescript
import { auth, db, analytics, googleProvider } from "@/lib/firebase";
```

### Authentication Functions

Import authentication functions:

```typescript
import { 
  signInWithGoogle, 
  sendMagicLink, 
  signInWithMagicLink, 
  signOutUser,
  onAuthStateChange 
} from "@/lib/auth";
```

## Available Services

- `auth`: Firebase Authentication
- `db`: Firestore Database
- `analytics`: Firebase Analytics (browser only)
- `googleProvider`: Google Auth Provider for magic link authentication

## Authentication Features

- **Google Sign-in**: One-click Google authentication
- **Magic Link**: Passwordless email authentication
- **Automatic Redirect**: Handles magic link verification automatically
- **State Management**: Real-time authentication state updates

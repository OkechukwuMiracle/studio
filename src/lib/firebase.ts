// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  type Auth
  // ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber are not directly used here
  // if OTP is handled client-side or simulated as in current actions.ts.
  // They would be imported in the client component that handles Firebase Phone Auth.
} from "firebase/auth";

// Your web app's Firebase configuration
// It's crucial that these environment variables are set in your deployment environment
// and prefixed with NEXT_PUBLIC_ if they are to be accessed on the client.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "onga-otp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "onga-otp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "onga-otp.appspot.com", // Common default structure
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "75562486015",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let authInstance: Auth;

// Basic check for essential config values, especially for client-side execution
if (typeof window !== 'undefined') { // Only run this check/log on the client-side
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    console.error(
      "Firebase initialization failed: NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_APP_ID is missing. " +
      "Please ensure they are set in your environment variables."
    );
  }
}

try {
  // Firebase expects all config values to be strings.
  // Provide empty strings as fallbacks if an env var is undefined, though this might lead to runtime errors from Firebase itself.
  // The ideal case is all env vars are correctly set.
  const configForFirebase = {
    apiKey: firebaseConfig.apiKey || "",
    authDomain: firebaseConfig.authDomain || "",
    projectId: firebaseConfig.projectId || "",
    storageBucket: firebaseConfig.storageBucket || "",
    messagingSenderId: firebaseConfig.messagingSenderId || "",
    appId: firebaseConfig.appId || "",
  };
  app = initializeApp(configForFirebase);
  authInstance = getAuth(app);
} catch (error) {
  if (typeof window !== 'undefined') { // Log error on client
      console.error("Firebase initialization error:", error);
  }
  // Fallback to prevent app crashing hard if components try to import auth.
  // This auth instance will not be functional.
  // Consider a more robust error handling or state management for app initialization failures.
  // @ts-ignore - This is a non-functional fallback
  authInstance = {} as Auth; 
}

export const auth = authInstance;

// Note: The previous sendOTP and verifyOTP helper functions were removed from here.
// For Firebase Phone Authentication using the client SDK, 'signInWithPhoneNumber'
// must be called on the client with a live 'RecaptchaVerifier' instance.
// The 'ConfirmationResult.confirm(code)' should also typically be called on the client.
// The current 'actions.ts' simulates OTP. If real Firebase OTP is required,
// 'src/components/menu-list.tsx' or relevant client components would need to
// handle these Firebase calls.

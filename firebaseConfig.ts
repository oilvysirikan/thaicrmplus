// firebaseConfig.ts
import { initializeApp } from "firebase/app";
// Import services for their side-effects to ensure they are registered.
import "firebase/auth";
import "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase. This creates the default app instance.
initializeApp(firebaseConfig);

// Get the services from the default app instance.
// This is a more robust way to avoid initialization race conditions.
const auth = getAuth();
const db = getFirestore();

export { auth, db };

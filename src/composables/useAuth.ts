// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC46WQZd8AcP-xOy-dXeHbUOSq29kHu5jk",
  authDomain: "bible-app-a6595.firebaseapp.com",
  projectId: "bible-app-a6595",
  storageBucket: "bible-app-a6595.appspot.com", // fixed the .app domain
  messagingSenderId: "47812367747",
  appId: "1:47812367747:web:38eef8ff2a407db82852b6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

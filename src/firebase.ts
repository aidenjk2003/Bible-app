import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC46WQZd8AcP-xOy-dXeHbUOSq29kHu5jk",
  authDomain: "bible-app-a6595.firebaseapp.com",
  projectId: "bible-app-a6595",
  storageBucket: "bible-app-a6595.appspot.com",
  messagingSenderId: "47812367747",
  appId: "1:47812367747:web:38eef8ff2a407db82852b6",
  measurementId: "G-MQB2GMMNC5",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };

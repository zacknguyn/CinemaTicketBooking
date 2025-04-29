import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9ZwsWNpy0dyE-kesu_IcTkQefBmTbH08",
  authDomain: "phong-crud-482e8.firebaseapp.com",
  projectId: "phong-crud-482e8",
  storageBucket: "phong-crud-482e8.firebasestorage.app",
  messagingSenderId: "430502374440",
  appId: "1:430502374440:web:890cb962ff2d6613fa591d",
  measurementId: "G-0MD8T3QGPQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

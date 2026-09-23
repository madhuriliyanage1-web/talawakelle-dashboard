import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACALRdfMg-yTOs6YGU2TSKP95KmkpA0ME",
  authDomain: "ds-planning-dashboard-14244.firebaseapp.com",
  projectId: "ds-planning-dashboard-14244",
  storageBucket: "ds-planning-dashboard-14244.firebasestorage.app",
  messagingSenderId: "193311491093",
  appId: "1:193311491093:web:e7160d6e6a3184f0b13a1c",
  measurementId: "G-6MFG4D2Z21"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;

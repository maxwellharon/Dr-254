import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚡ Same project as your quote form
const firebaseConfig = {
  apiKey: "AIzaSyCu6HumVPW8VJ2u4zimSg8mqspj1kCt_bk",
  authDomain: "dr-ken-aluora-quotes.firebaseapp.com",
  projectId: "dr-ken-aluora-quotes",
  storageBucket: "dr-ken-aluora-quotes.firebasestorage.app",
  messagingSenderId: "371817614402",
  appId: "1:371817614402:web:b1b3fb38602ad49b6331db"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log("✅ Firebase initialized – aluora quotes project");
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import json from "./cred.json";
const firebaseConfig = {
  apiKey: json.apiKey,
  authDomain: json.authDomain,
  projectId: json.projectId,
  storageBucket: json.storageBucket,
  messagingSenderId: json.messagingSenderId,
  appId: json.appId,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

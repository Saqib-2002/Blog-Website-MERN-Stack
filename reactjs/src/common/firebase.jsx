// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe8NB2AMXbZzm45OPRb0XQdepRu6H98Ac",
  authDomain: "blog-website-mern-stack.firebaseapp.com",
  projectId: "blog-website-mern-stack",
  storageBucket: "blog-website-mern-stack.appspot.com",
  messagingSenderId: "1035007811347",
  appId: "1:1035007811347:web:9c3dca2f7e42f16d5b44e6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// google auth.
const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};

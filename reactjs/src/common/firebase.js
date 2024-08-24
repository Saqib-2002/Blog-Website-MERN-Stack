// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { auth } from './your-firebase-config-file'; // Make sure to import your Firebase config
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

// export const authWithGoogle = async () => {
//   let user = null;
//   await signInWithPopup(auth, provider)
//     .then((result) => {
//       user = result.user;
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   return user;
// };

export const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    // Get the id token from the credential
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    const idToken = await result.user.getIdToken();
    // console.log("ID TOKEN:- ", idToken);

    // const accessToken = credential.accessToken;
    // console.log("Firebase accessToken: - ", accessToken);

    // Get the user information
    const user = result.user;

    // Return an object with both the user and the access token
    return {
      user: user,
      id_token: idToken,
    };
  } catch (error) {
    console.error("Google Auth Error:", error);
    // Handle errors here, such as displaying a notification to the user
    throw error; // Re-throw the error so it can be caught in the calling function
  }
};

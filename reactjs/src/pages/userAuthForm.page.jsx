import { useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useContext } from "react";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
  const authForm = useRef();

  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);
  // console.log(access_token);

  const userAuthThroughServer = (serverRoute, formData) => {
    console.log("Sending data:", formData); // Log the data being sent

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(({ data }) => {
        console.log("Server response:", data);
        storeInSession("user", JSON.stringify(data));

        setUserAuth(data);
        // Handle successful signup/signin here
        toast.success("Authentication successful!");
      })
      .catch(({ response }) => {
        console.error("Server error response:", response.data);
        const errorMessage = response.data.error;
        const errorField = response.data.field;
        toast.error(`${errorField}: ${errorMessage}`);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type === "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    // Create FormData from the form element
    let form = new FormData(e.target);
    let formData = {};

    // Convert FormData to a plain object
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    // Client-side validation
    if (type !== "sign-in" && (!fullname || fullname.length < 3)) {
      return toast.error("Fullname must be at least 3 letters long");
    }

    if (!email.length) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
      );
    }

    userAuthThroughServer(serverRoute, formData);
  };

  // google auth
  // const handleGoogleAuth = (e) => {
  //   e.preventDefault();
  //   authWithGoogle()
  //     .then((user) => {
  //       console.log(user);

  //       const serverRoute = "/google-auth";
  //       const formData = {
  //         access_token: user.access_token,
  //       };

  //       userAuthThroughServer(serverRoute, formData)
  //     })
  //     .catch((err) => {
  //       toast.error("Trouble login through Google");
  //       return console.log(err);
  //     });
  // };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        console.log("Google Auth User:", user);
        console.log(user.access_token);
        if (user && user.access_token) {
          const serverRoute = "/google-auth";
          const formData = {
            access_token: user.access_token,
          };
          userAuthThroughServer(serverRoute, formData);
        } else {
          console.error("No access token received from Google Auth");
          toast.error("Failed to authenticate with Google. Please try again.");
        }
      })
      .catch((err) => {
        console.error("Google Auth Error:", err);
        toast.error("Trouble logging in through Google");
      });
  };

  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form
          ref={authForm}
          className="w-[80%] max-w-[400px]"
          onSubmit={handleSubmit}
        >
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
          </h1>
          {type !== "sign-in" && (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />
          <button className="btn-dark center mt-14" type="submit">
            {type.replace("-", " ")}
          </button>
          <div className="relative w-full items-center flex gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>
          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} className="w-5" alt="Google Icon" />
            continue with google
          </button>

          {type === "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;

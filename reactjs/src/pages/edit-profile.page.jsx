import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const bioLimit = 150;
  const profileImgElement = useRef();
  const editProfileForm = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [characterLeft, setCharacterLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

  const {
    personal_info: {
      username: profile_username,
      fullname,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    // console.log(import.meta.env.VITE_SERVER_DOMAIN);
    if (access_token) {
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/user/get-profile`, {
          username: userAuth?.username,
        })
        .then(({ data }) => {
          console.log("Profile Data:", data); // Debugging

          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log("edit-page-error: ", err);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharacterLeft(bioLimit - e.target.value.length);
  };

  const handleImgPreview = (e) => {
    const img = e.target.files[0];
    profileImgElement.current.src = URL.createObjectURL(img);
    setUpdatedProfileImg(img);
  };
  const handleImgUpload = (e) => {
    e.preventDefault();
    if (updatedProfileImg) {
      const loadingToast = toast.loading("Uploading");
      e.target.setAttribute("disabled", true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(editProfileForm.current);
    const formData = {};

    for (const [key, value] of form.entries()) {
      formData[key] = value;
    }
    // console.log(formData)
    const {
      username,
      bio,
      youtube,
      instagram,
      twitter,
      github,
      facebook,
      website,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be atleast 3 letters long.");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit}`);
    }

    const loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
        {
          username,
          bio,
          social_links: {
            youtube,
            facebook,
            twitter,
            github,
            instagram,
            website,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        console.log(data);
        if (userAuth.username != data.username) {
          const newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }

        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated Successfully");
      })
      .catch(({ response }) => {
        console.log("catch");
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.err);
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileForm}>
          <Toaster />

          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 items-center flex justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img src={profile_img} ref={profileImgElement} />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                hidden
                onChange={handleImgPreview}
              />
              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImgUpload}
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Fullname"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                type="text"
                name="username"
                value={profile_username}
                placeholder="Username"
                icon="fi-rr-at"
              />
              <p className="text-dark-grey -mt-3">
                Username will use to search user and will be visible to all
                users
              </p>
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleCharacterChange}
              ></textarea>
              <p>{characterLeft} Characters left</p>

              <p className="my-6 text-dark-grey">
                Add your Social handles below
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  const link = social_links[key];
                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={`fi ${
                        key != "website" ? "fi-brands-" + key : "fi-rr-globe"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};
export default EditProfile;

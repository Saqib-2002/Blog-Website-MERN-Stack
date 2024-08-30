import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { toast, Toaster } from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import { tools } from "./tools.component";
import { UserContext } from "../App";
// import { buildTransform } from "framer-motion";

// Blog Editor Component
const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, author, des, tags, draft },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  const [bannerImage, setBannerImage] = useState(banner || defaultBanner);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);
  const navigate = useNavigate();
  // console.log(title);

  // useEffect fot text Editor
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, []);

  useEffect(() => {
    setBannerImage(banner || defaultBanner);
  }, [banner]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const loadingToast = toast.loading("Uploading banner...");
      const formData = new FormData();
      formData.append("banner", file);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (data.success) {
          toast.dismiss(loadingToast);
          toast.success("Banner uploaded successfully");
          setBlog({ ...blog, banner: data.image_url });
          setBannerImage(data.image_url);
        } else {
          throw new Error(data.message || "Upload failed");
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error(`Upload failed: ${error.message}`);
      }
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    // console.log(e.target.scrollHeight)
    const input = e.target;
    // console.log(input);
    input.style.height = "auto";
    // managing the scroll height.
    // console.log(input.scrollHeight);
    input.style.height = `${input.scrollHeight}px`;
    // console.log(input.value);.

    setBlog({ ...blog, title: input.value });
  };

  const handlePublishEvent = (e) => {
    if (!bannerImage.length) {
      return toast.error("Upload a blog banner to publish it");
    }
    console.log(e);
    if (!title.length) {
      return toast.error("Write blog title to publish");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          console.log(data);
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }
    const loadingToast = toast.loading("Saving Draft...");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        const blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        // console.log(blogObj);
        // console.log("Sending blog data:", blogObj);
        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          })
          .then(() => {
            e.target.classList.add("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved to Draft");

            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.add("disable");
            toast.dismiss(loadingToast);

            return toast.error("Error saving", response.data.error);
          });
      });
    }
  };
  return (
    <>
      <nav className="navbar">
        <Toaster />
        {/* Logo */}
        <Link to="/">
          <img src={logo} className="flex-none w-11" />
        </Link>
        {/* title */}
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        {/* Buttons */}
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2 " onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full ">
            <div>
              <div className="relative aspect-video bg-black border-4 border-dark-grey hover:opacity-80 hover:bg-opacity-30">
                <label htmlFor="uploadBanner">
                  <img src={bannerImage} className="z-20" />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center
                opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-white font-semibold">
                      Change Banner
                    </span>
                  </div>
                  <input
                    type="file"
                    id="uploadBanner"
                    accept=".png, .jpg, .jpeg"
                    hidden
                    onChange={handleBannerUpload}
                  />
                </label>
              </div>
            </div>

            {/* Title Editor */}
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-5 my-5" />

            {/* Text Editor */}

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;


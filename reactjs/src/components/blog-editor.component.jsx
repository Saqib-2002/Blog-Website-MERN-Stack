// import { Link, useNavigate } from "react-router-dom";
// import logo from "../imgs/logo.png";
// import AnimationWrapper from "../common/page-animation";
// import defaultBanner from "../imgs/blog banner.png";
// import { useContext, useEffect, useState } from "react";
// import { EditorContext } from "../pages/editor.pages";
// import EditorJS from "@editorjs/editorjs";
// import { toast, Toaster } from "react-hot-toast";
// import axios from "axios";
// import { tools } from "./tools.component";
// import { UserContext } from "../App";
// import Modal from "../Modal/Modal";

// // import Draggable from "react-draggable";
// // import { disconnect } from "mongoose";
// // import { buildTransform } from "framer-motion";

// // Blog Editor Component
// const BlogEditor = () => {
//   const {
//     blog,
//     blog: { title, banner, content, author, des, tags, draft },
//     setBlog,
//     textEditor,
//     setTextEditor,
//     setEditorState,
//   } = useContext(EditorContext);

//   const {
//     userAuth: { access_token },
//   } = useContext(UserContext);
//   const navigate = useNavigate();
//   // console.log(title);.
//   const [bannerImage, setBannerImage] = useState(blog.banner || defaultBanner);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [position, setPosition] = useState(
//     blog.bannerPosition || { x: 0, y: 0 }
//   );
//   const [isDragging, setIsDragging] = useState(false);

//   // useEffect fot text Editor
//   useEffect(() => {
//     if (!textEditor.isReady) {
//       setTextEditor(
//         new EditorJS({
//           holder: "textEditor",
//           data: content,
//           tools: tools,
//           placeholder: "Let's write an awesome story",
//         })
//       );
//     }
//   }, []);

//   useEffect(() => {
//     setBannerImage(banner || defaultBanner);
//   }, [banner]);

//   const handleBannerUpload = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const loadingToast = toast.loading("Uploading banner...");
//       const formData = new FormData();
//       formData.append("banner", file);

//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_SERVER_DOMAIN}/upload`,
//           {
//             method: "POST",
//             body: formData,
//           }
//         );

//         const data = await response.json();

//         if (data.success) {
//           toast.dismiss(loadingToast);
//           toast.success("Banner uploaded successfully");
//           setBlog({ ...blog, banner: data.image_url });
//           setBannerImage(data.image_url);
//         } else {
//           throw new Error(data.message || "Upload failed");
//         }
//       } catch (error) {
//         toast.dismiss(loadingToast);
//         toast.error(`Upload failed: ${error.message}`);
//       }
//     }
//   };

//   const handleTitleKeyDown = (e) => {
//     if (e.keyCode === 13) {
//       e.preventDefault();
//     }
//   };

//   const handleTitleChange = (e) => {
//     // console.log(e.target.scrollHeight)
//     const input = e.target;
//     // console.log(input);
//     input.style.height = "auto";
//     // managing the scroll height.
//     // console.log(input.scrollHeight);
//     input.style.height = `${input.scrollHeight}px`;
//     // console.log(input.value);.

//     setBlog({ ...blog, title: input.value });
//   };

//   const handlePublishEvent = (e) => {
//     if (!bannerImage.length) {
//       return toast.error("Upload a blog banner to publish it");
//     }
//     console.log(e);
//     if (!title.length) {
//       return toast.error("Write blog title to publish");
//     }

//     if (textEditor.isReady) {
//       textEditor
//         .save()
//         .then((data) => {
//           console.log(data);
//           if (data.blocks.length) {
//             setBlog({ ...blog, content: data });
//             setEditorState("publish");
//           } else {
//             return toast.error("Write something in your blog to publish it");
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//   };

//   const handleSaveDraft = (e) => {
//     if (e.target.className.includes("disable")) {
//       return;
//     }

//     if (!title.length) {
//       return toast.error("Write blog title before saving it as a draft");
//     }
//     const loadingToast = toast.loading("Saving Draft...");

//     e.target.classList.add("disable");

//     if (textEditor.isReady) {
//       textEditor.save().then((content) => {
//         const blogObj = {
//           title,
//           banner,
//           des,
//           content,
//           tags,
//           draft: true,
//         };

//         // console.log(blogObj);
//         // console.log("Sending blog data:", blogObj);
//         axios
//           .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
//             headers: {
//               Authorization: `Bearer ${access_token}`,
//             },
//           })
//           .then(() => {
//             e.target.classList.add("disable");
//             toast.dismiss(loadingToast);
//             toast.success("Saved to Draft");

//             setTimeout(() => {
//               navigate("/");
//             }, 500);
//           })
//           .catch(({ response }) => {
//             e.target.classList.add("disable");
//             toast.dismiss(loadingToast);

//             return toast.error("Error saving", response.data.error);
//           });
//       });
//     }
//   };

//   const handleBannerUrlSubmit = (url) => {
//     setBannerImage(url);
//     setBlog((prevBlog) => ({ ...prevBlog, banner: url }));
//   };

//   return (
//     <>
//       <nav className="navbar">
//         <Toaster />
//         {/* Logo */}
//         <Link to="/">
//           <img src={logo} className="flex-none w-11" />
//         </Link>
//         {/* title */}
//         <p className="max-md:hidden text-black line-clamp-1 w-full">
//           {title.length ? title : "New Blog"}
//         </p>
//         {/* Buttons */}
//         <div className="flex gap-4 ml-auto">
//           <button className="btn-dark py-2" onClick={handlePublishEvent}>
//             Publish
//           </button>
//           <button className="btn-light py-2 " onClick={handleSaveDraft}>
//             Save Draft
//           </button>
//         </div>
//       </nav>
//       <AnimationWrapper>
//         <section>
//           <div className="mx-auto max-w-[900px] w-full ">
//             <div className="mb-6 flex justify-center items-center">
//               <div
//                 className="relative w-[600px] h-[400px] bg-black border-2 rounded-md drop-shadow-lg border-dark-grey"
//                 onClick={() => setIsModalOpen(true)}
//               >
//                 <img src={bannerImage} className="z-20 hover:opacity-70 cursor-pointer" />

//                 {blog.banner && (
//                   <div
//                     className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center
//                   opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
//                     onClick={() => setIsModalOpen(true)}
//                   >
//                     <span className="text-white font-semibold text-xl">
//                       Change Banner
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Title Editor */}
//             <textarea
//               defaultValue={title}
//               placeholder="Blog Title"
//               className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
//               onKeyDown={handleTitleKeyDown}
//               onChange={handleTitleChange}
//             ></textarea>

//             <hr className="w-full opacity-5 my-5" />

//             {/* Text Editor */}

//             <div id="textEditor" className="font-gelasio"></div>
//           </div>
//         </section>
//       </AnimationWrapper>

//       <Modal
//         show={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onLocalUpload={() => document.getElementById("uploadBanner").click()}
//         onUrlSubmit={handleBannerUrlSubmit}
//       />
//       <input
//         type="file"
//         id="uploadBanner"
//         accept=".png, .jpg, .jpeg"
//         hidden
//         onChange={handleBannerUpload}
//       />
//     </>
//   );
// };

// export default BlogEditor;

import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

import logo from "../imgs/logo.png";
import defaultBanner from "../imgs/blog banner.png";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/editor.pages";
import { UserContext } from "../App";
import { tools } from "./tools.component";
import Modal from "../Modal/Modal";

const BlogEditor = () => {
  const navigate = useNavigate();
  const { blog, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);
  const { userAuth: { access_token } } = useContext(UserContext);

  const [bannerImage, setBannerImage] = useState(blog.banner || defaultBanner);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: blog.content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, [setTextEditor, blog.content, textEditor.isReady]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const loadingToast = toast.loading("Uploading banner...");
      const formData = new FormData();
      formData.append("banner", file);

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/upload`, {
          method: "POST",
          body: formData,
        });

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

  const handleBannerUrlSubmit = (url) => {
    setBannerImage(url);
    setBlog(prevBlog => ({ ...prevBlog, banner: url }));
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
    setBlog(prevBlog => ({ ...prevBlog, title: input.value }));
  };

  const handlePublishEvent = () => {
    if (!bannerImage || bannerImage === defaultBanner) {
      return toast.error("Upload a blog banner to publish it");
    }
    if (!blog.title.length) {
      return toast.error("Write blog title to publish");
    }

    if (textEditor.isReady) {
      textEditor.save().then((data) => {
        if (data.blocks.length) {
          setBlog(prevBlog => ({ ...prevBlog, content: data }));
          setEditorState("publish");
        } else {
          return toast.error("Write something in your blog to publish it");
        }
      }).catch((error) => {
        console.error(error);
        toast.error("An error occurred while saving the blog");
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!blog.title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }
    const loadingToast = toast.loading("Saving Draft...");

    try {
      const content = await textEditor.save();
      const blogObj = {
        title: blog.title,
        banner: bannerImage,
        des: blog.des,
        content,
        tags: blog.tags,
        draft: true,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
        blogObj,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      toast.dismiss(loadingToast);
      toast.success("Saved to Draft");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Error saving: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = defaultBanner;
    toast.error("Failed to load image. Using default banner.");
  };

  return (
    <>
      <nav className="navbar">
        <Toaster />
        <Link to="/">
          <img src={logo} className="flex-none w-11" alt="Logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {blog.title.length ? blog.title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>

        
      </nav>
      <AnimationWrapper>
        <section className="w-full max-w-[900px] mx-auto py-8 px-4">
          <div className="mb-6 flex justify-center items-center">
            <div 
              className="relative w-[600px] h-[400px] bg-white border-4 border-dark-grey hover:opacity-80 hover:bg-opacity-30 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <img 
                src={bannerImage} 
                className="w-full h-full object-cover" 
                alt="Banner"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold">Change Banner</span>
              </div>
            </div>
          </div>

          <textarea
            placeholder="Blog Title"
            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
            onKeyDown={handleTitleKeyDown}
            onChange={handleTitleChange}
            value={blog.title}
          ></textarea>

          <hr className="w-full opacity-10 my-5" />

          <div id="textEditor" className="font-gelasio"></div>
        </section>
      </AnimationWrapper>
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocalUpload={() => document.getElementById("uploadBanner").click()}
        onUrlSubmit={handleBannerUrlSubmit}
      />
      <input
        type="file"
        id="uploadBanner"
        accept=".png, .jpg, .jpeg"
        hidden
        onChange={handleBannerUpload}
      />
    </>
  );
};

export default BlogEditor;
import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect } from "react";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { toast, Toaster } from "react-hot-toast";

import { tools } from "./tools.component";
import { buildTransform } from "framer-motion";

// Blog Editor Component
const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, author, des, tags },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  // console.log(title);

  // useEffect fot text Editor
  useEffect(() => {
    setTextEditor(
      new EditorJS({
        holder: "textEditor",
        data: "",
        tools: tools,
        placeholder: "Let's write an awesome story",
      })
    );
  }, []);

  const handleBannerUpload = (e) => {
    const img = e.target.files[0];
    // console.log(img);
    // if (img) {
    //   const loadingTest = toast.loading("Uploading...");
    //   uploadImage(img).then(url => {
    //     if (url) {
    //       toast.dismiss(loadingTest);
    //       toast.success("Uploaded");
    //       blog.banner
    //     }
    //   })
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
    // if (!banner.length) {
    //   return toast.error("Upload a blog banner to publish it")
    // }
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
          <button className="btn-light py-2 ">Save Draft</button>
        </div>
      </nav>
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-4 border-dark-grey hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img src={defaultBanner} className="z-20" />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            {/* Title Editor */}
            <textarea
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

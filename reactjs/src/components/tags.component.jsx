import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tags = ({ tag, tagIndex }) => {
  let {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditorContext);

  const handleDelete = () => {
    tags = tags.filter((t) => t != tag);
    setBlog({ ...blog, tags });
  };

  const handleTagEdit = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.prevenDefault();

      const currentTag = e.target.innerText;

      tags[tagIndex] = currentTag;

      setBlog({ ...blog, tags });
      console.log(tags);
    }
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p
        className="outline-none"
        contentEditable={true}
        onKeyDown={handleTagEdit}
      >
        {tag}
      </p>
      <button
        className="mt-[1px] text-dark-grey rounded-full absolute right-4 top-1/2 -translate-y-1/2"
        onClick={handleDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tags;

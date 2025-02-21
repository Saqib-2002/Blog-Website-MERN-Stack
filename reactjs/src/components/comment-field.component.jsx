import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({ action }) => {
  const {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { commentsArr},
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const [comment, setComment] = useState("");
  const {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);
  const handleComment = () => {
    if (!access_token) {
      return toast.error("login first to leave a comment");
    }

    if (!comment.length) {
      return toast.error("Write something to leave a comment");
    }
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        // console.log(data);
        setComment("");
        data.comment_by = {
          personal_info: { username, profile_img, fullname },
        };
        let newCommentArray;
        data.childrenLevel = 0;
        newCommentArray = [data, ...commentsArr];
        let parentCommentIncrementVal = 1;
        setBlog({
          ...blog,
          comments: {
            ...comments,
            results: { newCommentArray },
            activity: {
              ...activity,
              total_comments: total_comments + 1,
              total_parent_comments:
                total_parent_comments + parentCommentIncrementVal,
            },
          },
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};
export default CommentField;

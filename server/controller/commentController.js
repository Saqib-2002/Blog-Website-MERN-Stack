import Blog from "../Schema/Blog.js";
import Comment from "../Schema/Comment.js";
import Notification from "../Schema/Notification.js";

const addComment = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id, comment, blog_author } = req.body;

    if (!comment.length) {
      return res
        .status(403)
        .json({ error: "Write something to leave a comment" });
    }

    // Creating a new comment document
    let commentObj = new Comment({
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id,
    });

    const commentFile = await commentObj.save();

    if (!commentFile) {
      return res.status(500).json({ error: "Failed to save comment" });
    }

    const {
      comment: savedComment,
      commentedAt,
      children,
      commented_by,
    } = commentFile;

    // Updating blog with new comment
    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": 1,
        },
      }
    );

    console.log("New comment created");

    // Creating a notification
    const notificationObj = {
      type: "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    await new Notification(notificationObj).save();
    console.log("New notification added");

    return res.status(200).json({
      comment: savedComment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
      commented_by,
    });
  } catch (err) {
    console.error("Error in addComment:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBlogComment = async (req, res) => {
  try {
    const { blog_id, skip = 0 } = req.body;
    const maxLimit = 5;

    if (!blog_id) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    const comments = await Comment.find({ blog_id, isReply: false })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(Number(skip)) // Ensure skip is a number
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    console.error("Error in getBlogComment:", err);
    return res.status(500).json({ error: err.message });
  }
};
export { addComment, getBlogComment };

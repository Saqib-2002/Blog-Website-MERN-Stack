import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";

const likeBlog = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id, isLikedByUser } = req.body;

    const incrementVal = !isLikedByUser ? 1 : -1;

    // Find and update the blog's like count
    const blog = await Blog.findOneAndUpdate(
      { _id },
      { $inc: { "activity.total_likes": incrementVal } },
      { new: true } // Ensure we get the updated document
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    if (!isLikedByUser) {
      // User is liking the blog → Create notification
      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      await like.save();
      return res.status(200).json({ liked_by_user: true });
    } else {
      // User is unliking the blog → Remove notification
      await Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like",
      });
      return res.status(200).json({ liked_by_user: false });
    }
  } catch (err) {
    console.error("Error in likeBlog:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const isLikedByUser = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id } = req.body;

    // Check if a like notification exists
    const exists = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id,
    });

    return res.status(200).json({ liked_by_user: !!exists }); // Convert to boolean
  } catch (err) {
    console.error("Error in isLikedByUser:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export { likeBlog, isLikedByUser };

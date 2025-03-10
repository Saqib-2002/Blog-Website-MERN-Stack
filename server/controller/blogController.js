import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import { nanoid } from "nanoid";

// Create Blog Route
const createBlog = async (req, res) => {
  try {
    console.log("Received blog data:", req.body);
    const authorId = req.user;

    if (!authorId) {
      return res.status(401).json({ error: "Unauthorized: No user found" });
    }

    let { title, des, banner, tags, content, draft, id } = req.body;
    console.log("Tags:", tags);

    if (!title?.trim()) {
      return res
        .status(403)
        .json({ error: "Title is required to publish the blog" });
    }

    if (!draft) {
      if (!title || !des || !banner || !tags || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (!des.trim() || des.length > 200) {
        return res
          .status(403)
          .json({ error: "Description must be under 200 characters" });
      }
      if (!banner.trim()) {
        return res.status(403).json({ error: "Blog banner is required" });
      }
      if (!content?.blocks?.length) {
        return res.status(403).json({ error: "Blog content cannot be empty" });
      }
      if (!tags.length || tags.length > 10) {
        return res.status(403).json({ error: "Provide up to 10 tags" });
      }
    }

    tags = tags.map((tag) => tag.toLowerCase());

    const blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() + nanoid();

    console.log("Blog ID:", blog_id);

    if (id) {
      // Updating an existing blog
      await Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, tags, draft: Boolean(draft) }
      );
      return res.status(200).json({ id: blog_id });
    } else {
      // Creating a new blog
      const blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
      });

      await blog.save();

      if (!draft) {
        await User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": 1 },
            $push: { blogs: blog._id },
          }
        );
      }

      return res.status(200).json({ id: blog.blog_id });
    }
  } catch (err) {
    console.error("Error in createBlog:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const latestBlog = async (req, res) => {
  try {
    let { page } = req.body;

    // Ensure page is a valid number and defaults to 1
    page = Number(page) || 1;
    if (page < 1) page = 1;

    const maxLimit = 5;

    // Fetch total blog count for pagination
    const totalBlogs = await Blog.countDocuments({ draft: false });

    // Fetch latest blogs
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .limit(maxLimit)
      .skip((page - 1) * maxLimit);

    return res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / maxLimit),
      currentPage: page,
      blogs,
    });
  } catch (err) {
    console.error("Error fetching latest blogs:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
};

const getBlog = async (req, res) => {
  try {
    const { blog_id, draft, mode } = req.body;
    const incrementVal = mode !== "edit" ? 1 : 0;

    // Find the blog first
    const blog = await Blog.findOne({ blog_id })
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select(
        "title des content banner activity publishedAt blog_id tags draft"
      );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Prevent accessing draft blogs
    if (blog.draft && !draft) {
      return res.status(403).json({ error: "You cannot access a draft blog" });
    }

    // Increment total reads if not in edit mode
    if (incrementVal) {
      await Blog.updateOne(
        { blog_id },
        { $inc: { "activity.total_reads": 1 } }
      );

      await User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": 1 } }
      );
    }

    return res.status(200).json({ blog });
  } catch (err) {
    console.error("Error in getBlogs:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// filter Pagination data
const allLatestBlogCount = async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    return res.status(200).json({ totalDocs: count });
  } catch (err) {
    console.error("Error counting documents:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const trendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1,
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    return res.status(200).json({ blogs });
  } catch (err) {
    console.error("Error fetching trending blogs:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Filtering Blog Data
const searchBlogs = async (req, res) => {
  try {
    const {
      tag,
      page = 1,
      query,
      author,
      limit = 2,
      eliminate_blog,
    } = req.body;

    let findQuery = { draft: false };

    if (tag) {
      findQuery.tags = tag;
    }
    if (query) {
      findQuery.title = new RegExp(query, "i");
    }
    if (author) {
      findQuery.author = author;
    }
    if (eliminate_blog) {
      findQuery.blog_id = { $ne: eliminate_blog };
    }

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({ blogs });
  } catch (err) {
    console.error("Error in searchBlogs:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchBlogsCount = async (req, res) => {
  try {
    const { tag, query, author } = req.body;

    let findQuery = { draft: false };

    if (tag) findQuery.tags = tag;
    if (query) findQuery.title = new RegExp(query, "i");
    if (author) findQuery.author = author;

    const totalDocs = await Blog.countDocuments(findQuery);

    return res.status(200).json({ totalDocs });
  } catch (err) {
    console.error("Error in searchBlogsCount:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  latestBlog,
  allLatestBlogCount,
  trendingBlogs,
  searchBlogs,
  searchBlogsCount,
  createBlog,
  getBlog,
};

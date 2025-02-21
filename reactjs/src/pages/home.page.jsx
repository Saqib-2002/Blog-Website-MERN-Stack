import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
<<<<<<< HEAD
=======
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  // console.log(blogs);

  const [trendingBlogs, setTrendingBlogs] = useState(null);
  // console.log(trendingBlogs ? "true" : "false")
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming",
    "hollywood",
    "artificial intelligence",
    "social media",
    "tech",
    "fight",
    "finance",
    "travel",
  ];

  // Fetching latest blogs from the server
<<<<<<< HEAD
  const fetchLatestBlogs = (page = 1) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(({ data }) => {
        // let formatedData =
        console.log(data);

        setBlogs(data.blogs);
=======
  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        console.log(data);

        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });

        console.log(formatedData);
        setBlogs(formatedData);
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Fetching trending blogs from the server
  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        // console.log(data.blogs);
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCatogry = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

<<<<<<< HEAD
  const fetchBlogsByCategory = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
      })
      .then(({ data }) => {
=======
  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
        // console.log(pageState);
        setBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // console.log(blogs);

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState == "home") {
<<<<<<< HEAD
      fetchLatestBlogs();
    } else {
      fetchBlogsByCategory();
=======
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
    }
    if (!trendingBlogs) fetchTrendingBlogs();
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest Blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
<<<<<<< HEAD
              ) : blogs.length ? (
                blogs.map((blog, i) => {
=======
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
<<<<<<< HEAD
=======
              <LoadMoreDataBtn state={blogs} fetchDataFunc={fetchLatestBlogs} />
>>>>>>> 1a95937f8550051d24fcc941a6513d887a7943bc
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.length ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="No trending blogs" />
            )}
          </InPageNavigation>
        </div>
        {/* Filters and trending blogs */}
        <div className="min-w-[40%] lg:min-2[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      key={i}
                      className={`tag ${
                        pageState == category ? "bg-black text-white" : " "
                      }`}
                      onClick={loadBlogByCatogry}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>

              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;

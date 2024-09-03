import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
const HomePage = () => {
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest Blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <div>
              <h1>Latest Blogs</h1>
              <h1>Trending Blogs</h1>
            </div>
            <div>
              gekkgd
            </div>
          </InPageNavigation>
        </div>
        {/* Filters and trending blogs */}
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;

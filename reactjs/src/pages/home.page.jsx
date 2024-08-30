import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component"
const HomePage = () => {
  return (
      <AnimationWrapper>
          <section className="h-cover flex justify-center gap-10">
              {/* Latest Blogs */}
              <div className="w-full">
                  <InPageNavigation></InPageNavigation>
              </div>
              {/* Filters and trending blogs */}
          </section>
    </AnimationWrapper>
  )
}

export default HomePage
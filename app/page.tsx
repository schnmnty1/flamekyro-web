import { Hero } from "@/components/hero";
import { SocialCarousel } from "@/components/social";
import { StatsSection } from "@/components/stats";
import { LatestVideos } from "@/components/videos";

/**
 * Landing composition — Hero → Connect → Videos → Stats.
 * Section pull-up margins keep the first viewport one connected composition.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="-mt-[30px]">
        <SocialCarousel />
      </div>
      <div className="-mt-[25px]">
        <LatestVideos />
      </div>
      <StatsSection />
    </div>
  );
}

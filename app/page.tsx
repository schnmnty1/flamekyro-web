import { Hero } from "@/components/hero";
import { SocialCarousel } from "@/components/social";
import { LatestVideos } from "@/components/videos";

/**
 * Landing composition — Hero, Social Carousel, Latest Videos.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SocialCarousel />
      <LatestVideos />
    </div>
  );
}

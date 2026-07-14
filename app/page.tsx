import { AboutSection } from "@/components/about";
import { Hero } from "@/components/hero";
import { SocialCarousel } from "@/components/social";
import { StatsSection } from "@/components/stats";
import { LatestVideos } from "@/components/videos";

/**
 * Landing composition — Hero, Social, Videos, About, Stats.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SocialCarousel />
      <LatestVideos />
      <AboutSection />
      <StatsSection />
    </div>
  );
}

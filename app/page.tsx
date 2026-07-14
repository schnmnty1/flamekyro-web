import { Hero } from "@/components/hero";
import { SocialCarousel } from "@/components/social";

/**
 * Landing composition — Hero + Social Carousel as one vertical rhythm.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SocialCarousel />
    </div>
  );
}

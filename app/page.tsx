import { BusinessContact } from "@/components/contact";
import { ConnectStage } from "@/components/connect";
import { Hero } from "@/components/hero";
import { StatsSection } from "@/components/stats";
import { LatestVideos } from "@/components/videos";
import { VisitorCounter } from "@/components/visitors";

/**
 * Landing composition — Hero → Connect → Videos → Stats → Contact → Visitors.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      {/* Mobile: pull carousel into the Hero band for above-the-fold fit */}
      <div className="-mt-11 md:-mt-[30px]">
        <ConnectStage />
      </div>
      <div className="-mt-[10px] sm:-mt-[12px]">
        <LatestVideos />
      </div>
      <StatsSection />
      <BusinessContact />
      <VisitorCounter />
    </div>
  );
}

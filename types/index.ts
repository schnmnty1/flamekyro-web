import type { ReactNode } from "react";

export type { SocialIconId, SocialPlatform } from "./social";

/** Shared layout contract for page shells */
export type PageLayoutProps = {
  children: ReactNode;
  className?: string;
};

/** Generic children-only provider / wrapper */
export type WithChildren = {
  children: ReactNode;
};

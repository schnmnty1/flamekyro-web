/** Social platform identity for the 3D carousel */

export type SocialIconId =
  | "twitch"
  | "kick"
  | "youtube"
  | "discord"
  | "instagram"
  | "tiktok"
  | "x";

export type SocialPlatform = {
  id: string;
  name: string;
  handle: string;
  url: string;
  description: string;
  /** Accent hex used for active glow / pagination */
  accent: string;
  icon: SocialIconId;
};

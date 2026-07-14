import type { ReactElement, SVGProps } from "react";
import type { SocialIconId } from "@/types/social";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = (props: IconProps) => ReactElement;

function TwitchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.3 2 2 5.1v14.2h4.6V22l2.3-2.7h3.7L20.6 12V2H4.3Zm14.8 9.1-3.4 3.4h-3.4l-2.3 2.7v-2.7H6.3V3.7h12.8v7.4Z" />
      <path d="M14.6 6.6h1.7v5.1h-1.7V6.6Zm-4.6 0h1.7v5.1H10V6.6Z" />
    </svg>
  );
}

function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

function DiscordIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.3 4.4A19.2 19.2 0 0 0 15.9 3l-.2.5a17.5 17.5 0 0 1 4 1.9 16.4 16.4 0 0 0-7.7-2.3h-.1A16.4 16.4 0 0 0 4.3 5.4a17.2 17.2 0 0 1 3.9-1.9L8 3A19.3 19.3 0 0 0 3.7 4.4C1.2 8.4.5 12.2.7 16a16.8 16.8 0 0 0 5.1 2.6l1-.9a11 11 0 0 1-1.5-.7l.4-.3a12.2 12.2 0 0 0 10.6 0l.4.3c-.5.3-1 .5-1.5.7l1 .9A16.7 16.7 0 0 0 23.3 16c.3-4.4-.7-8.1-3-11.6ZM8.4 13.9c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.9.9 1.8 2-.8 2-1.8 2Zm7.2 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Z" />
      <path d="M17.5 6.2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
      <path d="M12 2.2c-2.7 0-3 .01-4.1.06-2.7.12-4 1.4-4.1 4.1C3.71 7.5 3.7 7.8 3.7 10.5s.01 3 .06 4.1c.12 2.7 1.4 4 4.1 4.1 1.1.05 1.4.06 4.1.06s3-.01 4.1-.06c2.7-.12 4-1.4 4.1-4.1.05-1.1.06-1.4.06-4.1s-.01-3-.06-4.1c-.12-2.7-1.4-4-4.1-4.1-1.1-.05-1.4-.06-4.1-.06Zm0 1.8c2.6 0 2.9.01 4 .06 1.9.09 2.8.98 2.9 2.9.05 1 .06 1.3.06 4s-.01 2.9-.06 4c-.09 1.9-.98 2.8-2.9 2.9-1 .05-1.3.06-4 .06s-2.9-.01-4-.06c-1.9-.09-2.8-.98-2.9-2.9C5.01 13.4 5 13.1 5 10.5s.01-2.9.06-4c.09-1.9.98-2.8 2.9-2.9 1.1-.05 1.4-.06 4.04-.06Z" />
    </svg>
  );
}

function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.6 7.3a6.4 6.4 0 0 1-3.7-1.2v7.2a5.7 5.7 0 1 1-4.9-5.6v2.9a2.8 2.8 0 1 0 2 2.7V2.2h2.9c.2 1.5 1.1 2.9 2.4 3.8a6.3 6.3 0 0 0 3.3 1v2.3Z" />
    </svg>
  );
}

function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.2 2.3h3.2l-7 8 8.2 11.1h-6.4l-5-6.6-5.7 6.6H2.3l7.5-8.6L1.8 2.3h6.6l4.5 6 5.3-6Zm-1.1 17.3h1.8L7 4.2H5.1l12 15.4Z" />
    </svg>
  );
}

const ICONS: Record<SocialIconId, IconComponent> = {
  twitch: TwitchIcon,
  youtube: YouTubeIcon,
  discord: DiscordIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  x: XIcon,
};

type SocialIconProps = IconProps & {
  id: SocialIconId;
};

export function SocialIcon({ id, className, ...props }: SocialIconProps) {
  const Icon = ICONS[id];
  return <Icon className={className} {...props} />;
}

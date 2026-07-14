export type AboutBadge = {
  id: string;
  label: string;
  values: readonly string[];
};

export type AboutProfile = {
  heading: string;
  subtitle: string;
  bio: string;
  badges: readonly AboutBadge[];
  setupHref: string;
};

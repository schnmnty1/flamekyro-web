/** Latest video entries for the landing grid */

export type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  /** Display duration e.g. "12:48" */
  duration: string;
  /** Formatted view count e.g. "128K" */
  views: string;
  /** Relative upload label e.g. "2 days ago" */
  uploadedAt: string;
  url: string;
};

export type VideosSource = "pending" | "live";

export type VideosSnapshot = {
  fetchedAt: string | null;
  source: VideosSource;
  videos: readonly VideoItem[];
};

/** Future YouTube / CMS adapter contract */
export type VideosAdapter = {
  fetchLatestVideos: () => Promise<VideosSnapshot>;
};

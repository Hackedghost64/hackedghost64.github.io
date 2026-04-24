export interface AnimeSearchResult {
  id: string;
  name: string;
  availableEpisodes?: Record<string, number>;
  image?: string;
  thumbnail?: string;
  genres?: string[];
  description?: string;
  status?: string;
  score?: number;
  season?: {
    quarter: string;
    year: number;
  };
}

export interface Episode {
  number: string;
  title?: string;
}

export interface StreamingLink {
  url: string;
  proxyUrl?: string;
  isHls: boolean;
  resolution?: string;
  provider?: string;
}

export type PlaybackMode = 'sub' | 'dub';

export interface WatchHistoryItem {
  animeId: string;
  name: string;
  image: string;
  episode: string;
  timestamp: number;
}

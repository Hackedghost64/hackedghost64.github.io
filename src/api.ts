import { AnimeSearchResult, Episode, StreamingLink, PlaybackMode } from './types';

export class AnimeAPI {
  private readonly baseUrl = 'https://obs-2r2g.vercel.app';

  async search(query: string): Promise<AnimeSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return (data || []).map((item: any) => ({
          ...item,
          name: item.name || 'Unknown Anime'
      }));
    } catch (error) {
      console.error('AnimeAPI Search Error:', error);
      return [];
    }
  }

  async getEpisodes(showId: string, mode: PlaybackMode): Promise<Episode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/episodes?showId=${encodeURIComponent(showId)}&mode=${mode}`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const data = await response.json();
      const episodes = Array.isArray(data) ? data : [];
      return episodes.map((val: any) => {
          if (typeof val === 'string') return { number: val };
          return val; // Already an object
      });
    } catch (error) {
      console.error('AnimeAPI Episodes Error:', error);
      return [];
    }
  }

  async getLinks(showId: string, episode: string, mode: PlaybackMode): Promise<StreamingLink[]> {
    try {
      const response = await fetch(`${this.baseUrl}/links?showId=${encodeURIComponent(showId)}&episode=${episode}&mode=${mode}`);
      if (!response.ok) throw new Error('Failed to fetch streaming links');
      const data = await response.json();
      return Array.isArray(data) ? data : data.links || [];
    } catch (error) {
      console.error('AnimeAPI Links Error:', error);
      return [];
    }
  }

  getProxyImageUrl(url: string): string {
    if (!url) return '';
    return `${this.baseUrl}/image-proxy?url=${encodeURIComponent(url)}`;
  }
}

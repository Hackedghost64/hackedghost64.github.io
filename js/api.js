class AnimeAPI {
  constructor() {
    this.baseUrl = 'https://obs-2r2g.vercel.app';
  }

  async search(query) {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return (data || []).map((item) => ({
          ...item,
          name: item.name || 'Unknown Anime'
      }));
    } catch (error) {
      console.error('AnimeAPI Search Error:', error);
      return [];
    }
  }

  async getEpisodes(showId, mode) {
    try {
      const response = await fetch(`${this.baseUrl}/episodes?showId=${encodeURIComponent(showId)}&mode=${mode}`);
      if (!response.ok) throw new Error('Failed to fetch episodes');
      const data = await response.json();
      const episodes = Array.isArray(data) ? data : [];
      return episodes.map((val) => {
          if (typeof val === 'string') return { number: val };
          return val;
      });
    } catch (error) {
      console.error('AnimeAPI Episodes Error:', error);
      return [];
    }
  }

  async getLinks(showId, episode, mode) {
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

  getProxyImageUrl(url) {
    if (!url) return '';
    return `${this.baseUrl}/image-proxy?url=${encodeURIComponent(url)}`;
  }
}

export default AnimeAPI;

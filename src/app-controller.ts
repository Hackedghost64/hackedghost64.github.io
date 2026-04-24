import { AnimeAPI } from './api';
import { UIController } from './ui';
import { PlayerManager } from './player';
import { AnimeSearchResult, Episode, PlaybackMode, WatchHistoryItem } from './types';

export class AppController {
  private currentMode: PlaybackMode = 'sub';
  private selectedAnime: AnimeSearchResult | null = null;
  private history: WatchHistoryItem[] = [];
  private favorites: AnimeSearchResult[] = [];
  private watchlist: AnimeSearchResult[] = [];

  constructor(
    private api: AnimeAPI,
    private ui: UIController,
    private player: PlayerManager
  ) {
      this.loadLocalData();
  }

  init() {
    this.setupEventListeners();
    this.fetchTrending();
  }

  private loadLocalData() {
      try {
          this.history = JSON.parse(localStorage.getItem('anime-history') || '[]');
          this.favorites = JSON.parse(localStorage.getItem('anime-favorites') || '[]');
          this.watchlist = JSON.parse(localStorage.getItem('anime-watchlist') || '[]');
      } catch (e) {
          console.error('Failed to load local data', e);
      }
  }

  private setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const modeBtn = document.getElementById('mode-toggle');
    const closePlayer = document.getElementById('close-player');
    const logoContainer = document.getElementById('logo-container');
    const heroPlay = document.getElementById('hero-play');

    // Sidebar Tabs
    const tabs = {
        'nav-home': () => this.fetchTrending(),
        'nav-discover': () => this.handleTabClick('nav-discover', 'action'),
        'nav-library': () => this.renderLocalList('nav-library', this.watchlist, 'Your watchlist is empty'),
        'nav-trending': () => this.handleTabClick('nav-trending', 'trending'),
        'nav-watching': () => this.renderLocalList('nav-watching', this.watchlist, 'Nothing in watchlist'),
        'nav-favorites': () => this.renderLocalList('nav-favorites', this.favorites, 'No favorites yet'),
        'nav-history': () => this.renderHistoryList()
    };

    Object.entries(tabs).forEach(([id, action]) => {
        document.getElementById(id)?.addEventListener('click', () => {
            this.ui.setActiveTab(id);
            action();
        });
    });

    let debounceTimer: any;
    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.handleSearch(query), 300);
    });

    modeBtn?.addEventListener('click', () => {
      this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
      this.ui.toggleMode(this.currentMode);
      
      // Reload current view
      const activeTab = document.querySelector('.nav-item.active');
      if (activeTab) {
          const id = activeTab.id;
          if (id === 'nav-home' || id === 'nav-trending') this.fetchTrending();
          else if (id === 'nav-discover') this.handleTabClick(id, 'action');
      }

      if (this.selectedAnime) {
          this.loadAnimeDetails(this.selectedAnime);
      }
    });

    closePlayer?.addEventListener('click', () => {
      this.ui.hidePlayer();
      this.player.clear();
    });

    logoContainer?.addEventListener('click', () => {
       this.ui.setActiveTab('nav-home');
       this.fetchTrending();
       window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    heroPlay?.addEventListener('click', () => {
        if (this.selectedAnime) {
            this.loadAnimeDetails(this.selectedAnime);
            this.ui.showPlayer(this.selectedAnime.name);
        }
    });
  }

  private async handleTabClick(tabId: string, query: string) {
      this.ui.setActiveTab(tabId);
      this.ui.setLoading(true);
      const results = await this.api.search(query);
      this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
  }

  private renderLocalList(tabId: string, list: AnimeSearchResult[], emptyMsg: string) {
      this.ui.setActiveTab(tabId);
      this.ui.renderResults(list, this.currentMode, (anime) => this.selectAnime(anime));
      if (list.length === 0) this.ui.renderEmpty(emptyMsg);
  }

  private renderHistoryList() {
      this.ui.setActiveTab('nav-history');
      const transformedList: AnimeSearchResult[] = this.history.map(h => ({
          id: h.animeId,
          name: `${h.name} - Ep ${h.episode}`,
          image: h.image,
          thumbnail: h.image
      }));
      this.ui.renderResults(transformedList, this.currentMode, (anime) => {
          const original = this.history.find(h => h.animeId === anime.id);
          if (original) this.selectAnime({ id: original.animeId, name: original.name, image: original.image, thumbnail: original.image });
      });
      if (this.history.length === 0) this.ui.renderEmpty('No history recorded');
  }

  private async handleSearch(query: string) {
    if (query.length < 2) {
      this.ui.renderMiniResults([], () => {});
      return;
    }

    // Show mini results quickly
    const results = await this.api.search(query);
    this.ui.renderMiniResults(results, (anime) => this.selectAnime(anime));
    
    // Also update the main grid if the user pressed enter or stayed here
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
  }

  private async fetchTrending() {
    this.ui.setLoading(true);
    const results = await this.api.search('trending');
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
    if (results.length > 0) {
        this.selectedAnime = results[0];
        this.ui.updateHero(results[0]);
    }
  }

  private async selectAnime(anime: AnimeSearchResult) {
    this.selectedAnime = anime;
    this.ui.updateHero(anime);
    await this.loadAnimeDetails(anime);
    this.ui.showPlayer(anime.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Add to library automatically for now as "Watching"
    if (!this.watchlist.find(a => a.id === anime.id)) {
        this.watchlist.unshift(anime);
        localStorage.setItem('anime-watchlist', JSON.stringify(this.watchlist.slice(0, 50)));
    }
  }

  private async loadAnimeDetails(anime: AnimeSearchResult) {
    const episodes = await this.api.getEpisodes(anime.id, this.currentMode);
    this.ui.renderEpisodes(episodes, (ep) => this.playEpisode(anime.id, ep));
    
    if (episodes.length > 0) {
        // Try to find if we were watching this episode
        const hist = this.history.find(h => h.animeId === anime.id);
        const startEp = hist ? episodes.find(e => e.number === hist.episode) || episodes[0] : episodes[0];
        this.playEpisode(anime.id, startEp);
    }
  }

  private async playEpisode(id: string, episode: Episode) {
    const links = await this.api.getLinks(id, episode.number, this.currentMode);
    if (links.length > 0) {
        const episodes = await this.api.getEpisodes(id, this.currentMode);
        const currentIndex = episodes.findIndex(e => e.number === episode.number);
        
        // Pre-fetch next episode link after 30 seconds of playback or immediately
        const prefetchNext = async () => {
            if (currentIndex < episodes.length - 1) {
                const nextEp = episodes[currentIndex + 1];
                console.log(`[Trace] Pre-fetching links for Ep ${nextEp.number}`);
                await this.api.getLinks(id, nextEp.number, this.currentMode);
            }
        };
        setTimeout(prefetchNext, 10000); 

        this.player.play({
            url: links[0].proxyUrl || links[0].url,
            isHls: links[0].isHls,
            allLinks: links, // New field for quality selection
            currentMode: this.currentMode,
            onModeSwitch: () => {
                this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
                this.ui.toggleMode(this.currentMode);
                this.playEpisode(id, episode);
            },
            onNext: currentIndex < episodes.length - 1 ? () => {
                this.playEpisode(id, episodes[currentIndex + 1]);
            } : undefined,
            onPrev: currentIndex > 0 ? () => {
                this.playEpisode(id, episodes[currentIndex - 1]);
            } : undefined
        });

        // Update history
        if (this.selectedAnime) {
            const histItem: WatchHistoryItem = {
                animeId: id,
                name: this.selectedAnime.name,
                image: this.selectedAnime.thumbnail || this.selectedAnime.image || '',
                episode: episode.number,
                timestamp: Date.now()
            };
            this.history = [histItem, ...this.history.filter(h => h.animeId !== id)].slice(0, 50);
            localStorage.setItem('anime-history', JSON.stringify(this.history));
        }
    }
  }
}

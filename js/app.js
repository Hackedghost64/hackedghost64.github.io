class AppController {
  constructor(api, ui, player) {
    this.api = api;
    this.ui = ui;
    this.player = player;
    this.currentMode = 'sub';
    this.selectedAnime = null;
    this.history = [];
    this.favorites = [];
    this.watchlist = [];
    this.loadLocalData();
  }

  init() {
    this.setupEventListeners();
    this.fetchHome();
    this.setupDataClearing();
  }

  loadLocalData() {
      try {
          this.history = JSON.parse(localStorage.getItem('anime-history') || '[]');
          this.favorites = JSON.parse(localStorage.getItem('anime-favorites') || '[]');
          this.watchlist = JSON.parse(localStorage.getItem('anime-watchlist') || '[]');
      } catch (e) {
          console.error('Failed to load local data', e);
      }
  }

  setupDataClearing() {
      const settingsNav = document.getElementById('nav-history');
      if (settingsNav) {
          const clearBtn = document.createElement('div');
          clearBtn.className = 'nav-item px-4 py-2 mt-4 text-red-400 hover:bg-red-500/10 border-red-500/20 text-xs font-bold uppercase tracking-tighter cursor-pointer';
          clearBtn.textContent = 'Clear All Data';
          clearBtn.onclick = () => {
              if (confirm('Are you sure you want to clear all history, favorites, and watchlist?')) {
                  localStorage.clear();
                  window.location.reload();
              }
          };
          settingsNav.parentElement.appendChild(clearBtn);
      }
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const modeBtn = document.getElementById('mode-toggle');
    const closePlayer = document.getElementById('close-player');
    const logoContainer = document.getElementById('logo-container');
    const heroPlay = document.getElementById('hero-play');
    const heroFavorite = document.getElementById('hero-favorite');

    heroFavorite?.addEventListener('click', () => {
        this.toggleFavorite(this.selectedAnime);
    });

    const tabs = {
        'nav-home': () => this.fetchHome(),
        'nav-discover': () => this.handleTabClick('nav-discover', 'action'),
        'nav-library': () => this.renderLocalList('nav-library', this.watchlist, 'Your watchlist is empty'),
        'nav-trending': () => this.handleTabClick('nav-trending', 'trending'),
        'nav-watching': () => this.renderLocalList('nav-watching', this.watchlist, 'Nothing in watchlist'),
        'nav-favorites': () => this.renderLocalList('nav-favorites', this.favorites, 'No favorites yet'),
        'nav-history': () => this.renderHistoryList(),
        'mobile-nav-home': () => this.fetchHome(),
        'mobile-nav-discover': () => this.handleTabClick('mobile-nav-discover', 'action'),
        'mobile-nav-library': () => this.renderLocalList('mobile-nav-library', this.watchlist, 'Your watchlist is empty'),
        'mobile-nav-history': () => this.renderHistoryList()
    };

    Object.entries(tabs).forEach(([id, action]) => {
        document.getElementById(id)?.addEventListener('click', () => {
            this.handleNavigation(id, action);
        });
    });

    let debounceTimer;
    searchInput?.addEventListener('input', (e) => {
      const query = e.target.value;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.handleSearch(query), 300);
    });

    modeBtn?.addEventListener('click', () => {
      this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
      this.ui.toggleMode(this.currentMode);
      if (this.selectedAnime) this.loadAnimeDetails(this.selectedAnime);
    });

    closePlayer?.addEventListener('click', () => {
      this.ui.hidePlayer();
      this.player.clear();
    });

    logoContainer?.addEventListener('click', () => {
       this.ui.setActiveTab('nav-home');
       this.fetchHome();
       window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    heroPlay?.addEventListener('click', () => {
        if (this.selectedAnime) {
            this.ui.showPlayer(this.selectedAnime.name);
            this.loadAnimeDetails(this.selectedAnime);
        }
    });
  }

  handleNavigation(id, action) {
    this.ui.setActiveTab(id);
    action();
  }

  async handleTabClick(tabId, query) {
      this.ui.setActiveTab(tabId);
      this.ui.setLoading(true);
      const results = await this.api.search(query);
      this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
  }

  renderLocalList(tabId, list, emptyMsg) {
      this.ui.setActiveTab(tabId);
      this.ui.renderResults(list, this.currentMode, (anime) => this.selectAnime(anime));
      if (list.length === 0) this.ui.renderEmpty(emptyMsg);
  }

  renderHistoryList() {
      this.ui.setActiveTab('nav-history');
      if (this.history.length === 0) {
          this.ui.renderEmpty('No history recorded');
          return;
      }
      const transformedList = this.history.map(h => ({
          id: h.animeId,
          name: h.name,
          image: h.image,
          thumbnail: h.image,
          lastEpisode: h.episode
      }));
      this.ui.renderResults(transformedList, this.currentMode, (anime) => {
          this.selectAnime({ id: anime.id, name: anime.name, image: anime.image, thumbnail: anime.image });
      });
  }

  async handleSearch(query) {
    if (query.length < 2) {
      this.ui.renderMiniResults([], () => {});
      return;
    }
    const results = await this.api.search(query);
    this.ui.renderMiniResults(results, (anime) => this.selectAnime(anime));
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
  }

  async fetchHome() {
    this.ui.setLoading(true);
    const results = await this.api.search('trending');
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
    if (results.length > 0) {
        this.selectedAnime = results[0];
        this.ui.updateHero(results[0]);
        this.ui.setFavoriteStatus(this.favorites.some(f => f.id === results[0].id));
    }
  }

  async selectAnime(anime) {
    this.selectedAnime = anime;
    this.ui.updateHero(anime);
    this.ui.setFavoriteStatus(this.favorites.some(f => f.id === anime.id));
    this.ui.showPlayer(anime.name);
    await this.loadAnimeDetails(anime);
    if (!this.watchlist.find(a => a.id === anime.id)) {
        this.watchlist = [anime, ...this.watchlist.slice(0, 49)];
        localStorage.setItem('anime-watchlist', JSON.stringify(this.watchlist));
    }
  }

  toggleFavorite(anime) {
      if (!anime) return;
      const index = this.favorites.findIndex(f => f.id === anime.id);
      if (index === -1) {
          this.favorites.push(anime);
      } else {
          this.favorites.splice(index, 1);
      }
      localStorage.setItem('anime-favorites', JSON.stringify(this.favorites));
      this.ui.setFavoriteStatus(index === -1);
  }

  async loadAnimeDetails(anime) {
    const episodes = await this.api.getEpisodes(anime.id, this.currentMode);
    this.ui.renderEpisodes(episodes, (ep) => this.playEpisode(anime.id, ep));
    if (episodes.length > 0) {
        const hist = this.history.find(h => h.animeId === anime.id);
        const startEp = hist ? episodes.find(e => e.number === hist.episode) || episodes[0] : episodes[0];
        this.playEpisode(anime.id, startEp);
    }
  }

  async playEpisode(id, episode) {
    const links = await this.api.getLinks(id, episode.number, this.currentMode);
    if (links.length > 0) {
        const episodes = await this.api.getEpisodes(id, this.currentMode);
        const currentIndex = episodes.findIndex(e => e.number === episode.number);
        
        this.player.play({
            animeId: id,
            episodeNumber: episode.number,
            url: links[0].proxyUrl || links[0].url,
            isHls: links[0].isHls,
            allLinks: links,
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

        if (this.selectedAnime) {
            const histItem = {
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
export default AppController;

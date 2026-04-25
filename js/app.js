class AppController {
  constructor(api, ui, player) {
    this.api = api;
    this.ui = ui;
    this.player = player;
    this.currentMode = localStorage.getItem('anime-mode') || 'sub';
    this.selectedAnime = null;
    this.history = JSON.parse(localStorage.getItem('anime-history') || '[]');
    this.favorites = JSON.parse(localStorage.getItem('anime-favorites') || '[]');
  }

  init() {
    this.setupEventListeners();
    this.fetchHome();
    this.updateModeUI();
  }

  updateModeUI() {
      if (this.ui.modeBtn) {
          this.ui.modeBtn.textContent = this.currentMode.toUpperCase();
      }
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const closePlayer = document.getElementById('close-player');
    const clearDataBtn = document.getElementById('clear-data-btn');

    // Adaptive Tab Binding
    if (this.ui.isMobile) {
        document.getElementById('mobile-nav-home').onclick = () => {
            this.ui.setActiveTab('mobile-nav-home');
            this.ui.showView('home-view');
            this.fetchHome();
        };
        document.getElementById('mobile-nav-discover').onclick = () => {
            this.ui.setActiveTab('mobile-nav-discover');
            this.ui.showView('home-view');
            this.handleSearch('action');
        };
        document.getElementById('mobile-nav-library').onclick = () => {
            this.ui.setActiveTab('mobile-nav-library');
            this.ui.showView('profile-view');
        };
        
        document.getElementById('btn-favorites')?.addEventListener('click', () => {
            this.ui.showView('home-view');
            this.renderList(this.favorites, 'No Favorites');
        });
        document.getElementById('btn-history')?.addEventListener('click', () => {
            this.ui.showView('home-view');
            this.renderList(this.history, 'No History');
        });
    } else {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = () => {
                const id = btn.id;
                this.ui.setActiveTab(id);
                if (id.includes('home')) this.fetchHome();
                else if (id.includes('discover')) this.handleSearch('action');
                else if (id.includes('library')) this.renderList(this.favorites, 'No Favorites');
                else if (id.includes('history')) this.renderList(this.history, 'No History');
            };
        });
    }

    if (clearDataBtn) {
        clearDataBtn.onclick = () => {
            if (confirm('Clear all your history and favorites?')) {
                localStorage.clear();
                window.location.reload();
            }
        };
    }

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            this.api.search(query).then(results => {
                this.ui.renderMiniResults(results, (anime) => this.selectAnime(anime));
            });
        }
    });

    this.ui.heroPlay.onclick = () => {
        if (this.selectedAnime) {
            this.ui.showPlayer(this.selectedAnime.name);
            this.loadAnimeDetails(this.selectedAnime);
        }
    };

    this.ui.heroFavorite.onclick = () => {
        if (!this.selectedAnime) return;
        const index = this.favorites.findIndex(f => f.id === this.selectedAnime.id);
        if (index === -1) this.favorites.push(this.selectedAnime);
        else this.favorites.splice(index, 1);
        localStorage.setItem('anime-favorites', JSON.stringify(this.favorites));
        this.updateFavoriteUI();
    };

    closePlayer.onclick = () => {
        this.ui.hidePlayer();
        this.player.clear();
        this.renderContinueWatching();
    };

    if (this.ui.modeBtn) {
        this.ui.modeBtn.onclick = () => {
            this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
            localStorage.setItem('anime-mode', this.currentMode);
            this.updateModeUI();
            this.fetchHome();
            if (this.selectedAnime) this.loadAnimeDetails(this.selectedAnime);
        };
    }
  }

  renderContinueWatching() {
      if (!this.ui.isMobile) return;
      const section = document.getElementById('continue-watching-section');
      if (this.history.length > 0) {
          section.classList.remove('hidden');
          this.ui.renderResults(this.history, this.currentMode, (anime) => this.selectAnime(anime), 'continue-grid');
      } else {
          section.classList.add('hidden');
      }
  }

  async fetchHome() {
    const results = await this.api.search('trending');
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
    if (results.length > 0 && !this.selectedAnime) {
        this.selectAnime(results[0], false);
    }
    this.renderContinueWatching();
  }

  async handleSearch(query) {
      const results = await this.api.search(query);
      this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
  }

  renderList(list, emptyMsg) {
      this.ui.renderResults(list, this.currentMode, (anime) => this.selectAnime(anime));
  }

  async selectAnime(anime, showPlayer = true) {
    this.selectedAnime = anime;
    this.ui.updateHero(anime);
    this.updateFavoriteUI();
    if (showPlayer) {
        this.ui.showPlayer(anime.name);
        await this.loadAnimeDetails(anime);
    }
  }

  updateFavoriteUI() {
      const isFav = this.favorites.some(f => f.id === this.selectedAnime?.id);
      this.ui.heroFavorite.classList.toggle('bg-accent', isFav);
      this.ui.heroFavorite.classList.toggle('text-white', isFav);
  }

  async loadAnimeDetails(anime) {
    const episodes = await this.api.getEpisodes(anime.id, this.currentMode);
    const hist = this.history.find(h => h.id === anime.id);
    const currentEpNumber = hist ? hist.episode : (episodes[0]?.number);
    
    this.ui.renderEpisodes(episodes, currentEpNumber, (ep) => this.playEpisode(anime.id, ep));
    
    if (episodes.length > 0) {
        const startEp = hist ? episodes.find(e => e.number === hist.episode) || episodes[0] : episodes[0];
        this.playEpisode(anime.id, startEp);
    }
  }

  async playEpisode(id, episode) {
    // Optimistic: Show loader instantly
    this.player.showLoadingState(`Fetching Episode ${episode.number}...`);
    
    const links = await this.api.getLinks(id, episode.number, this.currentMode);
    if (links.length > 0) {
        this.player.play({
            animeId: id,
            episodeNumber: episode.number,
            url: links[0].proxyUrl || links[0].url,
            isHls: links[0].isHls,
            allLinks: links,
            currentMode: this.currentMode,
            onModeSwitch: () => {
                this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
                localStorage.setItem('anime-mode', this.currentMode);
                this.updateModeUI();
                this.playEpisode(id, episode);
            }
        });

        // Add to history
        const histItem = { 
            id: id, 
            name: this.selectedAnime.name, 
            image: this.selectedAnime.thumbnail || this.selectedAnime.image,
            episode: episode.number 
        };
        this.history = [histItem, ...this.history.filter(h => h.id !== id)].slice(0, 20);
        localStorage.setItem('anime-history', JSON.stringify(this.history));
    }
  }
}
export default AppController;

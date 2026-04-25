class AppController {
  constructor(api, ui, player) {
    this.api = api;
    this.ui = ui;
    this.player = player;
    this.currentMode = 'sub';
    this.selectedAnime = null;
    this.history = JSON.parse(localStorage.getItem('anime-history') || '[]');
    this.favorites = JSON.parse(localStorage.getItem('anime-favorites') || '[]');
  }

  init() {
    this.setupEventListeners();
    this.fetchHome();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const closePlayer = document.getElementById('close-player');

    // Adaptive Tab Binding
    const tabSelectors = this.ui.isMobile ? '.nav-btn' : '.nav-item';
    document.querySelectorAll(tabSelectors).forEach(btn => {
        btn.onclick = () => {
            const id = btn.id;
            this.ui.setActiveTab(id);
            if (id.includes('home')) this.fetchHome();
            else if (id.includes('discover')) this.handleSearch('action');
            else if (id.includes('library')) this.renderList(this.favorites, 'No Favorites');
            else if (id.includes('history')) this.renderList(this.history, 'No History');
        };
    });

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
    };

    if (this.ui.modeBtn) {
        this.ui.modeBtn.onclick = () => {
            this.currentMode = this.currentMode === 'sub' ? 'dub' : 'sub';
            this.ui.modeBtn.textContent = this.currentMode.toUpperCase();
            this.fetchHome();
        };
    }
  }

  async fetchHome() {
    const results = await this.api.search('trending');
    this.ui.renderResults(results, this.currentMode, (anime) => this.selectAnime(anime));
    if (results.length > 0 && !this.selectedAnime) {
        this.selectAnime(results[0], false);
    }
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
    this.ui.renderEpisodes(episodes, (ep) => this.playEpisode(anime.id, ep));
    if (episodes.length > 0) this.playEpisode(anime.id, episodes[0]);
  }

  async playEpisode(id, episode) {
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
                this.playEpisode(id, episode);
            }
        });

        // Add to history
        const histItem = { id: id, name: this.selectedAnime.name, image: this.selectedAnime.image };
        this.history = [histItem, ...this.history.filter(h => h.id !== id)].slice(0, 20);
        localStorage.setItem('anime-history', JSON.stringify(this.history));
    }
  }
}
export default AppController;

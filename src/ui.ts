import { AnimeSearchResult, Episode } from './types';

export class UIController {
  private grid: HTMLElement;
  private miniSearch: HTMLElement;
  private playerOverlay: HTMLElement;
  private episodesList: HTMLElement;
  private episodesCount: HTMLElement;
  private playerTitle: HTMLElement;
  private searchInput: HTMLInputElement;
  private modeBtn: HTMLElement;
  private heroImg: HTMLImageElement;
  private heroTitle: HTMLElement;
  private heroGenres: HTMLElement;
  private heroDescription: HTMLElement;

  constructor(private getProxyUrl: (url: string) => string) {
    this.grid = document.getElementById('content-grid')!;
    this.miniSearch = document.getElementById('search-results-mini')!;
    this.playerOverlay = document.getElementById('player-overlay')!;
    this.episodesList = document.getElementById('episodes-list')!;
    this.episodesCount = document.getElementById('current-ep-count')!;
    this.playerTitle = document.getElementById('player-title')!;
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.modeBtn = document.getElementById('mode-toggle')!;
    this.heroImg = document.getElementById('hero-img') as HTMLImageElement;
    this.heroTitle = document.getElementById('hero-title')!;
    this.heroGenres = document.getElementById('hero-genres')!;
    this.heroDescription = document.getElementById('hero-description')!;
  }

  setLoading(isLoading: boolean) {
    if (isLoading) {
      this.grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-32 space-y-4">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
          <p class="text-xs font-bold text-text-dim uppercase tracking-[0.2em]">Synchronizing Data...</p>
        </div>
      `;
    }
  }

  renderEmpty(message: string = "Nothing found here yet") {
      this.grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-32 opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <p class="text-sm font-bold uppercase tracking-widest">${message}</p>
        </div>
      `;
  }

  renderResults(results: AnimeSearchResult[], mode: 'sub' | 'dub', onSelect: (anime: AnimeSearchResult) => void) {
    this.grid.innerHTML = '';
    if (results.length === 0) {
        this.renderEmpty();
        return;
    }
    
    results.forEach((anime, index) => {
      const card = document.createElement('div');
      card.className = 'anime-card group cursor-pointer fade-in transition-all';
      card.style.animationDelay = `${index * 50}ms`;
      
      const rawThumb = anime.thumbnail || anime.image;
      const placeholderUrl = `https://placehold.co/400x600/18181b/ffffff?text=${encodeURIComponent(anime.name)}`;
      const imageUrl = rawThumb ? this.getProxyUrl(rawThumb) : placeholderUrl;
      
      const eps = anime.availableEpisodes ? (anime.availableEpisodes[mode] || 0) : 0;

      card.innerHTML = `
        <div class="aspect-[2/3] relative overflow-hidden bg-surface rounded-2xl shadow-lg group-hover:shadow-accent/20 group-hover:shadow-2xl transition-all duration-500">
          <img src="${imageUrl}" alt="${anime.name}" 
               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
               loading="lazy" 
               onerror="this.src='${placeholderUrl}'; this.onerror=null;" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="absolute bottom-3 left-3 flex gap-2">
             <span class="bg-accent text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">${eps} ${mode.toUpperCase()}</span>
          </div>
        </div>
        <div class="py-4">
          <h4 class="font-bold text-sm truncate group-hover:text-accent transition-colors mb-1">${anime.name}</h4>
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-text-dim font-bold uppercase tracking-tight">${anime.genres?.[0] || 'Anime'}</span>
            <span class="text-[10px] text-white/20">•</span>
            <span class="text-[10px] text-text-dim font-bold uppercase tracking-tight">Studio Series</span>
          </div>
        </div>
      `;

      card.onclick = () => onSelect(anime);
      this.grid.appendChild(card);
    });
  }

  setActiveTab(tabId: string) {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
          if (item.id === tabId) {
              item.classList.add('active');
          } else {
              item.classList.remove('active');
          }
      });
  }

  renderMiniResults(results: AnimeSearchResult[], onSelect: (anime: AnimeSearchResult) => void) {
    if (results.length === 0) {
      this.miniSearch.classList.add('hidden');
      return;
    }

    this.miniSearch.innerHTML = '';
    this.miniSearch.classList.remove('hidden');

    results.slice(0, 8).forEach(anime => {
      const item = document.createElement('div');
      item.className = 'flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-border last:border-0';
      const rawThumb = anime.thumbnail || anime.image;
      const thumbUrl = rawThumb ? this.getProxyUrl(rawThumb) : `https://placehold.co/100x150/18181b/ffffff?text=Anime`;
      const eps = anime.availableEpisodes ? (Object.values(anime.availableEpisodes)[0] || 0) : 0;
      
      item.innerHTML = `
        <img src="${thumbUrl}" class="w-10 h-14 object-cover rounded-lg shadow-sm" />
        <div class="flex-1 overflow-hidden">
          <h5 class="text-sm font-bold truncate mb-0.5">${anime.name}</h5>
          <span class="text-[10px] text-text-dim font-bold uppercase tracking-wider">${eps} Episodes</span>
        </div>
      `;
      item.onclick = () => {
        onSelect(anime);
        this.miniSearch.classList.add('hidden');
        this.searchInput.value = '';
      };
      this.miniSearch.appendChild(item);
    });
  }

  renderEpisodes(episodes: Episode[], onSelect: (ep: Episode) => void) {
    this.episodesList.innerHTML = '';
    this.episodesCount.textContent = `${episodes.length} ITEMS`;

    episodes.forEach((ep, index) => {
      const btn = document.createElement('button');
      btn.className = 'w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-all text-left group fade-in';
      btn.style.animationDelay = `${index * 30}ms`;
      btn.innerHTML = `
        <div class="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold group-hover:text-accent transition-colors">
          ${ep.number}
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="text-[13px] font-bold truncate tracking-tight text-white/90 group-hover:text-white">${ep.title || `Episode ${ep.number}`}</div>
          <div class="text-[10px] text-text-dim font-bold uppercase mt-0.5">Stream Quality: HD</div>
        </div>
      `;
      btn.onclick = () => {
        // Highlight active
        const actives = this.episodesList.querySelectorAll('.border-accent');
        actives.forEach(a => {
            a.classList.remove('bg-accent/10', 'border-accent');
            a.classList.add('hover:bg-surface', 'border-transparent');
        });
        btn.classList.add('bg-accent/10', 'border-accent');
        btn.classList.remove('hover:bg-surface', 'border-transparent');
        onSelect(ep);
      };
      this.episodesList.appendChild(btn);
    });
  }

  showPlayer(title: string) {
    this.playerOverlay.classList.remove('hidden');
    this.playerTitle.textContent = title;
    document.body.style.overflow = 'hidden';
  }

  hidePlayer() {
    this.playerOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  updateHero(anime: AnimeSearchResult | null) {
      if (anime) {
          const rawThumb = anime.thumbnail || anime.image;
          const placeholderUrl = 'https://placehold.co/1200x400/18181b/ffffff?text=Anime+Spotlight';
          
          this.heroImg.onerror = () => {
              this.heroImg.src = placeholderUrl;
              this.heroImg.onerror = null;
          };

          if (rawThumb && rawThumb.startsWith('http')) {
              this.heroImg.src = this.getProxyUrl(rawThumb);
              this.heroImg.classList.remove('opacity-0');
              this.heroImg.classList.add('opacity-60'); 
          } else {
              this.heroImg.src = placeholderUrl;
              this.heroImg.classList.remove('opacity-0');
              this.heroImg.classList.add('opacity-40');
          }
          this.heroTitle.textContent = anime.name;
          this.heroDescription.textContent = anime.description || 'No description available.';
          
          let genresHtml = '';
          if (anime.genres && anime.genres.length > 0) {
              genresHtml = anime.genres.slice(0, 3).map(g => `<span>${g}</span>`).join('<span>•</span>');
          } else {
              genresHtml = '<span>Trending</span><span>•</span><span>Featured</span><span>•</span><span>Series</span>';
          }
          
          if (anime.score) {
              genresHtml += `<span>•</span><span class="text-accent font-bold">★ ${anime.score.toFixed(1)}</span>`;
          }
          if (anime.status) {
              genresHtml += `<span>•</span><span class="text-white/50">${anime.status}</span>`;
          }
          
          this.heroGenres.innerHTML = genresHtml;
      }
  }

  toggleMode(mode: 'sub' | 'dub') {
      this.modeBtn.textContent = mode.toUpperCase();
      this.modeBtn.style.color = mode === 'dub' ? '#8b5cf6' : '#fff';
  }

  getSearchQuery(): string {
      return this.searchInput.value.trim();
  }
}

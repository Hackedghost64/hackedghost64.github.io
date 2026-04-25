class UIController {
  constructor(getProxyUrl) {
    this.getProxyUrl = getProxyUrl;
    this.grid = document.getElementById('content-grid');
    this.miniSearch = document.getElementById('search-results-mini');
    this.playerOverlay = document.getElementById('player-overlay');
    this.episodesList = document.getElementById('episodes-list');
    this.episodesCount = document.getElementById('current-ep-count');
    this.playerTitle = document.getElementById('player-title');
    this.searchInput = document.getElementById('search-input');
    this.modeBtn = document.getElementById('mode-toggle');
    this.heroImg = document.getElementById('hero-img');
    this.heroTitle = document.getElementById('hero-title');
    this.heroGenres = document.getElementById('hero-genres');
    this.heroDescription = document.getElementById('hero-description');

    this.setupSearchClear();
    this.setupMobileNav();
  }

  setupSearchClear() {
    const clearBtn = document.createElement('button');
    clearBtn.id = 'search-clear';
    clearBtn.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-text-dim opacity-0 pointer-events-none transition-all hover:text-white z-10';
    clearBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    this.searchInput.parentElement.appendChild(clearBtn);
    this.searchInput.addEventListener('input', () => {
        const hasValue = this.searchInput.value.length > 0;
        clearBtn.classList.toggle('opacity-100', hasValue);
        clearBtn.classList.toggle('pointer-events-auto', hasValue);
    });
    clearBtn.onclick = () => {
        this.searchInput.value = '';
        this.searchInput.focus();
        clearBtn.classList.remove('opacity-100', 'pointer-events-auto');
        this.miniSearch.classList.add('hidden');
    };
  }

  setupMobileNav() {
      const nav = document.querySelector('nav.lg\\:hidden');
      if (!nav) return;
      
      const mainContent = document.getElementById('main-content');
      mainContent.addEventListener('scroll', () => {
          const isAtBottom = mainContent.scrollHeight - mainContent.scrollTop <= mainContent.clientHeight + 10;
          if (isAtBottom) {
              nav.classList.remove('translate-y-full');
              nav.classList.add('translate-y-0');
          } else {
              nav.classList.add('translate-y-full');
              nav.classList.remove('translate-y-0');
          }
      });
  }

  renderMiniResults(results, onSelect) {
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
      item.innerHTML = `
        <img src="${thumbUrl}" class="w-10 h-14 object-cover rounded-lg shadow-sm" />
        <div class="flex-1 overflow-hidden">
          <h5 class="text-sm font-bold truncate mb-0.5">${anime.name}</h5>
          <span class="text-[10px] text-text-dim font-bold uppercase tracking-wider">Episodes Available</span>
        </div>
      `;
      item.onclick = () => {
        onSelect(anime);
        this.miniSearch.classList.add('hidden');
        this.searchInput.value = '';
        document.getElementById('search-clear').classList.remove('opacity-100', 'pointer-events-auto');
      };
      this.miniSearch.appendChild(item);
    });
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.grid.innerHTML = '';
      for (let i = 0; i < 10; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'anime-card animate-pulse';
        skeleton.innerHTML = `
          <div class="aspect-[2/3] skeleton rounded-2xl"></div>
          <div class="py-4 px-2 space-y-2">
            <div class="h-4 w-3/4 skeleton rounded"></div>
            <div class="h-3 w-1/2 skeleton rounded"></div>
          </div>
        `;
        this.grid.appendChild(skeleton);
      }
    }
  }

  renderEmpty(message = "Nothing found here yet") {
      this.grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-32 opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <p class="text-sm font-bold uppercase tracking-widest">${message}</p>
        </div>
      `;
  }

  renderResults(results, mode, onSelect) {
    this.grid.innerHTML = '';
    if (results.length === 0) { this.renderEmpty(); return; }
    results.forEach((anime, index) => {
      const card = document.createElement('div');
      card.className = 'anime-card group cursor-pointer opacity-0';
      const rawThumb = anime.thumbnail || anime.image;
      const imageUrl = rawThumb ? this.getProxyUrl(rawThumb) : `https://placehold.co/400x600/18181b/ffffff?text=${encodeURIComponent(anime.name)}`;
      const eps = anime.availableEpisodes ? (anime.availableEpisodes[mode] || 0) : 0;
      card.innerHTML = `
        <div class="aspect-[2/3] relative overflow-hidden bg-surface rounded-2xl shadow-lg">
          <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-60"></div>
          <div class="absolute bottom-3 left-3 flex gap-2">
             <span class="bg-accent/90 backdrop-blur-md text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">${eps} ${mode.toUpperCase()}</span>
          </div>
        </div>
        <div class="py-4 px-2">
          <h4 class="font-bold text-sm truncate group-hover:text-accent transition-colors mb-1 tracking-tight">${anime.name}</h4>
          <span class="text-[10px] text-text-dim font-bold uppercase">${anime.genres?.[0] || 'Anime'}</span>
        </div>
      `;
      card.onclick = () => onSelect(anime);
      this.grid.appendChild(card);
    });
    gsap.to(".anime-card", { opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: "power2.out", startAt: { y: 20 } });
  }

  setActiveTab(tabId) {
      const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
      navItems.forEach(item => {
          if (item.id === tabId) item.classList.add('active');
          else item.classList.remove('active');
      });
  }

  renderEpisodes(episodes, onSelect) {
    this.episodesList.innerHTML = '';
    this.episodesCount.textContent = `${episodes.length} ITEMS`;
    episodes.forEach((ep) => {
      const btn = document.createElement('button');
      btn.className = 'episode-btn w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group';
      btn.innerHTML = `
        <div class="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-sm font-black group-hover:text-accent group-hover:border-accent transition-all">
          ${ep.number}
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="text-sm font-bold truncate text-white/90 group-hover:text-white">${ep.title || `Episode ${ep.number}`}</div>
          <div class="text-[9px] text-text-dim font-black uppercase tracking-widest mt-1">Ready to Stream</div>
        </div>
      `;
      btn.onclick = () => {
        const actives = this.episodesList.querySelectorAll('.episode-btn.active');
        actives.forEach(a => a.classList.remove('active'));
        btn.classList.add('active');
        onSelect(ep);
      };
      this.episodesList.appendChild(btn);
    });
    gsap.fromTo(this.episodesList.children, { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.02, duration: 0.5, ease: "power2.out", clearProps: "all" });
  }

  showPlayer(title) {
    this.playerOverlay.classList.remove('hidden');
    this.playerOverlay.style.display = 'flex';
    this.playerTitle.textContent = title;
    document.title = `Watching: ${title}`;
    document.body.style.overflow = 'hidden';
    gsap.fromTo(this.playerOverlay, { opacity: 0, scale: 1.1, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power4.out" });
  }

  hidePlayer() {
    gsap.to(this.playerOverlay, { opacity: 0, scale: 1.05, duration: 0.3, ease: "power3.in", onComplete: () => {
        this.playerOverlay.classList.add('hidden');
        document.title = 'AnimeVerse';
        document.body.style.overflow = 'auto';
    }});
  }

  updateHero(anime) {
      if (!anime) return;
      const rawThumb = anime.thumbnail || anime.image;
      const imageUrl = rawThumb ? this.getProxyUrl(rawThumb) : '';
      gsap.to("#hero-section", { opacity: 0, duration: 0.3, onComplete: () => {
          this.heroImg.src = imageUrl;
          this.heroTitle.textContent = anime.name;
          this.heroDescription.textContent = anime.description || '';
          this.heroGenres.innerHTML = anime.genres?.slice(0, 3).map(g => `<span>${g}</span>`).join('•') || '';
          gsap.to("#hero-section", { opacity: 1, duration: 0.5 });
      }});
  }

  toggleMode(mode) {
      this.modeBtn.textContent = mode.toUpperCase();
      this.modeBtn.style.color = mode === 'dub' ? '#8b5cf6' : '#fff';
  }
}
export default UIController;

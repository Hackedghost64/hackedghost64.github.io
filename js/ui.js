class UIController {
  constructor(getProxyUrl) {
    this.getProxyUrl = getProxyUrl;
    this.isMobile = window.innerWidth < 1024;
    this.appContainer = document.getElementById('app-container');
    this.playerOverlay = document.getElementById('player-overlay');
    this.episodesList = document.getElementById('episodes-list');
    this.playerTitle = document.getElementById('player-title');
    
    this.initLayout();
  }

  initLayout() {
    if (this.isMobile) {
      this.renderMobileLayout();
    } else {
      this.renderDesktopLayout();
    }
    this.bindCommonElements();
  }

  renderMobileLayout() {
    this.appContainer.innerHTML = `
      <header class="h-14 flex items-center justify-between px-4 z-50 bg-bg/80 backdrop-blur-xl border-b border-white/5 shrink-0">
        <div class="flex items-center gap-2 overflow-hidden">
           <img src="logo.png" class="w-7 h-7 shrink-0" />
           <span class="text-[10px] font-black uppercase tracking-[0.2em] truncate">AnimeVerse</span>
        </div>
        <div class="flex items-center gap-3">
           <button id="mode-toggle" class="px-2 py-1 rounded-md bg-accent/20 border border-accent/40 text-[9px] font-black text-accent uppercase tracking-widest">SUB</button>
           <button id="search-trigger" class="p-1"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
        </div>
      </header>

      <div id="main-content" class="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <div id="home-view">
            <div id="hero-container" class="relative h-[60vh] w-full overflow-hidden">
               <div id="hero-bg" class="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent z-10"></div>
               <img id="hero-img" class="w-full h-full object-cover" src="" />
               <div class="absolute bottom-6 inset-x-0 z-20 px-4 flex flex-col items-center text-center">
                  <h2 id="hero-title" class="text-2xl font-black uppercase tracking-tighter mb-2 leading-none line-clamp-2"></h2>
                  <div id="hero-genres" class="flex flex-wrap justify-center gap-1 text-[8px] font-bold text-text-dim mb-4 uppercase"></div>
                  <div class="flex items-center gap-2 w-full max-w-[260px]">
                     <button id="hero-favorite" class="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">Fav</button>
                     <button id="hero-play" class="flex-[2] py-3 bg-accent text-white rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-accent/40 active:scale-95 transition-all">Watch Now</button>
                  </div>
               </div>
            </div>

            <div class="px-4 py-8 space-y-10">
               <section id="continue-watching-section" class="hidden">
                  <div class="flex items-center justify-between mb-4 px-1">
                     <h3 class="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Continue Watching</h3>
                  </div>
                  <div id="continue-grid" class="flex gap-3 overflow-x-auto pb-4 scroll-hide px-1"></div>
               </section>

               <section>
                  <div class="flex items-center justify-between mb-4 px-1">
                     <h3 class="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Trending Now</h3>
                     <span class="text-[8px] font-bold text-accent uppercase">All</span>
                  </div>
                  <div id="content-grid" class="flex gap-3 overflow-x-auto pb-4 scroll-hide px-1"></div>
               </section>
            </div>
        </div>

        <div id="profile-view" class="hidden px-6 py-10 space-y-8">
            <div class="flex flex-col items-center gap-4 mb-10">
                <div class="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h2 class="text-xl font-black uppercase tracking-widest">My Profile</h2>
            </div>
            
            <div class="space-y-3">
                <div class="text-[10px] font-black uppercase tracking-widest text-text-dim px-2">Library</div>
                <button id="btn-favorites" class="w-full p-4 bg-surface rounded-2xl flex items-center justify-between border border-white/5">
                    <span class="text-xs font-bold uppercase tracking-wider">Favorites</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <button id="btn-history" class="w-full p-4 bg-surface rounded-2xl flex items-center justify-between border border-white/5">
                    <span class="text-xs font-bold uppercase tracking-wider">Watch History</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>

            <div class="space-y-3 pt-6">
                <div class="text-[10px] font-black uppercase tracking-widest text-red-500/50 px-2">Danger Zone</div>
                <button id="clear-data-btn" class="w-full p-4 bg-red-500/10 rounded-2xl flex items-center justify-between border border-red-500/20 text-red-500">
                    <span class="text-xs font-black uppercase tracking-widest">Clear User Data</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
      </div>

      <nav class="fixed bottom-4 inset-x-4 h-14 bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-around z-50 shadow-2xl overflow-hidden">
         <button id="mobile-nav-home" class="nav-btn active flex flex-col items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span class="text-[7px] font-black uppercase">Home</span></button>
         <button id="mobile-nav-discover" class="nav-btn flex flex-col items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 6.3-6.4 2.1 2.1-6.4z"/></svg><span class="text-[7px] font-black uppercase">Explore</span></button>
         <button id="mobile-nav-library" class="nav-btn flex flex-col items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="text-[7px] font-black uppercase">Profile</span></button>
      </nav>

      <div id="search-overlay" class="fixed inset-0 z-[100] bg-bg hidden flex-col">
         <div class="h-14 flex items-center gap-4 px-4 border-b border-border bg-sidebar shrink-0">
            <button id="search-close" class="p-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m15 18-6-6 6-6"/></svg></button>
            <input type="text" id="search-input" placeholder="Search anime..." class="flex-1 bg-transparent outline-none font-bold text-xs" />
         </div>
         <div id="search-results-mini" class="flex-1 overflow-y-auto p-4 space-y-4"></div>
      </div>
    `;
  }

  renderDesktopLayout() {
    this.appContainer.innerHTML = `
      <div class="flex h-screen w-full">
        <aside class="w-72 bg-sidebar border-r border-border p-10 flex flex-col gap-12 shrink-0">
          <div class="flex items-center gap-4">
            <img src="logo.png" class="w-10 h-10" />
            <h1 class="text-xl font-black uppercase tracking-tighter">AnimeVerse</h1>
          </div>
          <nav class="flex flex-col gap-3">
            <div id="nav-home" class="nav-item px-6 py-3 bg-surface rounded-2xl text-white font-bold text-sm cursor-pointer active border-l-4 border-accent">Home</div>
            <div id="nav-discover" class="nav-item px-6 py-3 hover:bg-surface/50 rounded-2xl text-text-dim hover:text-white font-bold text-sm cursor-pointer transition-all">Discover</div>
            <div id="nav-library" class="nav-item px-6 py-3 hover:bg-surface/50 rounded-2xl text-text-dim hover:text-white font-bold text-sm cursor-pointer transition-all">Library</div>
            <div id="nav-history" class="nav-item px-6 py-3 hover:bg-surface/50 rounded-2xl text-text-dim hover:text-white font-bold text-sm cursor-pointer transition-all">History</div>
          </nav>
        </aside>

        <main class="flex-1 flex flex-col overflow-hidden">
          <header class="h-24 px-10 flex items-center justify-between shrink-0">
            <div class="relative w-full max-w-xl">
              <input type="text" id="search-input" placeholder="Search anime, genres, etc..." class="w-full bg-surface border border-border rounded-2xl px-6 py-3.5 outline-none focus:border-accent transition-all text-sm" />
              <div id="search-results-mini" class="absolute top-full left-0 right-0 mt-4 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden hidden z-50 max-h-[500px] overflow-y-auto"></div>
            </div>
            <button id="mode-toggle" class="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">SUB</button>
          </header>

          <div id="main-content" class="flex-1 overflow-y-auto p-10 pt-0">
            <section id="hero-section" class="mb-12">
               <div class="h-80 rounded-[40px] relative overflow-hidden flex items-end p-12 hero-gradient border border-white/5">
                  <div id="hero-bg" class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <img id="hero-img" src="" class="absolute inset-0 w-full h-full object-cover -z-10" />
                  <div class="relative z-10 max-w-2xl">
                    <h2 id="hero-title" class="text-6xl font-black mb-6 leading-none tracking-tighter uppercase"></h2>
                    <div id="hero-genres" class="flex gap-4 text-xs font-bold text-white/70 mb-8 uppercase tracking-widest"></div>
                    <div class="flex items-center gap-6">
                      <button id="hero-play" class="bg-accent text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-accent/20 text-sm">Watch Now</button>
                      <button id="hero-favorite" class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      </button>
                    </div>
                  </div>
               </div>
            </section>
            
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-black uppercase tracking-widest">Recent Updates</h2>
            </div>
            <div id="content-grid" class="grid grid-cols-5 gap-8"></div>
          </div>
        </main>
      </div>
    `;
  }

  bindCommonElements() {
    this.grid = document.getElementById('content-grid');
    this.miniSearch = document.getElementById('search-results-mini');
    this.searchInput = document.getElementById('search-input');
    this.heroImg = document.getElementById('hero-img');
    this.heroTitle = document.getElementById('hero-title');
    this.heroGenres = document.getElementById('hero-genres');
    this.heroPlay = document.getElementById('hero-play');
    this.heroFavorite = document.getElementById('hero-favorite');
    this.modeBtn = document.getElementById('mode-toggle');

    if (this.isMobile) {
        const trigger = document.getElementById('search-trigger');
        const overlay = document.getElementById('search-overlay');
        const close = document.getElementById('search-close');
        
        trigger.onclick = () => {
            overlay.classList.remove('hidden');
            this.searchInput.focus();
        };
        close.onclick = () => overlay.classList.add('hidden');
    }
  }

  renderResults(results, mode, onSelect, containerId = 'content-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (results.length === 0) { 
        if (containerId === 'content-grid') this.renderEmpty("No Results Found"); 
        return; 
    }
    
    results.forEach(anime => {
      const card = document.createElement('div');
      card.className = this.isMobile ? 'flex-shrink-0 w-32 group' : 'anime-card group cursor-pointer';
      
      const rawThumb = anime.thumbnail || anime.image;
      const imageUrl = rawThumb ? this.getProxyUrl(rawThumb) : '';
      
      card.innerHTML = `
        <div class="aspect-[2/3] relative overflow-hidden bg-surface rounded-xl shadow-xl border border-white/5">
          <img src="${imageUrl}" class="w-full h-full object-cover group-active:scale-95 transition-transform duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div class="absolute bottom-2 left-2">
             <span class="bg-accent/90 text-[7px] font-black px-1.5 py-0.5 rounded uppercase">${mode}</span>
          </div>
        </div>
        <div class="mt-2 px-1">
          <h4 class="font-bold text-[9px] md:text-sm truncate uppercase tracking-tight">${anime.name}</h4>
          <span class="text-[7px] md:text-[10px] text-text-dim font-bold uppercase">${anime.genres?.[0] || 'Anime'}</span>
        </div>
      `;
      card.onclick = () => onSelect(anime);
      container.appendChild(card);
    });
    
    if (!this.isMobile) {
        gsap.from(".anime-card", { opacity: 0, y: 20, duration: 0.6, stagger: 0.05, ease: "power2.out" });
    }
  }

  showView(viewId) {
      if (!this.isMobile) return;
      document.getElementById('home-view').classList.add('hidden');
      document.getElementById('profile-view').classList.add('hidden');
      document.getElementById(viewId).classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });
  }

  renderMiniResults(results, onSelect) {
    this.miniSearch.innerHTML = '';
    this.miniSearch.classList.remove('hidden');
    
    results.slice(0, 10).forEach(anime => {
      const item = document.createElement('div');
      item.className = 'flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 active:bg-white/10';
      item.innerHTML = `
        <img src="${this.getProxyUrl(anime.thumbnail || anime.image)}" class="w-8 h-12 object-cover rounded-lg" />
        <div class="flex-1 overflow-hidden">
          <h5 class="text-[10px] font-black truncate uppercase">${anime.name}</h5>
          <span class="text-[7px] text-text-dim font-black uppercase">Click to view</span>
        </div>
      `;
      item.onclick = () => {
        onSelect(anime);
        if (this.isMobile) document.getElementById('search-overlay').classList.add('hidden');
        else this.miniSearch.classList.add('hidden');
      };
      this.miniSearch.appendChild(item);
    });
  }

  updateHero(anime) {
    if (!anime) return;
    this.heroImg.src = this.getProxyUrl(anime.thumbnail || anime.image);
    this.heroTitle.textContent = anime.name;
    this.heroGenres.innerHTML = anime.genres?.slice(0, 3).map(g => `<span>${g}</span>`).join(this.isMobile ? ' ' : ' • ') || '';
    
    gsap.from([this.heroTitle, this.heroGenres], { y: 15, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power3.out" });
  }

  showPlayer(title) {
    this.playerOverlay.classList.remove('hidden');
    this.playerOverlay.style.display = 'flex';
    this.playerTitle.textContent = title;
    document.body.style.overflow = 'hidden';
    gsap.fromTo(this.playerOverlay, { y: '100%' }, { y: '0%', duration: 0.6, ease: "expo.out" });
  }

  hidePlayer() {
    gsap.to(this.playerOverlay, { y: '100%', duration: 0.4, ease: "expo.in", onComplete: () => {
        this.playerOverlay.classList.add('hidden');
        this.playerOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }});
  }

  renderEpisodes(episodes, activeEpNumber, onSelect) {
    this.episodesList.innerHTML = '';
    episodes.forEach(ep => {
      const btn = document.createElement('button');
      const isActive = ep.number === activeEpNumber;
      btn.className = `episode-item-${ep.number} w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/5'}`;
      btn.innerHTML = `
        <div class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-[10px] font-black ${isActive ? 'text-accent' : ''}">${ep.number}</div>
        <div class="flex-1 overflow-hidden">
          <div class="text-[10px] font-black truncate uppercase ${isActive ? 'text-white' : 'text-white/70'}">${ep.title || `Episode ${ep.number}`}</div>
        </div>
      `;
      btn.onclick = () => {
          // Optimistic UI: Update all buttons immediately
          document.querySelectorAll('[class*="episode-item-"]').forEach(b => {
              b.classList.remove('bg-accent/20', 'border-accent');
              b.classList.add('bg-white/5', 'border-white/5');
          });
          btn.classList.add('bg-accent/20', 'border-accent');
          onSelect(ep);
      };
      this.episodesList.appendChild(btn);
    });
  }

  setActiveTab(tabId) {
    document.querySelectorAll('.nav-item, .nav-btn').forEach(el => {
        el.classList.remove('active', 'bg-surface', 'border-accent', 'text-accent');
        if (el.id === tabId) {
            el.classList.add('active');
            if (!this.isMobile) el.classList.add('bg-surface', 'border-l-4', 'border-accent');
            else el.classList.add('text-accent');
        }
    });
  }

  renderEmpty(message = "Nothing found") {
      this.grid.innerHTML = `<div class="w-full py-20 text-center text-[10px] font-black uppercase tracking-widest opacity-20">${message}</div>`;
  }
}
export default UIController;

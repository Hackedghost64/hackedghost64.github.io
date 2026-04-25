class PlayerManager {
    constructor(containerId) {
        this.hlsInstance = null;
        this.videoElement = null;
        this.controlsOverlay = null;
        this.autoHideTimer = null;
        this.currentOptions = null;
        this.isTheaterMode = false;
        this.volume = parseFloat(localStorage.getItem('player-volume') || '1');
        this.playbackRate = parseFloat(localStorage.getItem('player-speed') || '1');
        this.isAutoPlayEnabled = localStorage.getItem('player-autoplay') !== 'false';
        this.icons = {
            play: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M5 3l14 9-14 9V3z"/></svg>',
            pause: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
            next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/></svg>',
            prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m19 20-10-8 10-8v16Z"/><path d="M5 19V5"/></svg>',
            fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="m15 3 6 6M9 21l-6-6M21 3v6h-6M3 21v-6h6"/></svg>',
            volumeHigh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
            volumeMute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>',
            settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
            theater: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect width="20" height="15" x="2" y="4.5" rx="2"/><path d="M2 15h20"/></svg>',
            share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
            more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="18" height="18"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>'
        };
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Container #${containerId} not found`);
        this.container = el;
        this.container.classList.add('relative', 'group', 'bg-black', 'overflow-hidden');
        this.initInteractionEvents();
    }

    initInteractionEvents() {
        let clickTimer = null;
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('input') || !this.videoElement) return;
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; return; }
            clickTimer = setTimeout(() => { this.togglePlay(); clickTimer = null; }, 250);
        });
        this.container.addEventListener('dblclick', (e) => {
            if (e.target.closest('button') || e.target.closest('input') || !this.videoElement) return;
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.handleSkipAt(x, rect.width);
        });
        let lastTap = 0;
        this.container.addEventListener('touchstart', (e) => {
            if (e.target.closest('button') || e.target.closest('input') || !this.videoElement) return;
            const now = Date.now(); const timeDiff = now - lastTap;
            if (timeDiff < 300 && timeDiff > 0) {
                e.preventDefault(); 
                if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
                const rect = this.container.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                this.handleSkipAt(x, rect.width);
                lastTap = 0;
            } else { lastTap = now; }
        }, { passive: false });
    }

    play(options) {
        this.currentOptions = options;
        if (this.videoElement) {
            this.updateSource(options.url, options.isHls);
            this.updateUIForMode(options.currentMode);
        } else {
            this.clear();
            this.mountNativePlayer(options.url, options.isHls);
            this.injectModernControls(options);
        }
        this.loadProgress();
    }

    updateSource(url, isHls) {
        if (this.hlsInstance) { this.hlsInstance.destroy(); this.hlsInstance = null; }
        if (isHls || url.includes('.m3u8')) {
            if (window.Hls && Hls.isSupported()) {
                this.hlsInstance = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = false; } });
                this.hlsInstance.loadSource(url);
                this.hlsInstance.attachMedia(this.videoElement);
            } else { this.videoElement.src = url; }
        } else { this.videoElement.src = url; }
        this.videoElement.play();
    }

    updateUIForMode(mode) {
        const btn = document.getElementById('player-mode-btn');
        if (btn) btn.textContent = mode.toUpperCase();
    }

    mountNativePlayer(url, isHls) {
        const video = document.createElement('video');
        video.className = 'w-full h-full outline-none'; video.controls = false;
        video.autoplay = true; video.playsInline = true;
        video.volume = this.volume; video.playbackRate = this.playbackRate;
        this.videoElement = video; this.container.appendChild(video);
        const loader = document.createElement('div');
        loader.id = 'player-buffering'; loader.className = 'absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-40 hidden';
        loader.innerHTML = '<div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>';
        this.container.appendChild(loader);
        video.onwaiting = () => loader.classList.remove('hidden');
        video.onplaying = () => loader.classList.add('hidden');
        this.updateSource(url, isHls);
    }

    injectModernControls(options) {
        const isMobile = window.innerWidth < 1024;
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 flex flex-col justify-between z-50 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-100 transition-opacity duration-300';
        this.controlsOverlay = overlay;
        
        // Centered Big Play Button for Mobile
        if (isMobile) {
            const bigPlayContainer = document.createElement('div');
            bigPlayContainer.className = 'absolute inset-0 flex items-center justify-center pointer-events-none';
            const bigPlayBtn = document.createElement('button');
            bigPlayBtn.className = 'w-16 h-16 rounded-full bg-accent/20 backdrop-blur-xl border border-accent/40 flex items-center justify-center text-white pointer-events-auto opacity-0 transition-all duration-300 scale-110';
            bigPlayBtn.id = 'player-big-play-btn';
            bigPlayBtn.innerHTML = this.icons.play;
            bigPlayBtn.onclick = (e) => { e.stopPropagation(); this.togglePlay(); };
            bigPlayContainer.appendChild(bigPlayBtn);
            overlay.appendChild(bigPlayContainer);
        }

        const topBar = document.createElement('div');
        topBar.className = 'p-4 md:p-6 flex justify-between items-start';
        topBar.innerHTML = `<div class="glass px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span> ${isMobile ? 'LIVE' : 'HD STREAM'}</div>`;
        
        const bottomBar = document.createElement('div');
        bottomBar.className = 'p-3 md:p-6 flex flex-col gap-3 md:gap-4';
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'relative w-full h-1.5 group/seeker cursor-pointer';
        const progressBg = document.createElement('div');
        progressBg.className = 'absolute inset-0 bg-white/10 rounded-full overflow-hidden';
        const progressBar = document.createElement('div');
        progressBar.className = 'h-full bg-accent w-0 transition-[width] duration-100';
        progressBar.id = 'player-progress-bar';
        progressBg.appendChild(progressBar);
        const seeker = document.createElement('input');
        seeker.type = 'range'; seeker.className = 'absolute inset-0 w-full opacity-0 cursor-pointer z-10'; seeker.id = 'player-seeker';
        progressContainer.appendChild(progressBg); progressContainer.appendChild(seeker);
        
        const mainControls = document.createElement('div');
        mainControls.className = 'flex justify-between items-center gap-2';
        
        const leftGroup = document.createElement('div');
        leftGroup.className = 'flex items-center gap-1 md:gap-3';
        if (!isMobile) leftGroup.appendChild(this.createIconButton(this.icons.play, () => this.togglePlay(), 'Play/Pause', 'player-play-btn'));
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'text-[9px] md:text-xs font-black font-mono tracking-tighter opacity-80 ml-1';
        timeDisplay.id = 'player-time'; timeDisplay.textContent = '00:00 / 00:00';
        leftGroup.appendChild(timeDisplay);
        
        const rightGroup = document.createElement('div');
        rightGroup.className = 'flex items-center gap-1 md:gap-4';

        if (!isMobile) {
            const skipIntroBtn = document.createElement('button');
            skipIntroBtn.id = 'skip-intro-btn';
            skipIntroBtn.className = 'px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all opacity-0 pointer-events-none';
            skipIntroBtn.textContent = 'Skip Intro';
            skipIntroBtn.onclick = () => { this.videoElement.currentTime += 85; };
            rightGroup.appendChild(skipIntroBtn);
        }

        const modeBtn = document.createElement('button');
        modeBtn.id = 'player-mode-btn';
        modeBtn.className = 'px-2 py-1.5 md:px-3 rounded-lg bg-accent/20 text-accent border border-accent/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest';
        modeBtn.textContent = options.currentMode.toUpperCase();
        modeBtn.onclick = () => { options.onModeSwitch(); };
        rightGroup.appendChild(modeBtn);

        const speedBtn = document.createElement('button');
        speedBtn.className = 'text-[9px] md:text-[10px] font-black w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all';
        speedBtn.textContent = this.playbackRate + 'X'; speedBtn.onclick = () => this.cycleSpeed(speedBtn);
        rightGroup.appendChild(speedBtn);

        if (!isMobile) {
            rightGroup.appendChild(this.createIconButton(this.icons.share, () => this.handleShare(), 'Share'));
            rightGroup.appendChild(this.createIconButton(this.icons.download, () => this.handleDownload(), 'Download'));
            rightGroup.appendChild(this.createIconButton(this.icons.theater, () => this.toggleTheaterMode(), 'Theater'));
            rightGroup.appendChild(this.createIconButton(this.icons.settings, () => this.toggleMoreMenu(), 'Settings'));
        } else {
            rightGroup.appendChild(this.createIconButton(this.icons.more, () => this.toggleMoreMenu(), 'More'));
        }
        
        rightGroup.appendChild(this.createIconButton(this.icons.fullscreen, () => this.toggleFullscreen(), 'Fullscreen'));
        
        mainControls.appendChild(leftGroup); mainControls.appendChild(rightGroup);
        bottomBar.appendChild(progressContainer); bottomBar.appendChild(mainControls);
        overlay.appendChild(topBar); overlay.appendChild(bottomBar);
        this.container.appendChild(overlay);
        this.setupControlListeners(seeker, null);
    }

    setupControlListeners(seeker, volSlider) {
        if (!this.videoElement) return;
        const video = this.videoElement;
        const progressBar = document.getElementById('player-progress-bar');
        const timeDisplay = document.getElementById('player-time');
        const skipBtn = document.getElementById('skip-intro-btn');

        video.addEventListener('timeupdate', () => {
            const p = (video.currentTime / video.duration) * 100;
            if (progressBar) progressBar.style.width = `${p}%`;
            seeker.value = p.toString();
            if (timeDisplay) timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
            if (Math.floor(video.currentTime) % 5 === 0) this.saveProgress();
            if (skipBtn && video.currentTime > 10 && video.currentTime < 180) {
                skipBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else if (skipBtn) {
                skipBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        video.addEventListener('ended', () => {
            if (this.isAutoPlayEnabled && this.currentOptions?.onNext) {
                this.showSkipIndicator('Auto-playing next...', 'center');
                setTimeout(() => this.currentOptions?.onNext?.(), 2000);
            }
        });
        seeker.addEventListener('input', () => { video.currentTime = (parseFloat(seeker.value) / 100) * video.duration; });
        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDownBound);
        this.container.onmousemove = () => this.showControls();
        this.container.onmouseleave = () => this.hideControls();
    }

    saveProgress() {
        if (!this.videoElement || !this.currentOptions?.animeId) return;
        const key = `progress-${this.currentOptions.animeId}-${this.currentOptions.episodeNumber}`;
        localStorage.setItem(key, this.videoElement.currentTime);
    }

    loadProgress() {
        if (!this.videoElement || !this.currentOptions?.animeId) return;
        const key = `progress-${this.currentOptions.animeId}-${this.currentOptions.episodeNumber}`;
        const saved = localStorage.getItem(key);
        if (saved && parseFloat(saved) > 5) {
            this.videoElement.currentTime = parseFloat(saved); 
            this.showSkipIndicator(`Resumed at ${this.formatTime(saved)}`, 'center'); 
        }
    }

    handleShare() {
        const text = `Check out this anime on AnimeVerse!`;
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: 'AnimeVerse', text: text, url: url }).catch(() => {
                navigator.clipboard.writeText(url);
                this.showSkipIndicator('Link Copied!', 'center');
            });
        } else {
            navigator.clipboard.writeText(url);
            this.showSkipIndicator('Link Copied!', 'center');
        }
    }

    handleDownload() {
        const url = this.currentOptions.url;
        if (url.includes('.m3u8')) {
            navigator.clipboard.writeText(url); this.showSkipIndicator('Link copied!', 'center');
        } else {
            const a = document.createElement('a'); a.href = url; a.download = `episode-${this.currentOptions.episodeNumber}.mp4`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
    }

    handleKeyDown(e) {
        if (!this.videoElement || document.activeElement?.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space': e.preventDefault(); this.togglePlay(); break;
            case 'ArrowRight': this.videoElement.currentTime += 10; this.showSkipIndicator('+10s', 'right'); break;
            case 'ArrowLeft': this.videoElement.currentTime -= 10; this.showSkipIndicator('-10s', 'left'); break;
            case 'KeyF': this.toggleFullscreen(); break;
        }
    }

    showControls() {
        if (!this.controlsOverlay) return;
        this.controlsOverlay.style.opacity = '1'; 
        this.container.style.cursor = 'default';
        const bigPlayBtn = document.getElementById('player-big-play-btn');
        if (bigPlayBtn) { bigPlayBtn.style.opacity = '1'; bigPlayBtn.style.transform = 'scale(1)'; }
        clearTimeout(this.autoHideTimer); 
        this.autoHideTimer = setTimeout(() => this.hideControls(), 3000);
    }

    hideControls() {
        if (!this.controlsOverlay) return;
        if (this.videoElement && !this.videoElement.paused) {
            this.controlsOverlay.style.opacity = '0'; 
            this.container.style.cursor = 'none';
            const bigPlayBtn = document.getElementById('player-big-play-btn');
            if (bigPlayBtn) { bigPlayBtn.style.opacity = '0'; bigPlayBtn.style.transform = 'scale(0.8)'; }
        }
    }

    togglePlay() { 
        if (!this.videoElement) return; 
        const isPaused = this.videoElement.paused;
        if (isPaused) {
            this.videoElement.play(); 
            this.showSkipIndicator('PLAY', 'center');
        } else {
            this.videoElement.pause(); 
            this.showSkipIndicator('PAUSE', 'center');
        }
        const bigPlayBtn = document.getElementById('player-big-play-btn');
        if (bigPlayBtn) {
            bigPlayBtn.innerHTML = isPaused ? this.icons.pause : this.icons.play;
            gsap.fromTo(bigPlayBtn, { scale: 1.5, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.5, ease: "power2.out" });
        }
    }

    toggleMoreMenu() {
        const existing = document.getElementById('player-more-menu');
        if (existing) { existing.remove(); return; }
        const isMobile = window.innerWidth < 1024;
        const menu = document.createElement('div');
        menu.id = 'player-more-menu';
        menu.className = `absolute bottom-20 right-4 bg-sidebar/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-[70] flex flex-col gap-1 min-w-[180px] shadow-2xl`;
        
        // Quality Options
        if (this.currentOptions?.allLinks) {
            const label = document.createElement('div');
            label.className = 'px-3 py-2 text-[8px] font-black uppercase tracking-widest text-text-dim';
            label.textContent = 'Quality';
            menu.appendChild(label);
            this.currentOptions.allLinks.forEach((link) => {
                const item = document.createElement('button');
                const isCurrent = (link.proxyUrl || link.url) === this.currentOptions?.url;
                item.className = `flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-[10px] font-bold transition-all hover:bg-white/5 active:bg-white/10 ${isCurrent ? 'text-accent bg-accent/5' : 'text-white/70'}`;
                item.innerHTML = `<span>${link.resolution || 'Auto'}</span>`;
                if (isCurrent) item.innerHTML += '<div class="w-1.5 h-1.5 rounded-full bg-accent"></div>';
                item.onclick = () => { this.switchQuality(link); menu.remove(); };
                menu.appendChild(item);
            });
        }

        // Feature Options for Mobile
        if (isMobile) {
            const label = document.createElement('div');
            label.className = 'px-3 py-2 mt-2 text-[8px] font-black uppercase tracking-widest text-text-dim';
            label.textContent = 'Features';
            menu.appendChild(label);
            
            const features = [
                { icon: this.icons.share, label: 'Share', action: () => this.handleShare() },
                { icon: this.icons.download, label: 'Download', action: () => this.handleDownload() },
                { icon: this.icons.theater, label: 'Theater', action: () => this.toggleTheaterMode() }
            ];

            features.forEach(f => {
                const item = document.createElement('button');
                item.className = 'flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold text-white/70 hover:bg-white/5 active:bg-white/10';
                item.innerHTML = `${f.icon} <span>${f.label}</span>`;
                item.onclick = () => { f.action(); menu.remove(); };
                menu.appendChild(item);
            });
        }

        this.container.appendChild(menu);
        gsap.from(menu, { y: 20, opacity: 0, duration: 0.3, ease: "power2.out" });
    }

    switchQuality(link) {
        const time = this.videoElement.currentTime;
        this.currentOptions.url = link.proxyUrl || link.url;
        this.currentOptions.isHls = link.isHls;
        this.updateSource(this.currentOptions.url, this.currentOptions.isHls);
        this.videoElement.currentTime = time;
    }

    formatTime(s) {
        if (isNaN(s)) return "00:00";
        const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = Math.floor(s % 60);
        return (h > 0 ? h + ":" : "") + (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    handleSkipAt(x, width) {
        if (x > width / 2) { this.videoElement.currentTime += 10; this.showSkipIndicator('+10s', 'right'); }
        else { this.videoElement.currentTime -= 10; this.showSkipIndicator('-10s', 'left'); }
    }

    showSkipIndicator(text, side) {
        const i = document.createElement('div');
        let posClass = side === 'left' ? 'left-1/4' : (side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2');
        i.className = `absolute top-1/2 -translate-y-1/2 ${posClass} bg-accent/90 text-white font-black px-6 py-3 rounded-2xl z-[60] shadow-2xl backdrop-blur-md border border-white/20 pointer-events-none`;
        i.textContent = text; this.container.appendChild(i); setTimeout(() => i.remove(), 800);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.container.requestFullscreen) this.container.requestFullscreen();
            else if (this.container.webkitRequestFullscreen) this.container.webkitRequestFullscreen();
        } else { if (document.exitFullscreen) document.exitFullscreen(); }
    }

    toggleTheaterMode() { 
        this.isTheaterMode = !this.isTheaterMode; 
        document.getElementById('video-container')?.classList.toggle('theater-mode', this.isTheaterMode);
        this.showSkipIndicator(this.isTheaterMode ? 'THEATER ON' : 'THEATER OFF', 'center');
    }

    createIconButton(icon, onClick, title, id = null) {
        const btn = document.createElement('button');
        btn.className = 'w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/20 active:scale-95 transition-all border border-white/5 backdrop-blur-md text-white cursor-pointer';
        if (id) btn.id = id; btn.innerHTML = icon; btn.title = title;
        btn.onclick = (e) => { e.stopPropagation(); onClick(); }; return btn;
    }

    clear() {
        if (this.handleKeyDownBound) { window.removeEventListener('keydown', this.handleKeyDownBound); this.handleKeyDownBound = null; }
        if (this.hlsInstance) { this.hlsInstance.destroy(); this.hlsInstance = null; }
        clearTimeout(this.autoHideTimer); this.videoElement = null; this.controlsOverlay = null;
        this.container.innerHTML = ''; this.container.style.cursor = 'default';
    }
}
export default PlayerManager;

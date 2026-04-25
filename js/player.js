class PlayerManager {
    constructor(containerId) {
        this.hlsInstance = null;
        this.videoElement = null;
        this.controlsOverlay = null;
        this.autoHideTimer = null;
        this.currentOptions = null;
        this.isTheaterMode = false;
        
        // Memory & Settings
        this.volume = parseFloat(localStorage.getItem('player-volume') || '1');
        this.playbackRate = parseFloat(localStorage.getItem('player-speed') || '1');
        this.isAutoPlayEnabled = localStorage.getItem('player-autoplay') !== 'false';

        this.icons = {
            play: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M5 3l14 9-14 9V3z"/></svg>',
            pause: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
            next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/></svg>',
            prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m19 20-10-8 10-8v16Z"/><path d="M5 19V5"/></svg>',
            fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="m15 3 6 6M9 21l-6-6M21 3v6h-6M3 21v-6h6"/></svg>',
            sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M7 8h10"/><path d="M7 12h10"/></svg>',
            volumeHigh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
            volumeMute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>',
            settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
            download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
            theater: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect width="20" height="15" x="2" y="4.5" rx="2"/><path d="M2 15h20"/></svg>',
            skipForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M13 19l6-7-6-7"/><path d="M5 19l6-7-6-7"/></svg>'
        };

        const el = document.getElementById(containerId);
        if (!el) throw new Error(`[Trace] Container #${containerId} not found`);
        this.container = el;
        this.container.classList.add('relative', 'group', 'bg-black', 'overflow-hidden');
    }

    play(options) {
        this.currentOptions = options;
        this.clear();
        
        const url = options.url.toLowerCase();
        const isDirectFile = options.isHls || 
                           url.includes('.m3u8') || 
                           url.includes('.mp4') || 
                           url.includes('video-proxy') || 
                           url.includes('googlevideo') || 
                           url.includes('allanime.day');

        if (isDirectFile && !options.isEmbed) {
            this.mountNativePlayer(options.url, options.isHls);
            this.injectModernControls(options);
            this.setupInteractions();
            this.loadProgress();
        } else {
            this.mountIframe(options.url);
        }
    }

    mountNativePlayer(url, isHls) {
        const video = document.createElement('video');
        video.className = 'w-full h-full outline-none';
        video.controls = false;
        video.autoplay = true;
        video.playsInline = true;
        video.volume = this.volume;
        video.playbackRate = this.playbackRate;
        this.videoElement = video;
        this.container.appendChild(video);

        // Buffering Indicator
        const loader = document.createElement('div');
        loader.id = 'player-buffering';
        loader.className = 'absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-40 hidden';
        loader.innerHTML = '<div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>';
        this.container.appendChild(loader);

        video.onwaiting = () => loader.classList.remove('hidden');
        video.onplaying = () => loader.classList.add('hidden');

        if (isHls || url.includes('.m3u8')) {
            if (window.Hls && Hls.isSupported()) {
                this.hlsInstance = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = false; } });
                this.hlsInstance.loadSource(url);
                this.hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        } else {
            video.src = url;
        }

        video.onerror = () => this.mountIframe(url);
    }

    injectModernControls(options) {
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 flex flex-col justify-between z-50 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-100 transition-opacity duration-300';
        this.controlsOverlay = overlay;

        const topBar = document.createElement('div');
        topBar.className = 'p-6 flex justify-between items-start';
        topBar.innerHTML = `<div class="glass px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span> HD STREAM</div>`;
        
        const bottomBar = document.createElement('div');
        bottomBar.className = 'p-2 md:p-6 flex flex-col gap-2 md:gap-4';

        const progressContainer = document.createElement('div');
        progressContainer.className = 'relative w-full h-1.5 group/seeker cursor-pointer';
        const progressBg = document.createElement('div');
        progressBg.className = 'absolute inset-0 bg-white/10 rounded-full overflow-hidden';
        const progressBar = document.createElement('div');
        progressBar.className = 'h-full bg-accent w-0 transition-[width] duration-100';
        progressBar.id = 'player-progress-bar';
        progressBg.appendChild(progressBar);
        
        const seeker = document.createElement('input');
        seeker.type = 'range';
        seeker.className = 'absolute inset-0 w-full opacity-0 cursor-pointer z-10';
        seeker.id = 'player-seeker';
        
        progressContainer.appendChild(progressBg);
        progressContainer.appendChild(seeker);

        const mainControls = document.createElement('div');
        mainControls.className = 'flex justify-between items-center';

        const leftGroup = document.createElement('div');
        leftGroup.className = 'flex items-center gap-2';

        leftGroup.appendChild(this.createIconButton(this.icons.play, () => this.togglePlay(), 'Play/Pause', 'player-play-btn'));
        if (options.onPrev) leftGroup.appendChild(this.createIconButton(this.icons.prev, options.onPrev, 'Prev'));
        if (options.onNext) leftGroup.appendChild(this.createIconButton(this.icons.next, options.onNext, 'Next'));

        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'text-[10px] md:text-xs font-bold font-mono tracking-tighter opacity-80 ml-2';
        timeDisplay.id = 'player-time';
        timeDisplay.textContent = '00:00 / 00:00';
        leftGroup.appendChild(timeDisplay);

        const rightGroup = document.createElement('div');
        rightGroup.className = 'flex items-center gap-1.5 md:gap-4';

        // AutoPlay Toggle
        const apToggle = document.createElement('button');
        apToggle.className = `hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all ${this.isAutoPlayEnabled ? 'bg-accent/20 text-accent border-accent/20' : 'bg-white/5 text-white/40'}`;
        apToggle.innerHTML = `<span>Auto Next</span>`;
        apToggle.onclick = () => {
            this.isAutoPlayEnabled = !this.isAutoPlayEnabled;
            localStorage.setItem('player-autoplay', this.isAutoPlayEnabled);
            apToggle.className = `hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all ${this.isAutoPlayEnabled ? 'bg-accent/20 text-accent border-accent/20' : 'bg-white/5 text-white/40'}`;
            this.showSkipIndicator(`Auto-Play: ${this.isAutoPlayEnabled ? 'ON' : 'OFF'}`, 'center');
        };
        rightGroup.appendChild(apToggle);

        const volumeGroup = document.createElement('div');
        volumeGroup.className = 'hidden md:flex items-center gap-2 group/volume';
        const volBtn = this.createIconButton(this.icons.volumeHigh, () => this.toggleMute(), 'Mute', 'player-vol-btn');
        const volSlider = document.createElement('input');
        volSlider.type = 'range';
        volSlider.className = 'w-0 group-hover/volume:w-20 transition-all duration-300 player-slider';
        volSlider.id = 'player-vol-slider';
        volSlider.min = '0'; volSlider.max = '1'; volSlider.step = '0.1'; volSlider.value = this.volume.toString();
        volumeGroup.appendChild(volBtn);
        volumeGroup.appendChild(volSlider);
        rightGroup.appendChild(volumeGroup);

        const speedBtn = document.createElement('button');
        speedBtn.className = 'text-[10px] font-black w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all';
        speedBtn.textContent = this.playbackRate + 'X';
        speedBtn.onclick = () => this.cycleSpeed(speedBtn);
        rightGroup.appendChild(speedBtn);

        // Download Button
        const dlBtn = this.createIconButton(this.icons.download, () => this.handleDownload(), 'Download');
        rightGroup.appendChild(dlBtn);

        const theaterBtn = this.createIconButton(this.icons.theater, () => this.toggleTheaterMode(), 'Theater');
        theaterBtn.classList.add('hidden', 'lg:flex');
        rightGroup.appendChild(theaterBtn);

        rightGroup.appendChild(this.createIconButton(this.icons.settings, () => this.toggleSettings(), 'Settings'));
        rightGroup.appendChild(this.createIconButton(this.icons.fullscreen, () => this.toggleFullscreen(), 'Fullscreen'));

        mainControls.appendChild(leftGroup);
        mainControls.appendChild(rightGroup);

        bottomBar.appendChild(progressContainer);
        bottomBar.appendChild(mainControls);

        overlay.appendChild(topBar);
        overlay.appendChild(bottomBar);
        this.container.appendChild(overlay);

        this.setupControlListeners(seeker, volSlider);
    }

    setupControlListeners(seeker, volSlider) {
        if (!this.videoElement) return;
        const video = this.videoElement;
        const playBtn = document.getElementById('player-play-btn');
        const progressBar = document.getElementById('player-progress-bar');
        const timeDisplay = document.getElementById('player-time');

        video.addEventListener('play', () => { if (playBtn) playBtn.innerHTML = this.icons.pause; });
        video.addEventListener('pause', () => { if (playBtn) playBtn.innerHTML = this.icons.play; });

        video.addEventListener('timeupdate', () => {
            const p = (video.currentTime / video.duration) * 100;
            if (progressBar) progressBar.style.width = `${p}%`;
            seeker.value = p.toString();
            if (timeDisplay) timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration)}`;
            
            // Save Progress every 5 seconds
            if (Math.floor(video.currentTime) % 5 === 0) this.saveProgress();
        });

        video.addEventListener('ended', () => {
            if (this.isAutoPlayEnabled && this.currentOptions?.onNext) {
                this.showSkipIndicator('Auto-playing next...', 'center');
                setTimeout(() => this.currentOptions?.onNext?.(), 2000);
            }
        });

        seeker.addEventListener('input', () => {
            const time = (parseFloat(seeker.value) / 100) * video.duration;
            video.currentTime = time;
        });

        volSlider.addEventListener('input', () => {
            this.volume = parseFloat(volSlider.value);
            video.volume = this.volume;
            localStorage.setItem('player-volume', this.volume);
            this.updateVolumeIcon(this.volume);
        });

        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDownBound);

        this.container.onmousemove = () => this.showControls();
        this.container.onmouseleave = () => this.hideControls();
        this.showControls();
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
        if (saved) {
            this.videoElement.currentTime = parseFloat(saved);
            this.showSkipIndicator(`Resumed at ${this.formatTime(saved)}`, 'center');
        }
    }

    handleDownload() {
        const url = this.currentOptions.url;
        const isHls = url.includes('.m3u8');
        
        if (isHls) {
            navigator.clipboard.writeText(url);
            this.showSkipIndicator('Link copied to clipboard!', 'center');
            alert("HLS Streams (.m3u8) can't be downloaded directly in the browser.\n\nThe link has been copied to your clipboard. Paste it into VLC or a downloader app.");
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = `anime-episode-${this.currentOptions.episodeNumber}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.showSkipIndicator('Starting Download...', 'center');
        }
    }

    handleKeyDown(e) {
        if (!this.videoElement || document.activeElement?.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowRight':
                this.videoElement.currentTime += 10;
                this.showSkipIndicator('+10s', 'right');
                break;
            case 'ArrowLeft':
                this.videoElement.currentTime -= 10;
                this.showSkipIndicator('-10s', 'left');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.1);
                this.volume = this.videoElement.volume;
                this.updateVolumeIcon(this.volume);
                this.showSkipIndicator(`Vol: ${Math.round(this.volume * 100)}%`, 'center');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.1);
                this.volume = this.videoElement.volume;
                this.updateVolumeIcon(this.volume);
                this.showSkipIndicator(`Vol: ${Math.round(this.volume * 100)}%`, 'center');
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'Slash':
                if (e.shiftKey) alert("Keyboard Shortcuts:\nSpace: Play/Pause\nF: Fullscreen\nM: Mute\nArrows: Seek & Volume\nNumbers: Skip to %");
                break;
        }

        // Numbers 0-9 to skip %
        if (e.keyCode >= 48 && e.keyCode <= 57) {
            const percent = (e.keyCode - 48) * 10;
            this.videoElement.currentTime = (percent / 100) * this.videoElement.duration;
            this.showSkipIndicator(`Jump to ${percent}%`, 'center');
        }
    }

    showControls() {
        if (!this.controlsOverlay) return;
        this.controlsOverlay.style.opacity = '1';
        this.container.style.cursor = 'default';
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(() => this.hideControls(), 3000);
    }

    hideControls() {
        if (!this.controlsOverlay || (this.videoElement && this.videoElement.paused)) return;
        this.controlsOverlay.style.opacity = '0';
        this.container.style.cursor = 'none';
    }

    togglePlay() {
        if (!this.videoElement) return;
        if (this.videoElement.paused) this.videoElement.play();
        else this.videoElement.pause();
    }

    toggleMute() {
        if (!this.videoElement) return;
        this.videoElement.muted = !this.videoElement.muted;
        this.updateVolumeIcon(this.videoElement.muted ? 0 : this.volume);
    }

    updateVolumeIcon(vol) {
        const btn = document.getElementById('player-vol-btn');
        if (btn) btn.innerHTML = vol === 0 ? this.icons.volumeMute : this.icons.volumeHigh;
    }

    cycleSpeed(btn) {
        if (!this.videoElement) return;
        const speeds = [1, 1.25, 1.5, 2];
        let current = speeds.indexOf(this.playbackRate);
        let next = (current + 1) % speeds.length;
        this.playbackRate = speeds[next];
        this.videoElement.playbackRate = this.playbackRate;
        localStorage.setItem('player-speed', this.playbackRate);
        btn.textContent = this.playbackRate + 'X';
    }

    formatTime(s) {
        if (isNaN(s)) return "00:00";
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return (h > 0 ? h + ":" : "") + (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
    }

    setupInteractions() {
        if (!this.videoElement) return;
        
        // Desktop double click
        this.videoElement.onclick = () => this.togglePlay();
        this.videoElement.ondblclick = (e) => {
            const rect = this.videoElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.handleSkipAt(x, rect.width);
        };

        // Mobile double tap detection
        let lastTap = 0;
        this.videoElement.addEventListener('touchstart', (e) => {
            const now = Date.now();
            const timeDiff = now - lastTap;
            if (timeDiff < 300 && timeDiff > 0) {
                e.preventDefault();
                const rect = this.videoElement.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                this.handleSkipAt(x, rect.width);
            }
            lastTap = now;
        }, { passive: false });
    }

    handleSkipAt(x, width) {
        if (x > width / 2) {
            this.videoElement.currentTime += 10;
            this.showSkipIndicator('+10s', 'right');
            this.showRipple('right');
        } else {
            this.videoElement.currentTime -= 10;
            this.showSkipIndicator('-10s', 'left');
            this.showRipple('left');
        }
    }

    showRipple(side) {
        const ripple = document.createElement('div');
        ripple.className = 'skip-ripple';
        ripple.style.left = side === 'left' ? '25%' : '75%';
        this.container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 800);
    }

    showSkipIndicator(text, side) {
        const i = document.createElement('div');
        let posClass = side === 'left' ? 'left-1/4' : (side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2');
        i.className = `absolute top-1/2 -translate-y-1/2 ${posClass} bg-accent/90 text-white font-black px-6 py-3 rounded-2xl fade-in z-[60] shadow-2xl backdrop-blur-md border border-white/20 pointer-events-none`;
        i.textContent = text;
        this.container.appendChild(i);
        setTimeout(() => i.remove(), 800);
    }

    toggleFullscreen() {
        const container = this.container;
        if (!document.fullscreenElement) {
            if (container.requestFullscreen) container.requestFullscreen();
            else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }

    toggleTheaterMode() {
        this.isTheaterMode = !this.isTheaterMode;
        if (this.isTheaterMode) {
            this.container.classList.add('theater-mode');
        } else {
            this.container.classList.remove('theater-mode');
        }
    }

    createIconButton(icon, onClick, title, id = null) {
        const btn = document.createElement('button');
        btn.className = 'w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/20 active:scale-95 transition-all border border-white/5 backdrop-blur-md text-white cursor-pointer';
        if (id) btn.id = id;
        btn.innerHTML = icon;
        btn.title = title;
        btn.onclick = (e) => {
            e.stopPropagation();
            onClick();
        };
        return btn;
    }

    mountIframe(url) {
        this.clear();
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full bg-black border-none';
        iframe.src = url;
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; fullscreen; encrypted-media;';
        this.container.appendChild(iframe);
    }

    clear() {
        if (this.handleKeyDownBound) {
            window.removeEventListener('keydown', this.handleKeyDownBound);
            this.handleKeyDownBound = null;
        }
        if (this.hlsInstance) { this.hlsInstance.destroy(); this.hlsInstance = null; }
        clearTimeout(this.autoHideTimer);
        this.videoElement = null;
        this.controlsOverlay = null;
        this.container.innerHTML = '';
        this.container.style.cursor = 'default';
    }

    toggleSettings() {
        if (!this.currentOptions?.allLinks) return;
        const existing = document.getElementById('player-settings-menu');
        if (existing) { existing.remove(); return; }

        const menu = document.createElement('div');
        menu.id = 'player-settings-menu';
        menu.className = 'absolute bottom-24 right-6 bg-sidebar/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-[70] flex flex-col gap-1 min-w-[160px] shadow-2xl fade-in';
        
        this.currentOptions.allLinks.forEach((link) => {
            const item = document.createElement('button');
            const isCurrent = (link.proxyUrl || link.url) === this.currentOptions?.url;
            item.className = `flex items-center justify-between gap-4 p-3 rounded-xl text-xs font-bold transition-all hover:bg-white/5 ${isCurrent ? 'text-accent bg-accent/5' : 'text-white/60'}`;
            item.innerHTML = `<span>${link.resolution || 'Auto'} (${link.provider})</span>`;
            if (isCurrent) item.innerHTML += '<div class="w-1.5 h-1.5 rounded-full bg-accent"></div>';
            item.onclick = () => { this.switchQuality(link); menu.remove(); };
            menu.appendChild(item);
        });
        this.container.appendChild(menu);
    }

    switchQuality(link) {
        const time = this.videoElement.currentTime;
        this.currentOptions.url = link.proxyUrl || link.url;
        this.currentOptions.isHls = link.isHls;
        this.play(this.currentOptions);
        this.videoElement.currentTime = time;
    }
}

export default PlayerManager;

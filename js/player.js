export class PlayerManager {
  constructor(containerId) {
    this.hlsInstance = null;
    this.videoElement = null;
    this.controlsOverlay = null;
    this.autoHideTimer = null;
    this.currentOptions = null;
    this.isTheaterMode = false;
    this.isAutoPlayEnabled = true;

    this.icons = {
        play: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M5 3l14 9-14 9V3z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/></svg>',
        prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path d="m19 20-10-8 10-8v16Z"/><path d="M5 19V5"/></svg>',
        pip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><rect width="10" height="7" x="11" y="13" rx="1"/></svg>',
        fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="m15 3 6 6M9 21l-6-6M21 3v6h-6M3 21v-6h6"/></svg>',
        cast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 8.95 21M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><path d="M2 20h.01"/></svg>',
        sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M7 8h10"/><path d="M7 12h10"/></svg>',
        volumeHigh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
        volumeMute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        vlc: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
        theater: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect width="20" height="15" x="2" y="4.5" rx="2"/><path d="M2 15h20"/></svg>',
        skipForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M13 19l6-7-6-7"/><path d="M5 19l6-7-6-7"/></svg>'
    };

    const el = document.getElementById(containerId);
    if (!el) throw new Error(`[Trace] Container #${containerId} not found`);
    this.container = el;
    this.container.classList.add('relative', 'group', 'bg-black', 'overflow-hidden');
  }

  play(options) {
      console.log("[Player] Initializing playback for:", options.url);
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
      this.videoElement = video;
      this.container.appendChild(video);

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
      
      const topActions = document.createElement('div');
      topActions.className = 'flex gap-3';
      topActions.appendChild(this.createIconButton(this.icons.cast, () => this.triggerCast(), 'Cast'));
      topBar.appendChild(topActions);

      const centerGroup = document.createElement('div');
      centerGroup.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none';
      const centerIcon = document.createElement('div');
      centerIcon.className = 'w-20 h-20 rounded-full bg-accent/20 backdrop-blur-md flex items-center justify-center opacity-0 scale-50 transition-all duration-300';
      centerIcon.id = 'center-play-indicator';
      centerGroup.appendChild(centerIcon);

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

      const playBtn = this.createIconButton(this.icons.play, () => this.togglePlay(), 'Play/Pause');
      playBtn.id = 'player-play-btn';
      leftGroup.appendChild(playBtn);

      if (options.onPrev) leftGroup.appendChild(this.createIconButton(this.icons.prev, options.onPrev, 'Prev'));
      if (options.onNext) leftGroup.appendChild(this.createIconButton(this.icons.next, options.onNext, 'Next'));

      const timeDisplay = document.createElement('div');
      timeDisplay.className = 'text-[10px] md:text-xs font-bold font-mono tracking-tighter opacity-80 ml-2';
      timeDisplay.id = 'player-time';
      timeDisplay.textContent = '00:00 / 00:00';
      leftGroup.appendChild(timeDisplay);

      const rightGroup = document.createElement('div');
      rightGroup.className = 'flex items-center gap-1.5 md:gap-4';

      const volumeGroup = document.createElement('div');
      volumeGroup.className = 'hidden md:flex items-center gap-2 group/volume';
      const volBtn = this.createIconButton(this.icons.volumeHigh, () => this.toggleMute(), 'Mute');
      volBtn.id = 'player-vol-btn';
      const volSlider = document.createElement('input');
      volSlider.type = 'range';
      volSlider.className = 'w-0 group-hover/volume:w-20 transition-all duration-300 player-slider';
      volSlider.id = 'player-vol-slider';
      volSlider.min = '0'; volSlider.max = '1'; volSlider.step = '0.1'; volSlider.value = '1';
      volumeGroup.appendChild(volBtn);
      volumeGroup.appendChild(volSlider);
      rightGroup.appendChild(volumeGroup);

      const speedBtn = document.createElement('button');
      speedBtn.className = 'text-[10px] font-black w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all';
      speedBtn.textContent = '1X';
      speedBtn.onclick = () => this.cycleSpeed(speedBtn);
      rightGroup.appendChild(speedBtn);

      if (options.onModeSwitch) {
          const subBtn = this.createIconButton(this.icons.sub, options.onModeSwitch, 'Toggle Sub/Dub');
          if (options.currentMode === 'dub') subBtn.classList.add('text-accent');
          rightGroup.appendChild(subBtn);
      }

      const vlcBtn = this.createIconButton(this.icons.vlc, () => {
          window.location.href = `vlc://${options.url}`;
          this.showSkipIndicator('Opening in VLC...', 'center');
      }, 'Open in VLC');
      vlcBtn.classList.add('flex');
      rightGroup.appendChild(vlcBtn);

      const skipBtn = this.createIconButton(this.icons.skipForward, () => {
          if (this.videoElement) { this.videoElement.currentTime += 85; this.showSkipIndicator('+85s', 'center'); }
      }, 'Skip Intro');
      skipBtn.classList.add('hidden', 'md:flex');
      rightGroup.appendChild(skipBtn);

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
      overlay.appendChild(centerGroup);
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
          video.volume = parseFloat(volSlider.value);
          this.updateVolumeIcon(video.volume);
      });

      this.handleKeyDownBound = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.handleKeyDownBound);

      this.container.onmousemove = () => this.showControls();
      this.container.onmouseleave = () => this.hideControls();
      this.showControls();
  }

  showControls() {
      if (!this.controlsOverlay) return;
      this.controlsOverlay.style.opacity = '1';
      this.container.style.cursor = 'default';
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = setTimeout(() => this.hideControls(), 3000);
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
              this.updateVolumeIcon(this.videoElement.volume);
              this.showSkipIndicator(`Vol: ${Math.round(this.videoElement.volume * 100)}%`, 'center');
              break;
          case 'ArrowDown':
              e.preventDefault();
              this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.1);
              this.updateVolumeIcon(this.videoElement.volume);
              this.showSkipIndicator(`Vol: ${Math.round(this.videoElement.volume * 100)}%`, 'center');
              break;
          case 'KeyF':
              this.toggleFullscreen();
              break;
          case 'KeyM':
              this.toggleMute();
              break;
      }
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
      this.updateVolumeIcon(this.videoElement.muted ? 0 : this.videoElement.volume);
  }

  updateVolumeIcon(vol) {
      const btn = document.getElementById('player-vol-btn');
      if (btn) btn.innerHTML = vol === 0 ? this.icons.volumeMute : this.icons.volumeHigh;
  }

  cycleSpeed(btn) {
      if (!this.videoElement) return;
      const speeds = [1, 1.25, 1.5, 2];
      let current = speeds.indexOf(this.videoElement.playbackRate);
      let next = (current + 1) % speeds.length;
      this.videoElement.playbackRate = speeds[next];
      btn.textContent = speeds[next] + 'X';
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
      this.videoElement.onclick = () => this.togglePlay();
      this.videoElement.ondblclick = (e) => {
          const rect = this.videoElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width / 2) {
              this.videoElement.currentTime += 10;
              this.showSkipIndicator('+10s', 'right');
          } else {
              this.videoElement.currentTime -= 10;
              this.showSkipIndicator('-10s', 'left');
          }
      };
  }

  showSkipIndicator(text, side) {
      const i = document.createElement('div');
      let posClass = side === 'left' ? 'left-1/4' : (side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2');
      i.className = `absolute top-1/2 -translate-y-1/2 ${posClass} bg-accent/90 text-white font-black px-6 py-3 rounded-2xl fade-in z-50 shadow-2xl backdrop-blur-md border border-white/20`;
      i.textContent = text;
      this.container.appendChild(i);
      setTimeout(() => i.remove(), 800);
  }

  triggerCast() {
      if (this.videoElement && this.videoElement.remote) this.videoElement.remote.prompt();
      else alert("Cast not supported.");
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

  toggleSettings() {
      if (!this.currentOptions?.allLinks) {
          this.showSkipIndicator('No quality options', 'center');
          return;
      }

      const existing = document.getElementById('player-settings-menu');
      if (existing) { existing.remove(); return; }

      const menu = document.createElement('div');
      menu.id = 'player-settings-menu';
      menu.className = 'absolute bottom-24 right-6 bg-sidebar/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-[60] flex flex-col gap-1 min-w-[160px] shadow-2xl fade-in';
      
      const title = document.createElement('div');
      title.className = 'text-[10px] font-black uppercase tracking-widest p-2 opacity-40';
      title.textContent = 'Quality / Sources';
      menu.appendChild(title);

      this.currentOptions.allLinks.forEach((link) => {
          const item = document.createElement('button');
          const isCurrent = (link.proxyUrl || link.url) === this.currentOptions?.url;
          item.className = `flex items-center justify-between gap-4 p-3 rounded-xl text-xs font-bold transition-all hover:bg-white/5 ${isCurrent ? 'text-accent bg-accent/5' : 'text-white/60'}`;
          
          const label = document.createElement('span');
          label.textContent = `${link.resolution || 'Auto'} (${link.provider})`;
          item.appendChild(label);

          if (isCurrent) {
              const dot = document.createElement('div');
              dot.className = 'w-1.5 h-1.5 rounded-full bg-accent';
              item.appendChild(dot);
          }

          item.onclick = () => {
              this.switchQuality(link);
              menu.remove();
          };
          menu.appendChild(item);
      });

      const apToggle = document.createElement('button');
      apToggle.className = 'flex items-center justify-between gap-4 p-3 rounded-xl text-xs font-bold transition-all border-t border-white/5 mt-1 hover:bg-white/5';
      apToggle.innerHTML = `<span>Auto-Play Next</span> <span class="${this.isAutoPlayEnabled ? 'text-accent' : 'text-white/20'}">${this.isAutoPlayEnabled ? 'ON' : 'OFF'}</span>`;
      apToggle.onclick = () => {
          this.isAutoPlayEnabled = !this.isAutoPlayEnabled;
          this.showSkipIndicator(`Auto-Play: ${this.isAutoPlayEnabled ? 'ON' : 'OFF'}`, 'center');
          menu.remove();
      };
      menu.appendChild(apToggle);

      this.container.appendChild(menu);
  }

  switchQuality(link) {
      if (!this.videoElement || !this.currentOptions) return;
      const currentTime = this.videoElement.currentTime;
      const isPaused = this.videoElement.paused;

      this.currentOptions.url = link.proxyUrl || link.url;
      this.currentOptions.isHls = link.isHls;

      this.showSkipIndicator(`Switching to ${link.resolution || 'Auto'}...`, 'center');

      if (this.hlsInstance) { this.hlsInstance.destroy(); this.hlsInstance = null; }
      
      const url = this.currentOptions.url;
      if (this.currentOptions.isHls || url.includes('.m3u8')) {
          if (window.Hls && Hls.isSupported()) {
              this.hlsInstance = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = false; } });
              this.hlsInstance.loadSource(url);
              this.hlsInstance.attachMedia(this.videoElement);
          } else {
              this.videoElement.src = url;
          }
      } else {
          this.videoElement.src = url;
      }

      this.videoElement.onloadedmetadata = () => {
          this.videoElement.currentTime = currentTime;
          if (!isPaused) this.videoElement.play();
          this.videoElement.onloadedmetadata = null;
      };
  }

  toggleTheaterMode() {
      this.isTheaterMode = !this.isTheaterMode;
      if (this.isTheaterMode) {
          this.container.classList.add('theater-mode');
          this.showSkipIndicator('Theater Mode: ON', 'center');
      } else {
          this.container.classList.remove('theater-mode');
          this.showSkipIndicator('Theater Mode: OFF', 'center');
      }
  }

  createIconButton(icon, onClick, title) {
      const btn = document.createElement('button');
      btn.className = 'w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/20 active:scale-95 transition-all border border-white/5 backdrop-blur-md text-white cursor-pointer';
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
      iframe.sandbox.add('allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-presentation');
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
}

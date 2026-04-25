import AnimeAPI from './api.js';
import PlayerManager from './player.js';
import UIController from './ui.js';
import AppController from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const api = new AnimeAPI();
        const ui = new UIController(api.getProxyImageUrl.bind(api));
        const player = new PlayerManager('video-container');
        const app = new AppController(api, ui, player);
        
        app.init();
        runCinematicSequence(ui.isMobile);
    } catch (error) {
        console.error("Initialization Error:", error);
        forceClearSplash();
    }
});

function forceClearSplash() {
    document.getElementById('splash-screen')?.remove();
    document.body.classList.remove('locked');
}

function runCinematicSequence(isMobile) {
    const tl = gsap.timeline();
    tl.to("#splash-img", { scale: isMobile ? 1.2 : 1.5, opacity: 0, duration: 0.8, delay: 0.5, ease: "power4.inOut" });
    tl.to("#splash-left", { xPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.4");
    tl.to("#splash-right", { xPercent: 100, duration: 1, ease: "expo.inOut" }, "-=1");
    tl.call(() => {
        document.getElementById('splash-screen')?.remove();
        gsap.from("#app-container", { opacity: 0, duration: 0.5 });
    });
}

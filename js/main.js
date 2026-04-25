import AnimeAPI from './api.js';
import PlayerManager from './player.js';
import UIController from './ui.js';
import AppController from './app.js';

// Run immediately to avoid mobile "stuck" issues
document.addEventListener('DOMContentLoaded', () => {
    try {
        const api = new AnimeAPI();
        const player = new PlayerManager('video-container');
        const ui = new UIController(api.getProxyImageUrl.bind(api));
        const app = new AppController(api, ui, player);
        
        app.init();
        runCinematicSequence();

    } catch (error) {
        console.error("Initialization Error:", error);
        forceClearSplash();
    }
});

function forceClearSplash() {
    document.getElementById('splash-screen')?.remove();
    document.getElementById('intro-page')?.remove();
    document.getElementById('root').style.opacity = '1';
    document.getElementById('root').style.transform = 'scale(1)';
}

function runCinematicSequence() {
    const tl = gsap.timeline();

    // 1. Instant Splash Entrance (Snappier)
    tl.from("#splash-img", {
        scale: 0.2,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out"
    });

    tl.from("#splash-text", {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
    }, "-=0.4");

    // 2. Faster Gate Opening
    tl.to("#splash-img, #splash-text", {
        opacity: 0,
        scale: 1.5,
        duration: 0.4,
        delay: 0.3
    });

    tl.to("#splash-left", { xPercent: -100, duration: 1, ease: "expo.inOut" }, "split");
    tl.to("#splash-right", { xPercent: 100, duration: 1, ease: "expo.inOut" }, "split");

    tl.call(() => {
        document.getElementById('intro-page').classList.remove('hidden');
        initParticles();
    });

    // 3. Intro Reveal
    tl.fromTo("#intro-tag", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "intro-start");
    tl.fromTo("#intro-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.4");
    tl.fromTo("#intro-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.6");
    tl.fromTo("#enter-btn", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, "-=0.4");

    // Hyper Speed Interaction
    const enterBtn = document.getElementById('enter-btn');
    enterBtn.onclick = () => {
        const audioBloom = document.getElementById('audio-bloom');
        const audioWoosh = document.getElementById('audio-woosh');
        audioBloom.play().catch(() => {});
        audioWoosh.play().catch(() => {});

        const exitTl = gsap.timeline();
        
        // Warp Drive Effect
        exitTl.to("#intro-page", {
            scale: 2,
            filter: "blur(50px)",
            opacity: 0,
            duration: 1.2,
            ease: "power4.in"
        });

        // Hyper-Speed Zoom for the Content
        exitTl.fromTo("#root", {
            opacity: 0,
            scale: 0.3,
            filter: "blur(20px)"
        }, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.5,
            ease: "expo.out"
        }, "-=0.8");

        exitTl.call(() => {
            document.getElementById('intro-page').remove();
            document.getElementById('splash-screen')?.remove();
        });
    };
}

function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'absolute rounded-full bg-accent opacity-20';
        const size = Math.random() * 3 + 1;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        container.appendChild(p);

        gsap.to(p, {
            z: Math.random() * 1000,
            y: `-=${Math.random() * 200 + 100}`,
            opacity: 0,
            duration: Math.random() * 2 + 1,
            repeat: -1,
            ease: "power1.in"
        });
    }
}

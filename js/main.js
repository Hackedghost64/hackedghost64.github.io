import AnimeAPI from './api.js';
import PlayerManager from './player.js';
import UIController from './ui.js';
import AppController from './app.js';

// Use window.load for mobile reliability and assets readiness
window.addEventListener('load', () => {
    try {
        const api = new AnimeAPI();
        const player = new PlayerManager('video-container');
        const ui = new UIController(api.getProxyImageUrl.bind(api));
        const app = new AppController(api, ui, player);
        
        app.init();

        // Reveal the cinematic sequence
        runCinematicSequence();

        // Fallback: If splash is still there after 10s, force clear it
        setTimeout(() => {
            if (document.getElementById('splash-screen')) {
                console.warn("Splash screen timed out, clearing...");
                document.getElementById('splash-screen').remove();
                document.getElementById('root').style.opacity = '1';
            }
        }, 10000);

    } catch (error) {
        console.error("Initialization Error:", error);
        document.getElementById('splash-screen')?.remove();
        document.getElementById('root').style.opacity = '1';
    }
});

function runCinematicSequence() {
    const tl = gsap.timeline();

    // 1. Splash Logo Entrance
    tl.from("#splash-img", {
        scale: 0.5,
        opacity: 0,
        filter: "blur(20px)",
        duration: 1.5,
        ease: "power4.out"
    });

    tl.from("#splash-text", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=1");

    // 2. Split Screen Entrance
    tl.to("#splash-img", {
        opacity: 0,
        scale: 1.5,
        duration: 0.8,
        delay: 0.5
    });

    tl.to("#splash-left", {
        xPercent: -100,
        duration: 1.5,
        ease: "expo.inOut"
    }, "split");

    tl.to("#splash-right", {
        xPercent: 100,
        duration: 1.5,
        ease: "expo.inOut"
    }, "split");

    // 3. Reveal Intro Page
    tl.call(() => {
        document.getElementById('intro-page').classList.remove('hidden');
        initParticles();
    });

    tl.fromTo("#intro-tag", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "intro-start");
    tl.fromTo("#intro-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, "-=0.6");
    tl.fromTo("#intro-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8");
    tl.fromTo("#enter-btn", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.4");

    // Interaction & Sounds
    const enterBtn = document.getElementById('enter-btn');
    const audioBloom = document.getElementById('audio-bloom');
    const audioWoosh = document.getElementById('audio-woosh');

    enterBtn.onclick = () => {
        // Play sounds (User gesture allows audio now)
        audioBloom.volume = 0.4;
        audioWoosh.volume = 0.3;
        audioBloom.play().catch(() => {});
        audioWoosh.play().catch(() => {});

        const exitTl = gsap.timeline();
        
        exitTl.to("#intro-page", {
            opacity: 0,
            scale: 1.05,
            filter: "blur(20px)",
            duration: 1.2,
            ease: "power4.inOut"
        });

        exitTl.to("#root", {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, "-=0.6");

        exitTl.call(() => {
            document.getElementById('intro-page').remove();
            document.getElementById('splash-screen')?.remove();
        });
    };
}

function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'absolute rounded-full bg-accent opacity-20';
        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.filter = 'blur(1px)';
        
        container.appendChild(p);

        gsap.to(p, {
            y: `-=${Math.random() * 100 + 50}`,
            x: `+=${Math.random() * 40 - 20}`,
            opacity: 0,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            delay: Math.random() * 5,
            ease: "power1.out"
        });
    }
}

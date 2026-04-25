import AnimeAPI from './api.js';
import PlayerManager from './player.js';
import UIController from './ui.js';
import AppController from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const api = new AnimeAPI();
        const player = new PlayerManager('video-container');
        const ui = new UIController(api.getProxyImageUrl.bind(api));
        const app = new AppController(api, ui, player);
        
        // Initialize App Logic but keep hidden
        app.init();

        // RUN CINEMATIC SEQUENCE
        runCinematicSequence();

    } catch (error) {
        console.error("[Trace] Fatal Initialization Error:", error);
        // Fallback: hide splash if something breaks
        document.getElementById('splash-screen')?.remove();
        document.getElementById('root').style.opacity = '1';
    }
});

function runCinematicSequence() {
    const tl = gsap.timeline();

    // 1. Splash Logo Entrance
    tl.from("#splash-logo", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
    });

    tl.from("#splash-text", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.5");

    // 2. Wait and Split
    tl.to("#splash-logo", {
        opacity: 0,
        scale: 1.2,
        duration: 0.5,
        delay: 0.5
    });

    tl.to("#splash-left", {
        xPercent: -100,
        duration: 1.2,
        ease: "expo.inOut"
    }, "split");

    tl.to("#splash-right", {
        xPercent: 100,
        duration: 1.2,
        ease: "expo.inOut"
    }, "split");

    // 3. Show Intro Page
    tl.call(() => {
        document.getElementById('intro-page').classList.remove('hidden');
        document.getElementById('splash-screen').remove();
    });

    tl.to("#intro-tag", { opacity: 1, y: 0, duration: 0.8 }, "intro-start");
    tl.to("#intro-title", { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.4");
    tl.to("#intro-desc", { opacity: 1, y: 0, duration: 1 }, "-=0.6");
    tl.to("#intro-btn", { opacity: 1, y: 0, duration: 1 }, "-=0.8");
    tl.to("#enter-btn", { opacity: 1, scale: 1, duration: 0.8, ease: "back.out" }, "-=0.5");

    // Handle Enter Universe
    document.getElementById('enter-btn').onclick = () => {
        const exitTl = gsap.timeline();
        
        exitTl.to("#intro-page", {
            opacity: 0,
            scale: 1.1,
            duration: 0.8,
            ease: "power3.inOut"
        });

        exitTl.to("#root", {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, "-=0.4");

        exitTl.call(() => {
            document.getElementById('intro-page').remove();
        });
    };
}

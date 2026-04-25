import AnimeAPI from './api.js';
import PlayerManager from './player.js';
import UIController from './ui.js';
import AppController from './app.js';

const IS_MOBILE = window.innerWidth < 768 || ('ontouchstart' in window);

document.addEventListener('DOMContentLoaded', () => {
    try {
        document.body.classList.add('locked');
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
    document.body.classList.remove('locked');
    const root = document.getElementById('root');
    if (root) {
        root.style.opacity = '1';
        root.style.transform = 'none';
        root.style.filter = 'none';
        root.style.pointerEvents = 'auto';
    }
}

function runCinematicSequence() {
    const tl = gsap.timeline();
    tl.from("#splash-img", { scale: 0.1, opacity: 0, filter: "blur(20px)", duration: 0.8, ease: "expo.out" });
    tl.from("#splash-text", { y: 10, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.4");
    tl.to("#splash-img, #splash-text", { opacity: 0, scale: 1.5, duration: 0.4, delay: 0.3 });
    tl.to("#splash-left", { xPercent: -100, duration: 1, ease: "expo.inOut" }, "split");
    tl.to("#splash-right", { xPercent: 100, duration: 1, ease: "expo.inOut" }, "split");
    tl.call(() => {
        document.getElementById('intro-page').classList.remove('hidden');
        initCanvasParticles();
        if (!IS_MOBILE) initParallax();
    });
    tl.fromTo("#intro-tag", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "intro-start");
    tl.fromTo("#intro-title", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power3.out" }, "-=0.4");
    tl.fromTo("#intro-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6");
    tl.fromTo("#enter-btn", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, "-=0.4");

    const enterBtn = document.getElementById('enter-btn');
    const finalPortal = document.getElementById('final-portal');
    const suckable = document.getElementById('suckable-content');

    enterBtn.onclick = () => {
        const portalTl = gsap.timeline();
        portalTl.to("#enter-btn", { scale: 0, opacity: 0, duration: 0.4, ease: "power4.in" });
        portalTl.to("#final-portal", { width: IS_MOBILE ? 150 : 250, height: IS_MOBILE ? 150 : 250, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, 0.2);
        portalTl.to(suckable, { scale: 0, opacity: 0, rotate: 20, filter: "blur(40px)", duration: 1.2, ease: "power2.in" }, 0.2);
        portalTl.to("#intro-bg, #intro-canvas, #intro-core", { scale: 0, opacity: 0, duration: 1.5, ease: "power2.in" }, 0.2);
    };

    finalPortal.onclick = () => triggerHyperspeed();

    function triggerHyperspeed() {
        const exitTl = gsap.timeline();
        const vortexContainer = document.getElementById('vortex-container');
        vortexContainer.style.perspective = "1000px";
        
        const ringCount = IS_MOBILE ? 20 : 60;
        for(let i=0; i<ringCount; i++) {
            const ring = document.createElement('div');
            ring.className = 'vortex-ring';
            ring.style.borderColor = i % 2 === 0 ? 'var(--accent)' : '#fff';
            vortexContainer.appendChild(ring);
            
            exitTl.fromTo(ring, 
                { scale: 0, opacity: 0, z: -3000, rotationZ: Math.random() * 360 }, 
                { 
                    scale: 40, 
                    opacity: 1, 
                    z: 1000, 
                    duration: 3, 
                    ease: "power2.in", 
                    delay: i * 0.05,
                    onStart: () => ring.style.opacity = "1"
                }, 0);
        }

        const streakCount = IS_MOBILE ? 40 : 120;
        for(let i=0; i<streakCount; i++) {
            const streak = document.createElement('div');
            streak.className = 'hyperspeed-streak-3d';
            const angle = Math.random() * Math.PI * 2;
            const radius = 200 + Math.random() * 1000;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            streak.style.left = '50%';
            streak.style.top = '50%';
            streak.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, -3000px) rotate(${angle}rad)`;
            
            document.getElementById('intro-page').appendChild(streak);
            
            exitTl.to(streak, {
                z: 2000,
                opacity: 1,
                duration: 2,
                ease: "power4.in",
                delay: Math.random() * 1.5,
                startAt: { z: -3000, opacity: 0 }
            }, 0.1);
        }

        exitTl.to("#final-portal", { scale: 0, opacity: 0, duration: 1.2, ease: "power4.in" }, 0.2);
        exitTl.to("#intro-content", { scale: 1.5, opacity: 0, filter: "blur(20px)", duration: 1, ease: "power2.in" }, 0);
        
        exitTl.call(() => {
            const root = document.getElementById('root');
            root.style.opacity = '1'; root.style.transform = 'scale(1)';
            gsap.set("aside, header, #main-content", { opacity: 0 });
        }, null, 2.5);
        
        exitTl.to("#flash-overlay", { opacity: 1, duration: 0.1 }, 2.5);
        exitTl.to("#flash-overlay", { opacity: 0, duration: 1, ease: "power2.out" }, 2.6);
        exitTl.to("#intro-page", { opacity: 0, duration: 0.8 }, 2.6);
        
        exitTl.to("aside", { x: 0, opacity: 1, duration: 1, ease: "power3.out", startAt: {x: -300} }, 2.8);
        exitTl.to("header", { y: 0, opacity: 1, duration: 1, ease: "power3.out", startAt: {y: -100} }, 2.9);
        exitTl.to("#main-content", { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", startAt: {y: 50} }, 3.0);
        exitTl.from(".anime-card", { 
            scale: 0.8, opacity: 0, stagger: 0.02, duration: 0.8, ease: "power2.out",
            onComplete: () => {
                document.body.classList.remove('locked');
                document.getElementById('root').style.pointerEvents = 'auto';
                document.getElementById('intro-page')?.remove();
                document.getElementById('splash-screen')?.remove();
            }
        }, 3.2);
    }
}

function initCanvasParticles() {
    const canvas = document.getElementById('intro-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.size = Math.random() * (IS_MOBILE ? 1.5 : 2.5) + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4; this.speedY = (Math.random() - 0.5) * 0.4;
            this.alpha = Math.random() * 0.5;
        }
        update() { this.x += this.speedX; this.y += this.speedY; if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset(); }
        draw() { ctx.fillStyle = `rgba(139, 92, 246, ${this.alpha})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }
    for (let i = 0; i < (IS_MOBILE ? 60 : 150); i++) particles.push(new Particle());
    const animate = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); };
    animate();
}

function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        gsap.to("#intro-content", { rotateY: x / 3, rotateX: -y / 3, x: x / 2, y: y / 2, duration: 1.2, ease: "power2.out" });
        gsap.to("#intro-core", { x: -x * 3, y: -y * 3, duration: 2, ease: "power2.out" });
    });
}

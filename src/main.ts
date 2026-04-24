import { AnimeAPI } from './api';
import { UIController } from './ui';
import { PlayerManager } from './player';
import { AppController } from './app-controller';
import './index.css';

// Defensive check: Wait for the HTML to be fully parsed before binding UI classes
document.addEventListener('DOMContentLoaded', () => {
    try {
        const api = new AnimeAPI();
        const player = new PlayerManager('video-container');
        const ui = new UIController(api.getProxyImageUrl.bind(api));
        const app = new AppController(api, ui, player);
        
        app.init();
        console.log("[Trace] AnimeVerse Engine Initialized.");
    } catch (error) {
        console.error("[Trace] Fatal Initialization Error:", error);
    }
});

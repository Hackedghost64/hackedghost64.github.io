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
        
        app.init();
    } catch (error) {
        console.error("[Trace] Fatal Initialization Error:", error);
    }
});

/**
 * Storage Manager - Handles all localStorage operations
 */
import { STORAGE_KEYS } from '../utils/constants.js';

export class StorageManager {
    /**
     * Save playlist data
     */
    static savePlaylist(playlist, currentIndex, currentPlaylistId, repeatMode, isShuffle) {
        try {
            localStorage.setItem(STORAGE_KEYS.PLAYLIST, JSON.stringify(playlist));
            localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentIndex.toString());
            localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYLIST_ID, currentPlaylistId || '');
            localStorage.setItem(STORAGE_KEYS.REPEAT_MODE, repeatMode.toString());
            localStorage.setItem(STORAGE_KEYS.SHUFFLE, isShuffle.toString());
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    }

    /**
     * Load playlist data
     */
    static loadPlaylist() {
        try {
            const playlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLIST) || '[]');
            const currentIndex = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX) || '-1');
            const currentPlaylistId = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYLIST_ID) || null;
            const repeatMode = parseInt(localStorage.getItem(STORAGE_KEYS.REPEAT_MODE) || '0');
            const isShuffle = localStorage.getItem(STORAGE_KEYS.SHUFFLE) === 'true';

            return {
                playlist: Array.isArray(playlist) ? playlist : [],
                currentIndex,
                currentPlaylistId,
                repeatMode,
                isShuffle
            };
        } catch (error) {
            console.error('Error loading playlist:', error);
            return {
                playlist: [],
                currentIndex: -1,
                currentPlaylistId: null,
                repeatMode: 0,
                isShuffle: false
            };
        }
    }

    /**
     * Save custom playlists
     */
    static saveCustomPlaylists(customPlaylists, nextPlaylistId) {
        try {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_PLAYLISTS, JSON.stringify(customPlaylists));
            localStorage.setItem(STORAGE_KEYS.NEXT_PLAYLIST_ID, nextPlaylistId.toString());
        } catch (error) {
            console.error('Error saving custom playlists:', error);
        }
    }

    /**
     * Load custom playlists
     */
    static loadCustomPlaylists() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLAYLISTS);
            const customPlaylists = saved ? JSON.parse(saved) : {};
            
            if (!customPlaylists || typeof customPlaylists !== 'object') {
                return { customPlaylists: {}, nextPlaylistId: 1 };
            }

            const savedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_PLAYLIST_ID);
            const nextPlaylistId = savedNextId ? parseInt(savedNextId) : 1;

            return { customPlaylists, nextPlaylistId };
        } catch (error) {
            console.error('Error loading custom playlists:', error);
            return { customPlaylists: {}, nextPlaylistId: 1 };
        }
    }

    /**
     * Save recent data (tracks, playlists, search history)
     */
    static saveRecentData(recentTracks, recentPlaylists, searchHistory) {
        try {
            localStorage.setItem(STORAGE_KEYS.RECENT_DATA, JSON.stringify({
                tracks: recentTracks,
                playlists: recentPlaylists,
                searchHistory: searchHistory
            }));
        } catch (error) {
            console.error('Error saving recent data:', error);
        }
    }

    /**
     * Load recent data
     */
    static loadRecentData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.RECENT_DATA);
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    tracks: Array.isArray(data.tracks) ? data.tracks : [],
                    playlists: Array.isArray(data.playlists) ? data.playlists : [],
                    searchHistory: Array.isArray(data.searchHistory) ? data.searchHistory : []
                };
            }
        } catch (error) {
            console.error('Error loading recent data:', error);
        }
        
        return {
            tracks: [],
            playlists: [],
            searchHistory: []
        };
    }

    /**
     * Save lyrics cache
     */
    static saveLyricsCache(lyricsCache) {
        try {
            localStorage.setItem(STORAGE_KEYS.LYRICS_CACHE, JSON.stringify(lyricsCache));
        } catch (error) {
            console.warn('Could not save lyrics cache:', error);
        }
    }

    /**
     * Load lyrics cache
     */
    static loadLyricsCache() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.LYRICS_CACHE);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('Could not load lyrics cache:', error);
            return {};
        }
    }

    /**
     * Save explore cache
     */
    static saveExploreCache(exploreCache) {
        try {
            localStorage.setItem(STORAGE_KEYS.EXPLORE_CACHE, JSON.stringify(exploreCache));
        } catch (error) {
            console.warn('Could not save explore cache:', error);
        }
    }

    /**
     * Load explore cache
     */
    static loadExploreCache() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.EXPLORE_CACHE);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('Could not load explore cache:', error);
            return {};
        }
    }

    /**
     * Clear all application data
     */
    static async clearAllData() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mytehran')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Clear Service Worker cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('mytehran')) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }

            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}



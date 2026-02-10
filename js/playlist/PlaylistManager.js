/**
 * Playlist Manager - Manages custom playlists and favorites
 */
import { FAVORITE_PLAYLIST_ID } from '../utils/constants.js';
import { normalizeUrl, isSameTrack } from '../utils/helpers.js';
import { StorageManager } from '../storage/StorageManager.js';

export class PlaylistManager {
    constructor() {
        this.customPlaylists = {};
        this.nextPlaylistId = 1;
        this.currentPlaylistId = null;
        this.loadPlaylists();
    }

    /**
     * Load playlists from storage
     */
    loadPlaylists() {
        const { customPlaylists, nextPlaylistId } = StorageManager.loadCustomPlaylists();
        this.customPlaylists = customPlaylists;
        this.nextPlaylistId = nextPlaylistId;
        
        // Initialize favorite playlist if needed
        if (!this.customPlaylists[FAVORITE_PLAYLIST_ID]) {
            this.customPlaylists[FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true
            };
            this.savePlaylists();
        }
    }

    /**
     * Save playlists to storage
     */
    savePlaylists() {
        StorageManager.saveCustomPlaylists(this.customPlaylists, this.nextPlaylistId);
    }

    /**
     * Create a new playlist
     */
    createPlaylist(name, trackToAdd = null) {
        if (!name || !name.trim()) {
            throw new Error('نام پلی‌لیست نمی‌تواند خالی باشد');
        }

        const id = this.nextPlaylistId++;
        this.customPlaylists[id] = {
            name: name.trim(),
            tracks: [],
            downloaded: false
        };

        if (trackToAdd) {
            this.addTrackToPlaylist(id, trackToAdd);
        }

        this.savePlaylists();
        return id;
    }

    /**
     * Delete a playlist
     */
    deletePlaylist(playlistId) {
        if (playlistId === FAVORITE_PLAYLIST_ID) {
            throw new Error('نمی‌توان پلی‌لیست علاقه‌مندی‌ها را حذف کرد');
        }

        delete this.customPlaylists[playlistId];
        this.savePlaylists();
    }

    /**
     * Get playlist by ID
     */
    getPlaylist(playlistId) {
        return this.customPlaylists[playlistId] || null;
    }

    /**
     * Get all playlists
     */
    getAllPlaylists() {
        return Object.entries(this.customPlaylists);
    }

    /**
     * Add track to playlist
     */
    addTrackToPlaylist(playlistId, track) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) {
            throw new Error('پلی‌لیست یافت نشد');
        }

        // Check if track already exists
        const existingTrack = playlist.tracks.find(t => {
            const trackUrl = normalizeUrl(track.url);
            const trackPageUrl = track.pageUrl ? normalizeUrl(track.pageUrl) : null;
            const existingUrl = normalizeUrl(t.url);
            const existingPageUrl = t.pageUrl ? normalizeUrl(t.pageUrl) : null;

            return existingUrl === trackUrl ||
                   (trackPageUrl && existingPageUrl === trackPageUrl) ||
                   (trackPageUrl && existingUrl === trackPageUrl) ||
                   (existingPageUrl && trackUrl === existingPageUrl);
        });

        if (existingTrack) {
            throw new Error('این موزیک قبلا در پلی‌لیست است');
        }

        playlist.tracks.push({ ...track });
        playlist.downloaded = false; // Reset download status
        this.savePlaylists();
    }

    /**
     * Remove track from playlist
     */
    removeTrackFromPlaylist(playlistId, trackIndex) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) {
            throw new Error('پلی‌لیست یافت نشد');
        }

        if (trackIndex < 0 || trackIndex >= playlist.tracks.length) {
            throw new Error('ایندکس نامعتبر');
        }

        playlist.tracks.splice(trackIndex, 1);
        playlist.downloaded = false; // Reset download status
        this.savePlaylists();
    }

    /**
     * Check if track is in favorites
     */
    isTrackInFavorites(track) {
        const favoritePlaylist = this.customPlaylists[FAVORITE_PLAYLIST_ID];
        if (!favoritePlaylist || !favoritePlaylist.tracks) {
            return false;
        }

        const trackUrl = normalizeUrl(track.url);
        const trackPageUrl = track.pageUrl ? normalizeUrl(track.pageUrl) : null;

        return favoritePlaylist.tracks.some(t => {
            const existingUrl = normalizeUrl(t.url);
            const existingPageUrl = t.pageUrl ? normalizeUrl(t.pageUrl) : null;

            return existingUrl === trackUrl ||
                   (trackPageUrl && existingPageUrl === trackPageUrl) ||
                   (trackPageUrl && existingUrl === trackPageUrl) ||
                   (existingPageUrl && trackUrl === existingPageUrl);
        });
    }

    /**
     * Toggle favorite status of a track
     */
    toggleFavorite(track) {
        const favoritePlaylist = this.customPlaylists[FAVORITE_PLAYLIST_ID];
        if (!favoritePlaylist) {
            this.customPlaylists[FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true
            };
        }

        const trackUrl = normalizeUrl(track.url);
        const trackPageUrl = track.pageUrl ? normalizeUrl(track.pageUrl) : null;

        const existingIndex = favoritePlaylist.tracks.findIndex(t => {
            const existingUrl = normalizeUrl(t.url);
            const existingPageUrl = t.pageUrl ? normalizeUrl(t.pageUrl) : null;

            return existingUrl === trackUrl ||
                   (trackPageUrl && existingPageUrl === trackPageUrl) ||
                   (trackPageUrl && existingUrl === trackPageUrl) ||
                   (existingPageUrl && trackUrl === existingPageUrl);
        });

        if (existingIndex !== -1) {
            // Remove from favorites
            favoritePlaylist.tracks.splice(existingIndex, 1);
            this.savePlaylists();
            return false;
        } else {
            // Add to favorites
            favoritePlaylist.tracks.push({ ...track });
            this.savePlaylists();
            return true;
        }
    }

    /**
     * Set current playlist ID
     */
    setCurrentPlaylistId(playlistId) {
        this.currentPlaylistId = playlistId;
    }

    /**
     * Get current playlist ID
     */
    getCurrentPlaylistId() {
        return this.currentPlaylistId;
    }

    /**
     * Get current playlist
     */
    getCurrentPlaylist() {
        return this.currentPlaylistId ? this.customPlaylists[this.currentPlaylistId] : null;
    }
}



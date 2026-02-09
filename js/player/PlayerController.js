/**
 * Player Controller - Manages audio playback and player state
 */
import { REPEAT_MODES } from '../utils/constants.js';
import { formatTime } from '../utils/helpers.js';

export class PlayerController {
    constructor(audioElement, callbacks = {}) {
        if (!audioElement) {
            throw new Error('Audio element is required');
        }
        this.audio = audioElement;
        this.playlist = [];
        this.currentIndex = -1;
        this.isShuffle = false;
        this.repeatMode = REPEAT_MODES.OFF;
        this.shuffledIndices = [];
        this.currentTrack = null;
        this.isDraggingProgress = false;
        this.isDraggingPlayerProgress = false;
        this.callbacks = callbacks; // Store callbacks for external handlers

        this._setupAudioEvents();
    }

    /**
     * Setup audio element event listeners
     * @private
     */
    _setupAudioEvents() {
        this.audio.addEventListener('ended', () => this._handleTrackEnd());
        this.audio.addEventListener('error', () => this._handleError());
        this.audio.addEventListener('timeupdate', () => this._onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this._onMetadataLoaded());
    }

    /**
     * Handle track end
     * @private
     */
    _handleTrackEnd() {
        if (this.repeatMode === REPEAT_MODES.ONE) {
            // Repeat one: play the same track again
            this.audio.currentTime = 0;
            this.audio.play().catch(console.error);
        } else {
            // Play next track
            this.playNext();
        }
        // Call external callback if provided
        if (this.callbacks.onTrackEnd) {
            this.callbacks.onTrackEnd();
        }
    }

    /**
     * Handle audio error
     * @private
     */
    _handleError() {
        console.error('Audio playback error');
        // Call external callback if provided
        if (this.callbacks.onError) {
            this.callbacks.onError();
        }
    }

    /**
     * Handle time update
     * @private
     */
    _onTimeUpdate() {
        // Will be handled by caller via callback
    }

    /**
     * Handle metadata loaded
     * @private
     */
    _onMetadataLoaded() {
        // Will be handled by caller via callback
    }

    /**
     * Set playlist
     */
    setPlaylist(playlist) {
        this.playlist = Array.isArray(playlist) ? playlist : [];
        if (this.isShuffle) {
            this.generateShuffledIndices();
        }
    }

    /**
     * Set current track index
     */
    setCurrentIndex(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentIndex = index;
        } else {
            this.currentIndex = -1;
        }
    }

    /**
     * Load and play a track
     */
    async loadAndPlay(track) {
        if (!track || !track.url) {
            throw new Error('Invalid track');
        }

        this.currentTrack = track;
        this.audio.src = track.url;
        
        try {
            await this.audio.load();
            await this.audio.play();
        } catch (error) {
            console.error('Error loading/playing track:', error);
            throw error;
        }
    }

    /**
     * Play current track
     */
    async play() {
        if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
            const track = this.playlist[this.currentIndex];
            await this.loadAndPlay(track);
        }
    }

    /**
     * Pause playback
     */
    pause() {
        this.audio.pause();
    }

    /**
     * Toggle play/pause
     */
    async togglePlayPause() {
        if (this.audio.paused) {
            if (this.currentIndex < 0 && this.playlist.length > 0) {
                this.currentIndex = 0;
                await this.play();
            } else {
                await this.audio.play();
            }
        } else {
            this.audio.pause();
        }
    }

    /**
     * Play next track
     */
    async playNext() {
        if (this.playlist.length === 0) return;

        let nextIndex;
        if (this.isShuffle && this.shuffledIndices.length > 0) {
            const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentIndex);
            if (currentShuffledIndex >= 0 && currentShuffledIndex < this.shuffledIndices.length - 1) {
                nextIndex = this.shuffledIndices[currentShuffledIndex + 1];
            } else {
                // Regenerate shuffle if at end
                this.generateShuffledIndices();
                nextIndex = this.shuffledIndices[0];
            }
        } else {
            nextIndex = (this.currentIndex + 1) % this.playlist.length;
        }

        if (this.repeatMode === REPEAT_MODES.OFF && nextIndex === 0 && this.currentIndex === this.playlist.length - 1) {
            // End of playlist, no repeat
            this.pause();
            return;
        }

        this.currentIndex = nextIndex;
        await this.play();
    }

    /**
     * Play previous track
     */
    async playPrevious() {
        if (this.playlist.length === 0) return;

        let prevIndex;
        if (this.isShuffle && this.shuffledIndices.length > 0) {
            const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentIndex);
            if (currentShuffledIndex > 0) {
                prevIndex = this.shuffledIndices[currentShuffledIndex - 1];
            } else {
                prevIndex = this.shuffledIndices[this.shuffledIndices.length - 1];
            }
        } else {
            prevIndex = this.currentIndex <= 0 ? this.playlist.length - 1 : this.currentIndex - 1;
        }

        this.currentIndex = prevIndex;
        await this.play();
    }

    /**
     * Toggle shuffle mode
     */
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        if (this.isShuffle) {
            this.generateShuffledIndices();
        }
    }

    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
    }

    /**
     * Generate shuffled indices using Fisher-Yates algorithm
     */
    generateShuffledIndices() {
        this.shuffledIndices = Array.from({ length: this.playlist.length }, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
        }
    }

    /**
     * Seek to position
     */
    seekToPosition(percentage) {
        if (this.audio.duration && !isNaN(percentage)) {
            const clampedPercentage = Math.max(0, Math.min(1, percentage));
            this.audio.currentTime = clampedPercentage * this.audio.duration;
        }
    }

    /**
     * Get current time formatted
     */
    getCurrentTimeFormatted() {
        return formatTime(this.audio.currentTime || 0);
    }

    /**
     * Get total time formatted
     */
    getTotalTimeFormatted() {
        return formatTime(this.audio.duration || 0);
    }

    /**
     * Get progress percentage
     */
    getProgressPercentage() {
        if (!this.audio.duration || this.audio.duration === 0) return 0;
        return (this.audio.currentTime / this.audio.duration) * 100;
    }

    /**
     * Check if audio is playing
     */
    isPlaying() {
        return !this.audio.paused;
    }

    /**
     * Get current track
     */
    getCurrentTrack() {
        return this.currentTrack;
    }

    /**
     * Cache audio file using Service Worker
     * Silently fails if caching is not possible (CORS, network issues, etc.)
     * This is a best-effort operation and failures are expected for CORS-protected URLs
     */
    async cacheAudio(audioUrl) {
        if (!audioUrl || typeof audioUrl !== 'string') {
            return; // Invalid URL, skip caching
        }
        
        if ('serviceWorker' in navigator && 'caches' in window) {
            try {
                const cache = await caches.open('mytehran-audio-v1');
                const cached = await cache.match(audioUrl);
                if (!cached) {
                    try {
                        await cache.add(audioUrl);
                        console.log('Audio cached successfully:', audioUrl);
                    } catch (addError) {
                        // CORS or network error - this is expected and normal for cross-origin audio files
                        // Silently fail - don't log as error since this is expected behavior
                        // Most audio files from external domains cannot be cached due to CORS policy
                        // Only log unexpected errors for debugging
                        if (addError.name !== 'TypeError' || 
                            (!addError.message.includes('Failed to fetch') && 
                             !addError.message.includes('network') &&
                             !addError.message.includes('CORS'))) {
                            // Unexpected error - log for debugging
                            console.debug('Cache add error (unexpected):', addError);
                        }
                        // Otherwise silently ignore - CORS failures are normal and expected
                    }
                }
            } catch (error) {
                // Cache API errors (e.g., quota exceeded, service worker not ready)
                // Silently fail - these are non-critical
                console.debug('Cache API error (non-critical):', error.message);
            }
        }
    }
}


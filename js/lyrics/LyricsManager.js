/**
 * Lyrics Manager - Handles lyrics extraction and caching
 */
import { ApiClient } from '../api/ApiClient.js';
import { normalizeUrl, cleanLyricsText, formatLyrics, formatLyricsForPage } from '../utils/helpers.js';
import { StorageManager } from '../storage/StorageManager.js';

export class LyricsManager {
    constructor() {
        this.lyricsCache = {};
        this.loadLyricsCache();
    }

    /**
     * Load lyrics cache from storage
     */
    loadLyricsCache() {
        this.lyricsCache = StorageManager.loadLyricsCache();
    }

    /**
     * Save lyrics cache to storage
     */
    saveLyricsCache() {
        StorageManager.saveLyricsCache(this.lyricsCache);
    }

    /**
     * Get cache key for track
     */
    getCacheKey(track) {
        if (!track) return null;
        const url = track.pageUrl || track.url;
        if (!url) return null;
        return normalizeUrl(url);
    }

    /**
     * Get cached lyrics
     */
    getCachedLyrics(track) {
        const cacheKey = this.getCacheKey(track);
        if (!cacheKey) return null;
        return this.lyricsCache[cacheKey];
    }

    /**
     * Cache lyrics
     */
    cacheLyrics(track, lyrics) {
        const cacheKey = this.getCacheKey(track);
        if (!cacheKey) return;
        this.lyricsCache[cacheKey] = lyrics;
        this.saveLyricsCache();
    }

    /**
     * Clear cache for track
     */
    clearCache(track) {
        const cacheKey = this.getCacheKey(track);
        if (cacheKey && this.lyricsCache[cacheKey]) {
            delete this.lyricsCache[cacheKey];
            this.saveLyricsCache();
        }
    }

    /**
     * Extract lyrics from track page
     */
    async extractLyrics(track, forceReload = false) {
        if (!track) return null;

        // Check cache first
        if (!forceReload) {
            const cached = this.getCachedLyrics(track);
            if (cached !== undefined) {
                if (typeof cached === 'string' && cached.trim()) {
                    return cached;
                } else {
                    return null; // Cached as "no lyrics found"
                }
            }
        }

        const pageUrl = track.pageUrl || track.url;
        if (!pageUrl) return null;

        try {
            const html = await ApiClient.fetchTrackPage(pageUrl);
            const lyrics = this.parseLyrics(html);

            if (lyrics && lyrics.trim()) {
                this.cacheLyrics(track, lyrics);
                return lyrics;
            } else {
                // Cache empty string to avoid retrying
                this.cacheLyrics(track, '');
                return null;
            }
        } catch (error) {
            console.error('Error extracting lyrics:', error);
            throw error;
        }
    }

    /**
     * Parse lyrics from HTML
     */
    parseLyrics(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const contentp = doc.querySelector('.contentp');
        if (!contentp) return null;

        // Pattern 1: Check if there's exactly one div inside contentp with br tags
        const innerDivs = contentp.querySelectorAll(':scope > div');
        if (innerDivs.length === 1) {
            const firstDiv = innerDivs[0];
            const hasBrTags = contentp.querySelectorAll('br').length > 0;

            if (hasBrTags) {
                let lyricsText = '';
                let foundFirstDiv = false;

                for (const node of contentp.childNodes) {
                    if (node === firstDiv) {
                        foundFirstDiv = true;
                        continue;
                    }
                    if (foundFirstDiv) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            lyricsText += node.textContent;
                        } else if (node.nodeName === 'BR') {
                            lyricsText += '\n';
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            lyricsText += node.textContent;
                        }
                    }
                }

                lyricsText = cleanLyricsText(lyricsText);
                if (lyricsText.length >= 10) {
                    return lyricsText;
                }
            }
        }

        // Pattern 2: Find the last non-br, non-text element and extract after it
        const allNodes = Array.from(contentp.childNodes);
        let lastNonBrTextIndex = -1;

        for (let i = allNodes.length - 1; i >= 0; i--) {
            const node = allNodes[i];
            const isBr = node.nodeName === 'BR';
            const isText = node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '';

            if (!isBr && !isText) {
                lastNonBrTextIndex = i;
                break;
            }
        }

        if (lastNonBrTextIndex >= 0 && lastNonBrTextIndex < allNodes.length - 1) {
            let lyricsText = '';

            for (let i = lastNonBrTextIndex + 1; i < allNodes.length; i++) {
                const node = allNodes[i];
                if (node.nodeType === Node.TEXT_NODE) {
                    lyricsText += node.textContent;
                } else if (node.nodeName === 'BR') {
                    lyricsText += '\n';
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.nodeName === 'BR') {
                        lyricsText += '\n';
                    } else {
                        lyricsText += node.textContent;
                    }
                }
            }

            lyricsText = cleanLyricsText(lyricsText);
            if (lyricsText.length >= 10) {
                return lyricsText;
            }
        }

        return null;
    }

    /**
     * Format lyrics for display in player section
     */
    formatLyricsForPlayer(lyrics) {
        return formatLyrics(lyrics);
    }

    /**
     * Format lyrics for display on lyrics page
     */
    formatLyricsForLyricsPage(lyrics) {
        return formatLyricsForPage(lyrics);
    }
}


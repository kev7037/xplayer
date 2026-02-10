/**
 * Explore Manager - Handles explore page functionality
 */
import { ApiClient } from '../api/ApiClient.js';
import { generateTrackId, normalizeUrl } from '../utils/helpers.js';
import { StorageManager } from '../storage/StorageManager.js';

export class ExploreManager {
    constructor() {
        this.exploreCache = {};
        this.currentExploreType = null;
        this.currentExplorePage = 1;
        this.exploreHasMore = false;
        this.exploreLoading = false;
        this.loadExploreCache();
    }

    /**
     * Load explore cache from storage
     */
    loadExploreCache() {
        this.exploreCache = StorageManager.loadExploreCache();
    }

    /**
     * Save explore cache to storage
     */
    saveExploreCache() {
        StorageManager.saveExploreCache(this.exploreCache);
    }

    /**
     * Get cache key for URL
     */
    getCacheKey(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.origin + urlObj.pathname;
        } catch (e) {
            return url.split('?')[0].split('#')[0];
        }
    }

    /**
     * Get cached items
     */
    getCachedItems(url) {
        const cacheKey = this.getCacheKey(url);
        const cached = this.exploreCache[cacheKey];

        if (cached && cached.items) {
            // Cache is valid for 1 hour
            const cacheAge = Date.now() - cached.timestamp;
            if (cacheAge < 3600000) {
                return cached.items;
            }
        }

        return null;
    }

    /**
     * Cache items
     */
    cacheItems(url, items) {
        if (!items || items.length === 0) return;

        const cacheKey = this.getCacheKey(url);
        this.exploreCache[cacheKey] = {
            items: items,
            timestamp: Date.now()
        };
        this.saveExploreCache();
    }

    /**
     * Check if items have changed
     */
    hasItemsChanged(oldItems, newItems) {
        if (!oldItems || oldItems.length === 0) return true;
        if (!newItems || newItems.length === 0) return false;
        if (oldItems.length !== newItems.length) return true;

        for (let i = 0; i < Math.min(oldItems.length, newItems.length); i++) {
            if (oldItems[i].title !== newItems[i].title ||
                oldItems[i].artist !== newItems[i].artist) {
                return true;
            }
        }

        return false;
    }

    /**
     * Fetch explore items
     */
    async fetchExploreItems(url, limit = 5, retryCount = 0, maxRetries = 1) {
        try {
            const html = await ApiClient.fetchExplorePage(url);
            const parsedResult = this.parseExploreItems(html, limit);

            // Cache result if limit is 5 (first 5 items)
            if (limit === 5 && parsedResult.items.length > 0) {
                this.cacheItems(url, parsedResult.items);
            }

            return parsedResult;
        } catch (error) {
            console.error('Error fetching explore items:', error);
            
            // Try to use cached data as fallback
            const cachedItems = this.getCachedItems(url);
            if (cachedItems && cachedItems.length > 0) {
                console.log('Using cached explore items as fallback');
                return { items: cachedItems.slice(0, limit), hasMore: false };
            }
            
            // Retry if we have retries left
            if (retryCount < maxRetries) {
                const delay = (retryCount + 1) * 500; // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchExploreItems(url, limit, retryCount + 1, maxRetries);
            }
            
            // Return empty result if all retries failed
            return { items: [], hasMore: false };
        }
    }

    /**
     * Parse explore items from HTML
     */
    parseExploreItems(html, limit = 5) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];

        let gridItems = doc.querySelectorAll('div.grid-item');

        if (gridItems.length === 0) {
            gridItems = doc.querySelectorAll('article, .post-item, .item, [class*="grid"], [class*="item"]');
        }

        gridItems.forEach((gridItem, index) => {
            if (index >= limit) return;

            let playButton = gridItem.querySelector('div.mcpplay');
            if (!playButton) {
                playButton = gridItem.querySelector('[data-music], [data-track], .play-button');
            }

            const trackTitle = playButton ? (playButton.getAttribute('data-track') || '') : '';
            const artist = playButton ? (playButton.getAttribute('data-artist') || 'ناشناس') : 'ناشناس';
            const imageUrl = playButton ? (playButton.getAttribute('data-image') || '') : '';
            const musicUrl = playButton ? (playButton.getAttribute('data-music') || '') : '';

            let title = trackTitle;
            let image = imageUrl;
            let url = musicUrl;
            let pageUrl = '';

            if (!title) {
                const titleEl = gridItem.querySelector('div.title a, h2 a, h3 a');
                if (titleEl) title = titleEl.textContent.trim();
            }

            let finalArtist = artist;
            if (!finalArtist || finalArtist === 'ناشناس') {
                const artistEl = gridItem.querySelector('div.artist a');
                if (artistEl) finalArtist = artistEl.textContent.trim();
            }

            if (!image) {
                const imgEl = gridItem.querySelector('div.img img, img[src*="timthumb"]');
                if (imgEl) image = imgEl.src || imgEl.getAttribute('src') || '';
            }

            const pageLink = gridItem.querySelector('div.title a, div.img a');
            if (pageLink) {
                pageUrl = pageLink.href || pageLink.getAttribute('href') || '';
                if (pageUrl && !pageUrl.startsWith('http')) {
                    pageUrl = `https://mytehranmusic.com${pageUrl}`;
                }
            }

            if (!url && pageUrl) {
                url = pageUrl;
            }

            // Normalize URLs
            if (image && !image.startsWith('http') && !image.startsWith('data:')) {
                if (image.startsWith('//')) image = 'https:' + image;
                else if (image.startsWith('/')) image = 'https://mytehranmusic.com' + image;
                else image = 'https://mytehranmusic.com/' + image;
            }

            if (url && !url.startsWith('http') && !url.startsWith('data:')) {
                if (url.startsWith('//')) url = 'https:' + url;
                else if (url.startsWith('/')) url = 'https://mytehranmusic.com' + url;
                else url = 'https://mytehranmusic.com/' + url;
            }

            if (title && url) {
                results.push({
                    id: generateTrackId(index),
                    title: title.trim(),
                    artist: finalArtist.trim() || 'ناشناس',
                    url: url,
                    image: image || '',
                    pageUrl: pageUrl || url
                });
            }
        });

        const hasMore = this.checkForMorePages(doc);

        return { items: results, hasMore };
    }

    /**
     * Check for more pages
     */
    checkForMorePages(doc) {
        const nextLink = doc.querySelector('a.next.page-numbers, .pagination a.next');
        return !!nextLink;
    }

    /**
     * Get URL for explore type
     */
    getExploreUrl(type, page = 1) {
        const urls = {
            latest: page === 1 ? 'https://mytehranmusic.com/' : `https://mytehranmusic.com/page/${page}/`,
            topMonthly: page === 1 ? 'https://mytehranmusic.com/top-month-tehranmusic/' : `https://mytehranmusic.com/top-month-tehranmusic/page/${page}/`,
            podcasts: page === 1 ? 'https://mytehranmusic.com/podcasts/' : `https://mytehranmusic.com/podcasts/page/${page}/`
        };

        return urls[type] || urls.latest;
    }

    /**
     * Get title for explore type
     */
    getExploreTitle(type) {
        const titles = {
            latest: 'آهنگ‌های جدید',
            topMonthly: 'برترین‌های ماه',
            podcasts: 'پادکست‌ها'
        };

        return titles[type] || titles.latest;
    }
}



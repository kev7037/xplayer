/**
 * Search Manager - Handles search functionality and results
 */
import { ApiClient } from '../api/ApiClient.js';
import { generateTrackId } from '../utils/helpers.js';
import { StorageManager } from '../storage/StorageManager.js';

export class SearchManager {
    constructor() {
        this.searchResults = [];
        this.currentSearchQuery = '';
        this.currentSearchPage = 1;
        this.isLoadingMore = false;
        this.hasMoreResults = true;
        this.searchHistory = [];
        this.loadSearchHistory();
    }

    /**
     * Load search history from storage
     */
    loadSearchHistory() {
        const recentData = StorageManager.loadRecentData();
        this.searchHistory = recentData.searchHistory || [];
    }

    /**
     * Save search history to storage
     */
    saveSearchHistory() {
        const recentData = StorageManager.loadRecentData();
        StorageManager.saveRecentData(
            recentData.tracks,
            recentData.playlists,
            this.searchHistory
        );
    }

    /**
     * Add query to search history
     */
    addToSearchHistory(query) {
        if (!query || !query.trim()) return;

        if (!Array.isArray(this.searchHistory)) {
            this.searchHistory = [];
        }

        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        // Add to beginning
        this.searchHistory.unshift(query.trim());
        // Keep only last 10
        this.searchHistory = this.searchHistory.slice(0, 10);
        this.saveSearchHistory();
    }

    /**
     * Remove item from search history
     */
    removeFromSearchHistory(index) {
        if (!Array.isArray(this.searchHistory)) return;
        if (index < 0 || index >= this.searchHistory.length) return;

        this.searchHistory.splice(index, 1);
        this.saveSearchHistory();
    }

    /**
     * Get search history
     */
    getSearchHistory() {
        return this.searchHistory;
    }

    /**
     * Search for tracks
     */
    async search(query, page = 1) {
        if (!query || !query.trim()) {
            throw new Error('لطفا نام موزیک را وارد کنید');
        }

        this.currentSearchQuery = query.trim();
        this.currentSearchPage = page;
        this.addToSearchHistory(this.currentSearchQuery);

        try {
            const html = await ApiClient.fetchSearchResults(query, page);
            const result = this.parseSearchResults(html, query, page);
            
            if (page === 1) {
                this.searchResults = result.results || [];
            } else {
                this.searchResults = [...this.searchResults, ...(result.results || [])];
            }

            this.hasMoreResults = result.hasMore !== false;
            return result;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    /**
     * Load more search results
     */
    async loadMoreResults() {
        if (this.isLoadingMore || !this.hasMoreResults || !this.currentSearchQuery) {
            return null;
        }

        this.isLoadingMore = true;
        try {
            const nextPage = this.currentSearchPage + 1;
            const result = await this.search(this.currentSearchQuery, nextPage);
            this.currentSearchPage = nextPage;
            this.isLoadingMore = false;
            return result;
        } catch (error) {
            this.isLoadingMore = false;
            throw error;
        }
    }

    /**
     * Parse search results from HTML
     */
    parseSearchResults(html, query, page = 1) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];

        const gridItems = doc.querySelectorAll('div.grid-item');

        gridItems.forEach((gridItem, index) => {
            const playButton = gridItem.querySelector('div.mcpplay');
            if (!playButton) return;

            const trackTitle = playButton.getAttribute('data-track') || '';
            const artist = playButton.getAttribute('data-artist') || 'ناشناس';
            const imageUrl = playButton.getAttribute('data-image') || '';
            const musicUrl = playButton.getAttribute('data-music') || '';

            // Fallback: try to get from DOM elements
            let title = trackTitle;
            let image = imageUrl;
            let url = musicUrl;
            let pageUrl = '';

            if (!title) {
                const titleEl = gridItem.querySelector('div.title a');
                if (titleEl) {
                    title = titleEl.textContent.trim();
                }
            }

            let finalArtist = artist;
            if (!finalArtist || finalArtist === 'ناشناس') {
                const artistEl = gridItem.querySelector('div.artist a');
                if (artistEl) {
                    finalArtist = artistEl.textContent.trim();
                }
            }

            if (!image) {
                const imgEl = gridItem.querySelector('div.img img, img[src*="timthumb"]');
                if (imgEl) {
                    image = imgEl.src || imgEl.getAttribute('src') || '';
                }
            }

            const pageLink = gridItem.querySelector('div.title a, div.img a');
            if (pageLink) {
                pageUrl = pageLink.href || pageLink.getAttribute('href') || '';
                if (pageUrl && !pageUrl.startsWith('http')) {
                    pageUrl = `https://mytehranmusic.com${pageUrl}`;
                }
            }

            // Normalize URLs
            if (image && !image.startsWith('http') && !image.startsWith('data:')) {
                if (image.startsWith('//')) {
                    image = 'https:' + image;
                } else if (image.startsWith('/')) {
                    image = 'https://mytehranmusic.com' + image;
                } else {
                    image = 'https://mytehranmusic.com/' + image;
                }
            }

            if (url && !url.startsWith('http') && !url.startsWith('data:')) {
                if (url.startsWith('//')) {
                    url = 'https:' + url;
                } else if (url.startsWith('/')) {
                    url = 'https://mytehranmusic.com' + url;
                } else {
                    url = 'https://mytehranmusic.com/' + url;
                }
            }

            if (!url && pageUrl) {
                url = pageUrl;
            }

            if (title && url) {
                const trackData = {
                    id: generateTrackId(index, page),
                    title: title.trim(),
                    artist: finalArtist.trim() || 'ناشناس',
                    url: url,
                    image: image || '',
                    pageUrl: pageUrl || url
                };

                results.push(trackData);
            }
        });

        const hasMore = this.checkForMorePages(doc);

        return {
            results,
            hasMore,
            page
        };
    }

    /**
     * Check if there are more pages
     */
    checkForMorePages(doc) {
        const nextLink = doc.querySelector('a.next.page-numbers, .pagination a.next, .wp-pagenavi a.next, a[rel="next"]');
        if (nextLink) {
            return true;
        }

        const pageNumbers = doc.querySelectorAll('.page-numbers, .pagination a, .wp-pagenavi a');
        if (pageNumbers.length > 1) {
            let maxPage = 1;
            pageNumbers.forEach(link => {
                const text = link.textContent.trim();
                const pageNum = parseInt(text);
                if (!isNaN(pageNum) && pageNum > maxPage) {
                    maxPage = pageNum;
                }
            });
            return maxPage > 1;
        }

        return true;
    }

    /**
     * Get current search results
     */
    getSearchResults() {
        return this.searchResults;
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        this.searchResults = [];
        this.currentSearchQuery = '';
        this.currentSearchPage = 1;
        this.hasMoreResults = true;
        this.isLoadingMore = false;
    }
}



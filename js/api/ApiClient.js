/**
 * API Client - Handles all HTTP requests and proxy management
 */
import { API_ENDPOINTS, REQUEST_TIMEOUT } from '../utils/constants.js';
import { createTimeoutController } from '../utils/helpers.js';

export class ApiClient {
    /**
     * Fetch HTML content using multiple proxies in parallel
     * @param {string} url - URL to fetch
     * @returns {Promise<string>} HTML content
     */
    static async fetchHtml(url) {
        const proxyPromises = [
            this._fetchWithProxy(url, API_ENDPOINTS.PROXIES.ALLORIGINS, true),
            this._fetchWithProxy(url, API_ENDPOINTS.PROXIES.CODETABS, false)
        ];

        try {
            // Try fastest response first
            const html = await Promise.race(proxyPromises);
            return html;
        } catch (raceError) {
            // If race fails, try allSettled as fallback
            const results = await Promise.allSettled(proxyPromises);
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    return result.value;
                }
            }
            throw new Error('All proxies failed');
        }
    }

    /**
     * Fetch with a specific proxy
     * @private
     */
    static async _fetchWithProxy(url, proxyUrl, isJsonResponse = false) {
        const fullProxyUrl = `${proxyUrl}${encodeURIComponent(url)}`;
        const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT);

        try {
            const response = await fetch(fullProxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            if (isJsonResponse && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                return data.contents;
            }

            return await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Build search URL
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {string} Search URL
     */
    static buildSearchUrl(query, page = 1) {
        let searchUrl = `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.SEARCH}${encodeURIComponent(query)}`;
        if (page > 1) {
            searchUrl += `&paged=${page}`;
        }
        return searchUrl;
    }

    /**
     * Fetch search results
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {Promise<string>} HTML content
     */
    static async fetchSearchResults(query, page = 1) {
        const searchUrl = this.buildSearchUrl(query, page);
        return await this.fetchHtml(searchUrl);
    }

    /**
     * Fetch explore page content
     * @param {string} url - Explore page URL
     * @returns {Promise<string>} HTML content
     */
    static async fetchExplorePage(url) {
        return await this.fetchHtml(url);
    }

    /**
     * Fetch track page for lyrics extraction
     * @param {string} pageUrl - Track page URL
     * @returns {Promise<string>} HTML content
     */
    static async fetchTrackPage(pageUrl) {
        return await this.fetchHtml(pageUrl);
    }
}


/**
 * API Client - Handles all HTTP requests and proxy management
 */
import { API_ENDPOINTS, REQUEST_TIMEOUT } from '../utils/constants.js';
import { createTimeoutController } from '../utils/helpers.js';

export class ApiClient {
    /**
     * Fetch HTML content using multiple proxies in parallel with retry logic
     * @param {string} url - URL to fetch
     * @param {number} retryCount - Current retry attempt
     * @param {number} maxRetries - Maximum retry attempts
     * @returns {Promise<string>} HTML content
     */
    static async fetchHtml(url, retryCount = 0, maxRetries = 2) {
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
            // This handles cases where QUIC errors occur in console but request succeeds
            const results = await Promise.allSettled(proxyPromises);
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    // Request succeeded despite QUIC error in console - return result
                    return result.value;
                }
            }
            
            // Check if error is QUIC-related (non-critical network error)
            // QUIC errors may appear in browser console but don't affect functionality
            // if the request eventually succeeds (which allSettled would catch)
            const isQuicError = raceError && (
                raceError.message?.includes('QUIC') || 
                raceError.message?.includes('quic') ||
                (raceError.name === 'TypeError' && raceError.message?.includes('Failed to fetch'))
            );
            
            // If all proxies failed and we have retries left, retry with delay
            if (retryCount < maxRetries) {
                const delay = (retryCount + 1) * 500; // Exponential backoff: 500ms, 1000ms
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchHtml(url, retryCount + 1, maxRetries);
            }
            
            // For QUIC errors, the browser console may show the error even if request succeeds
            // This is a known browser behavior and can be safely ignored
            // We only throw if all requests actually failed
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
            
            // QUIC protocol errors are often non-critical - browser may show error
            // but request can still succeed. These errors don't affect functionality.
            // We'll let the error propagate but it will be handled by retry logic.
            // The browser console may show ERR_QUIC_PROTOCOL_ERROR even with 200 status,
            // which is a known browser behavior and can be safely ignored.
            
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



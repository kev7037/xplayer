/**
 * Utility helper functions
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formats time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Normalizes URL for comparison (removes query params and hash)
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        return urlObj.origin + urlObj.pathname;
    } catch (e) {
        return url.split('?')[0].split('#')[0];
    }
}

/**
 * Checks if two tracks are the same by comparing URLs
 * @param {Object} track1 - First track object
 * @param {Object} track2 - Second track object
 * @returns {boolean} True if tracks are the same
 */
export function isSameTrack(track1, track2) {
    if (!track1 || !track2) return false;
    
    const url1 = normalizeUrl(track1.url);
    const url2 = normalizeUrl(track2.url);
    const pageUrl1 = track1.pageUrl ? normalizeUrl(track1.pageUrl) : null;
    const pageUrl2 = track2.pageUrl ? normalizeUrl(track2.pageUrl) : null;
    
    return url1 === url2 || (pageUrl1 && pageUrl2 && pageUrl1 === pageUrl2);
}

/**
 * Cleans lyrics text by normalizing whitespace and line breaks
 * @param {string} text - Lyrics text to clean
 * @returns {string} Cleaned lyrics text
 */
export function cleanLyricsText(text) {
    if (!text) return '';
    
    // Replace multiple consecutive br tags (more than 2) with 2 brs
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Remove leading brs and whitespace
    text = text.replace(/^[\n\s]+/, '');
    
    // Remove trailing brs and whitespace
    text = text.replace(/[\n\s]+$/, '');
    
    // Normalize whitespace (multiple spaces to single space)
    text = text.replace(/[ \t]+/g, ' ');
    
    // Remove empty lines (lines with only whitespace)
    text = text.replace(/\n\s*\n/g, '\n');
    
    return text.trim();
}

/**
 * Formats lyrics for display in player section
 * @param {string} lyrics - Raw lyrics text
 * @returns {string} Formatted HTML lyrics
 */
export function formatLyrics(lyrics) {
    if (!lyrics) return '';
    // Escape HTML
    lyrics = escapeHtml(lyrics);
    // Replace double line breaks with paragraph breaks
    lyrics = lyrics.replace(/\n\n+/g, '</p><p>');
    // Replace single line breaks with <br>
    lyrics = lyrics.replace(/\n/g, '<br>');
    // Wrap in paragraphs
    return `<p>${lyrics}</p>`;
}

/**
 * Formats lyrics for display on lyrics page
 * @param {string} lyrics - Raw lyrics text
 * @returns {string} Formatted HTML lyrics
 */
export function formatLyricsForPage(lyrics) {
    if (!lyrics) return '';
    // Escape HTML
    lyrics = escapeHtml(lyrics);
    // Replace line breaks with <br>
    lyrics = lyrics.replace(/\n/g, '<br>');
    return lyrics;
}

/**
 * Generates a unique ID for tracks
 * @param {number} index - Index offset
 * @param {number} page - Page number
 * @returns {number} Unique ID
 */
export function generateTrackId(index = 0, page = 1) {
    return Date.now() + index + (page - 1) * 10000;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Creates an AbortController with timeout
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Object} Object with controller and timeoutId
 */
export function createTimeoutController(timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return { controller, timeoutId };
}


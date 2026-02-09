/**
 * UI Manager - Handles UI updates and interactions
 */
import { escapeHtml } from '../utils/helpers.js';

export class UIManager {
    constructor() {
        this.toastContainer = document.getElementById('toastContainer');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingIndicator = document.getElementById('loadingIndicator');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        if (!this.toastContainer) {
            console.warn('Toast container not found');
            return;
        }

        // Remove existing toast if any
        const existingToast = this.toastContainer.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${escapeHtml(message)}</span>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto remove after 2 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    /**
     * Show loading indicator
     */
    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Create track element
     */
    createTrackElement(track, source = 'playlist', index = null, options = {}) {
        const div = document.createElement('div');
        div.className = 'track-item';
        
        if (source === 'playlist-detail') {
            div.classList.add('compact');
        }

        div.dataset.trackId = track.id;
        
        // Store track data for explore items (so we can extract it later)
        if (source === 'explore') {
            div.dataset.trackTitle = track.title || '';
            div.dataset.trackArtist = track.artist || '';
            div.dataset.trackImage = track.image || '';
            div.dataset.trackUrl = track.url || '';
            div.dataset.trackPageUrl = track.pageUrl || '';
        }

        const trackTitle = track.title || 'بدون عنوان';
        const trackArtist = track.artist || 'ناشناس';
        const trackImage = track.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b3b3b3"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';

        const isCurrentlyPlaying = options.isCurrentlyPlaying || false;
        const isFavorite = options.isFavorite || false;

        if (source === 'playlist-detail') {
            const trackNumber = index !== null ? index + 1 : '';
            const showPlayButton = isCurrentlyPlaying;
            div.innerHTML = `
                ${showPlayButton ? '' : `<span class="track-number">${trackNumber}</span>`}
                <button class="track-play-button" data-action="play" data-track-id="${track.id}" title="پخش" style="display: ${showPlayButton ? 'flex' : 'none'};">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <div class="track-image-compact">
                    <img src="${trackImage}" alt="${escapeHtml(trackTitle)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23b3b3b3\\'%3E%3Cpath d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/%3E%3C/svg%3E'">
                </div>
                <div class="track-info-compact">
                    <span class="track-title-compact">${escapeHtml(trackTitle)}</span>
                    <span class="track-artist-compact">${escapeHtml(trackArtist)}</span>
                </div>
                <button class="btn-remove-compact" data-action="remove" data-track-id="${track.id}" title="حذف از پلی‌لیست">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            `;
        } else {
            div.innerHTML = `
                <div class="track-image">
                    <img src="${trackImage}" alt="${escapeHtml(trackTitle)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23b3b3b3\\'%3E%3Cpath d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/%3E%3C/svg%3E'">
                </div>
                <div class="track-info">
                    <h4>${escapeHtml(trackTitle)}</h4>
                    <p>${escapeHtml(trackArtist)}</p>
                </div>
                <div class="track-actions">
                    <button class="btn btn-small btn-play" data-action="play" data-track-id="${track.id}" title="پخش">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    ${source !== 'playlist' ? `
                        <button class="btn btn-small btn-add-to-custom" data-action="add-to-custom" data-track-id="${track.id}" title="اضافه به پلی‌لیست">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </button>
                        <button class="btn btn-small btn-favorite ${isFavorite ? 'favorite-active' : ''}" data-action="toggle-favorite" data-track-id="${track.id}" title="${isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'اضافه به علاقه‌مندی‌ها'}">
                            <svg class="heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                        </button>
                    ` : `
                        <button class="btn btn-small btn-remove" data-action="remove" data-track-id="${track.id}" title="حذف">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    `}
                </div>
            `;
        }

        if (isCurrentlyPlaying) {
            div.classList.add('active');
        }

        return div;
    }

    /**
     * Update player UI
     */
    updatePlayerUI(track, elements) {
        if (!track) return;

        if (elements.currentTrackEl) {
            elements.currentTrackEl.textContent = track.title || '-';
        }
        if (elements.currentArtistEl) {
            elements.currentArtistEl.textContent = track.artist || '-';
        }
        if (elements.playerBarTitle) {
            elements.playerBarTitle.textContent = track.title || '-';
        }
        if (elements.playerBarArtist) {
            elements.playerBarArtist.textContent = track.artist || '-';
        }
        if (elements.playerBarImage && track.image) {
            elements.playerBarImage.src = track.image;
        }
        if (elements.currentTrackImage) {
            elements.currentTrackImage.src = track.image || '';
        }
    }

    /**
     * Update progress bar
     */
    updateProgressBar(percentage, elements, isDragging = false) {
        if (elements.playerBarProgressFill && elements.playerBarProgressHandle && !isDragging) {
            elements.playerBarProgressFill.style.width = `${percentage}%`;
            elements.playerBarProgressHandle.style.left = `${percentage}%`;
        }

        if (elements.progressBarFill && elements.progressBarHandle && !isDragging) {
            elements.progressBarFill.style.width = `${percentage}%`;
            elements.progressBarHandle.style.left = `${percentage}%`;
        }
    }

    /**
     * Update play/pause button
     */
    updatePlayPauseButton(isPlaying, elements) {
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');

        if (isPlaying) {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            if (elements.playerBarPlayIcon) elements.playerBarPlayIcon.style.display = 'none';
            if (elements.playerBarPauseIcon) elements.playerBarPauseIcon.style.display = 'block';
        } else {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (elements.playerBarPlayIcon) elements.playerBarPlayIcon.style.display = 'block';
            if (elements.playerBarPauseIcon) elements.playerBarPauseIcon.style.display = 'none';
        }
    }

    /**
     * Update shuffle button
     */
    updateShuffleButton(isShuffle, elements) {
        if (elements.shuffleBtn) {
            if (isShuffle) {
                elements.shuffleBtn.classList.add('active');
            } else {
                elements.shuffleBtn.classList.remove('active');
            }
        }
    }

    /**
     * Update repeat button
     */
    updateRepeatButton(repeatMode, elements) {
        if (!elements.repeatBtn) return;

        // Remove all repeat classes
        elements.repeatBtn.classList.remove('repeat-off', 'repeat-one', 'repeat-all', 'active');

        // Hide all icons first
        const repeatOffIcon = document.getElementById('repeatOffIcon');
        const repeatOneIcon = document.getElementById('repeatOneIcon');
        const repeatAllIcon = document.getElementById('repeatAllIcon');

        if (repeatOffIcon) repeatOffIcon.style.display = 'none';
        if (repeatOneIcon) repeatOneIcon.style.display = 'none';
        if (repeatAllIcon) repeatAllIcon.style.display = 'none';

        switch (repeatMode) {
            case 0: // No repeat
                elements.repeatBtn.classList.add('repeat-off');
                if (repeatOffIcon) repeatOffIcon.style.display = 'block';
                elements.repeatBtn.title = 'Repeat: غیرفعال';
                break;
            case 1: // Repeat one
                elements.repeatBtn.classList.add('repeat-one', 'active');
                if (repeatOneIcon) repeatOneIcon.style.display = 'block';
                elements.repeatBtn.title = 'Repeat: تکرار یک موزیک';
                break;
            case 2: // Repeat all
                elements.repeatBtn.classList.add('repeat-all', 'active');
                if (repeatAllIcon) repeatAllIcon.style.display = 'block';
                elements.repeatBtn.title = 'Repeat: تکرار کل پلی‌لیست';
                break;
        }

        // Bottom player bar
        if (elements.playerBarRepeat) {
            if (elements.playerBarRepeatOffIcon) elements.playerBarRepeatOffIcon.style.display = 'none';
            if (elements.playerBarRepeatOneIcon) elements.playerBarRepeatOneIcon.style.display = 'none';
            if (elements.playerBarRepeatAllIcon) elements.playerBarRepeatAllIcon.style.display = 'none';

            switch (repeatMode) {
                case 0:
                    if (elements.playerBarRepeatOffIcon) elements.playerBarRepeatOffIcon.style.display = 'block';
                    elements.playerBarRepeat.classList.remove('active');
                    break;
                case 1:
                    if (elements.playerBarRepeatOneIcon) elements.playerBarRepeatOneIcon.style.display = 'block';
                    elements.playerBarRepeat.classList.add('active');
                    break;
                case 2:
                    if (elements.playerBarRepeatAllIcon) elements.playerBarRepeatAllIcon.style.display = 'block';
                    elements.playerBarRepeat.classList.add('active');
                    break;
            }
        }
    }
}


/**
 * MyTehran Music Player - Fully Refactored Main Application
 * This version uses all the new modular components for better maintainability
 */

// Import all modules
import { REPEAT_MODES, FAVORITE_PLAYLIST_ID, LIMITS } from './js/utils/constants.js';
import { StorageManager } from './js/storage/StorageManager.js';
import { ApiClient } from './js/api/ApiClient.js';
import { PlayerController } from './js/player/PlayerController.js';
import { PlaylistManager } from './js/playlist/PlaylistManager.js';
import { SearchManager } from './js/search/SearchManager.js';
import { ExploreManager } from './js/explore/ExploreManager.js';
import { LyricsManager } from './js/lyrics/LyricsManager.js';
import { NavigationManager } from './js/navigation/NavigationManager.js';
import { UIManager } from './js/ui/UIManager.js';

class MusicPlayer {
    constructor() {
        // Initialize managers
        this.playlistManager = new PlaylistManager();
        this.searchManager = new SearchManager();
        this.exploreManager = new ExploreManager();
        this.lyricsManager = new LyricsManager();
        this.uiManager = new UIManager();
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Initialize player controller (check if audioPlayer exists)
        if (!this.audioPlayer) {
            console.error('audioPlayer element not found!');
        }
        this.player = new PlayerController(this.audioPlayer, {
            onTrackEnd: () => this.handleTrackEnd(),
            onError: () => this.handleAudioError(),
            onNext: () => this.handleNext(),
            onPrevious: () => this.handlePrevious()
        });
        
        // Initialize navigation
        this.navigation = new NavigationManager(this.pages, this.navItems);
        
        // Initialize state
        this.playlist = [];
        this.currentIndex = -1;
        this.currentTrack = null;
        this.recentTracks = [];
        this.recentPlaylists = [];
        
        // Load saved data
        this.loadSavedData();
        
        // Setup event listeners
        this.attachEventListeners();
        
        // Setup navigation
        setTimeout(() => {
            this.navigation.setupInitialNavigation();
            this.updateCurrentPageContent();
        }, 100);
    }

    initializeElements() {
        // Navigation
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = {
            home: document.getElementById('homePage'),
            search: document.getElementById('searchPage'),
            explore: document.getElementById('explorePage'),
            playlists: document.getElementById('playlistsPage'),
            player: document.getElementById('playerPage'),
            lyrics: document.getElementById('lyricsPage'),
            exploreDetail: document.getElementById('exploreDetailPage')
        };
        
        // Search
        this.searchInput = document.getElementById('searchInputMain');
        this.searchBtn = document.getElementById('searchBtnMain');
        this.searchHistoryList = document.getElementById('searchHistoryList');
        this.searchResultsMain = document.getElementById('searchResultsMain');
        this.resultsContainerMain = document.getElementById('resultsContainerMain');
        this.searchLoadingIndicator = document.getElementById('searchLoadingIndicator');
        
        // Player
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playerSection = document.getElementById('playerSection');
        this.currentTrackEl = document.getElementById('currentTrack');
        this.currentArtistEl = document.getElementById('currentArtist');
        this.currentTrackImage = document.getElementById('currentTrackImage');
        this.bottomPlayerBar = document.getElementById('bottomPlayerBar');
        this.playerBarImage = document.getElementById('playerBarImage');
        this.playerBarTitle = document.getElementById('playerBarTitle');
        this.playerBarArtist = document.getElementById('playerBarArtist');
        this.playerBarTrack = document.getElementById('playerBarTrack');
        this.backFromPlayerBtn = document.getElementById('backFromPlayerBtn');
        this.playerBarPlayPause = document.getElementById('playerBarPlayPause');
        this.playerBarPrev = document.getElementById('playerBarPrev');
        this.playerBarNext = document.getElementById('playerBarNext');
        this.playerBarRepeat = document.getElementById('playerBarRepeat');
        this.playerBarShuffle = document.getElementById('playerBarShuffle');
        this.playerBarPlayIcon = document.getElementById('playerBarPlayIcon');
        this.playerBarPauseIcon = document.getElementById('playerBarPauseIcon');
        
        // Progress bars
        this.playerBarProgressContainer = document.getElementById('playerBarProgressContainer');
        this.playerBarProgressTrack = document.getElementById('playerBarProgressTrack');
        this.playerBarProgressFill = document.getElementById('playerBarProgressFill');
        this.playerBarProgressHandle = document.getElementById('playerBarProgressHandle');
        this.progressBarTrack = document.getElementById('progressBarTrack');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.progressBarHandle = document.getElementById('progressBarHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        
        // Controls
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Player actions
        this.playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
        this.playerAddToPlaylistBtn = document.getElementById('playerAddToPlaylistBtn');
        this.playerLyricsBtn = document.getElementById('playerLyricsBtn');
        this.playerFavoriteIcon = document.getElementById('playerFavoriteIcon');
        
        // Lyrics
        this.lyricsSection = document.getElementById('lyricsSection');
        this.lyricsContent = document.getElementById('lyricsContent');
        this.lyricsFooter = document.getElementById('lyricsFooter');
        this.closeLyricsBtn = document.getElementById('closeLyricsBtn');
        this.retryLyricsBtn = document.getElementById('retryLyricsBtn');
        this.lyricsPageContent = document.getElementById('lyricsPageContent');
        this.lyricsPageTrackTitle = document.getElementById('lyricsPageTrackTitle');
        this.lyricsPageTrackArtist = document.getElementById('lyricsPageTrackArtist');
        this.backFromLyricsBtn = document.getElementById('backFromLyricsBtn');
        this.refreshLyricsBtn = document.getElementById('refreshLyricsBtn');
        
        // Home
        this.recentTracksContainer = document.getElementById('recentTracks');
        this.recentPlaylistsContainer = document.getElementById('recentPlaylists');
        this.resetAllBtn = document.getElementById('resetAllBtn');
        
        // Explore
        this.latestTracksList = document.getElementById('latestTracksList');
        this.topMonthlyList = document.getElementById('topMonthlyList');
        this.podcastsList = document.getElementById('podcastsList');
        this.exploreDetailContainer = document.getElementById('exploreDetailContainer');
        this.exploreDetailTitle = document.getElementById('exploreDetailTitle');
        this.exploreDetailInfiniteLoader = document.getElementById('exploreDetailInfiniteLoader');
        this.exploreDetailLoadingIndicator = document.getElementById('exploreDetailLoadingIndicator');
        this.exploreDetailScrollToTopBtn = document.getElementById('exploreDetailScrollToTopBtn');
        this.backFromExploreDetailBtn = document.getElementById('backFromExploreDetailBtn');
        
        // Playlists
        this.playlistsListMain = document.getElementById('playlistsListMain');
        this.createPlaylistBtnMain = document.getElementById('createPlaylistBtnMain');
        this.playlistDetailPage = document.getElementById('playlistDetailPage');
        this.playlistTracksContainer = document.getElementById('playlistTracksContainer');
        this.backToPlaylistsBtn = document.getElementById('backToPlaylistsBtn');
    }

    loadSavedData() {
        // Load playlist state
        const playlistData = StorageManager.loadPlaylist();
        this.playlist = playlistData.playlist;
        this.currentIndex = playlistData.currentIndex;
        this.playlistManager.setCurrentPlaylistId(playlistData.currentPlaylistId);
        
        // Sync with player controller
        this.player.setPlaylist(this.playlist);
        this.player.setCurrentIndex(this.currentIndex);
        this.player.repeatMode = playlistData.repeatMode;
        this.player.isShuffle = playlistData.isShuffle;
        
        // Load recent data
        const recentData = StorageManager.loadRecentData();
        this.recentTracks = recentData.tracks || [];
        this.recentPlaylists = recentData.playlists || [];
        
        // Restore current track if available
        if (this.currentIndex >= 0 && this.playlist[this.currentIndex]) {
            this.currentTrack = this.playlist[this.currentIndex];
        }
    }

    attachEventListeners() {
        // Search
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.handleSearch());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }
        
        // Player controls
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.handlePlayPause());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.handlePrevious());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.handleNext());
        }
        if (this.shuffleBtn) {
            this.shuffleBtn.addEventListener('click', () => this.handleShuffle());
        }
        if (this.repeatBtn) {
            this.repeatBtn.addEventListener('click', () => this.handleRepeat());
        }
        
        // Bottom player bar controls
        if (this.playerBarPlayPause) {
            this.playerBarPlayPause.addEventListener('click', () => this.handlePlayPause());
        }
        if (this.playerBarPrev) {
            this.playerBarPrev.addEventListener('click', () => this.handlePrevious());
        }
        if (this.playerBarNext) {
            this.playerBarNext.addEventListener('click', () => this.handleNext());
        }
        if (this.playerBarRepeat) {
            this.playerBarRepeat.addEventListener('click', () => this.handleRepeat());
        }
        if (this.playerBarShuffle) {
            this.playerBarShuffle.addEventListener('click', () => this.handleShuffle());
        }
        
        // Audio events - Note: PlayerController handles ended/error, we handle UI updates
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('timeupdate', () => this.updateProgressBar());
            this.audioPlayer.addEventListener('loadedmetadata', () => this.updateProgressBar());
            this.audioPlayer.addEventListener('play', () => this.updatePlayButton());
            this.audioPlayer.addEventListener('pause', () => this.updatePlayButton());
            // Note: ended and error are handled by PlayerController, but we sync state in handleTrackEnd
        }
        
        // Player actions
        if (this.playerFavoriteBtn) {
            this.playerFavoriteBtn.addEventListener('click', () => this.handlePlayerFavorite());
        }
        if (this.playerAddToPlaylistBtn) {
            this.playerAddToPlaylistBtn.addEventListener('click', () => this.handlePlayerAddToPlaylist());
        }
        if (this.playerLyricsBtn) {
            this.playerLyricsBtn.addEventListener('click', () => this.handlePlayerLyrics());
        }
        
        // Lyrics
        if (this.closeLyricsBtn) {
            this.closeLyricsBtn.addEventListener('click', () => this.hideLyrics());
        }
        if (this.retryLyricsBtn) {
            this.retryLyricsBtn.addEventListener('click', () => this.retryLoadLyrics());
        }
        if (this.refreshLyricsBtn) {
            this.refreshLyricsBtn.addEventListener('click', () => this.handleRefreshLyrics());
        }
        if (this.backFromLyricsBtn) {
            this.backFromLyricsBtn.addEventListener('click', () => {
                this.navigation.navigateToPage('player');
            });
        }
        
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    // Hide playlist detail page if showing
                    if (this.playlistDetailPage) {
                        this.playlistDetailPage.style.display = 'none';
                        this.playlistDetailPage.style.visibility = 'hidden';
                        this.playlistDetailPage.classList.remove('active');
                    }
                    this.navigation.navigateToPage(page);
                    this.updateCurrentPageContent();
                }
            });
        });
        
        // Back buttons
        if (this.backFromPlayerBtn) {
            this.backFromPlayerBtn.addEventListener('click', () => {
                this.navigation.goBack();
                this.updateCurrentPageContent();
            });
        }
        if (this.backFromExploreDetailBtn) {
            this.backFromExploreDetailBtn.addEventListener('click', () => {
                this.navigation.navigateToPage('explore');
                this.updateCurrentPageContent();
            });
        }
        if (this.backToPlaylistsBtn) {
            this.backToPlaylistsBtn.addEventListener('click', () => {
                if (this.playlistDetailPage) {
                    this.playlistDetailPage.style.display = 'none';
                }
                this.navigation.navigateToPage('playlists');
                this.updateCurrentPageContent();
            });
        }
        
        // Player bar track click
        if (this.playerBarTrack) {
            this.playerBarTrack.addEventListener('click', () => {
                if (this.currentIndex >= 0 && this.playlist.length > 0) {
                    this.navigation.navigateToPage('player');
                    this.updateCurrentPageContent();
                }
            });
        }
        
        // Playlists
        if (this.createPlaylistBtnMain) {
            this.createPlaylistBtnMain.addEventListener('click', () => this.handleCreatePlaylist());
        }
        
        // Reset
        if (this.resetAllBtn) {
            this.resetAllBtn.addEventListener('click', () => this.handleResetAll());
        }
        
        // Setup progress bars
        this.setupProgressBars();
    }

    // Player handlers
    async handlePlayPause() {
        try {
            await this.player.togglePlayPause();
            this.updatePlayButton();
            this.updatePlayerUI();
            this.savePlaylist();
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            this.uiManager.showToast('خطا در پخش موزیک', 'error');
        }
    }
    
    // Wrapper methods for compatibility
    togglePlayPause() {
        return this.handlePlayPause();
    }
    
    playPrevious() {
        return this.handlePrevious();
    }
    
    playNext() {
        return this.handleNext();
    }
    
    toggleShuffle() {
        this.handleShuffle();
    }
    
    toggleRepeat() {
        this.handleRepeat();
    }

    async handlePrevious() {
        try {
            if (this.playlist.length === 0) return;

            // Ensure PlayerController playlist is synced
            this.player.setPlaylist(this.playlist);

            let prevIndex;
            if (this.player.isShuffle && this.player.shuffledIndices.length > 0) {
                const currentShuffledIndex = this.player.shuffledIndices.indexOf(this.currentIndex);
                if (currentShuffledIndex > 0) {
                    prevIndex = this.player.shuffledIndices[currentShuffledIndex - 1];
                } else {
                    prevIndex = this.player.shuffledIndices[this.player.shuffledIndices.length - 1];
                }
            } else {
                prevIndex = this.currentIndex <= 0 ? this.playlist.length - 1 : this.currentIndex - 1;
            }

            this.currentIndex = prevIndex;
            this.player.setCurrentIndex(prevIndex);
            const track = this.playlist[prevIndex];
            if (track) {
                await this.loadAndPlay(track);
            }
        } catch (error) {
            console.error('Error playing previous:', error);
        }
    }

    async handleNext() {
        try {
            if (this.playlist.length === 0) return;

            // Ensure PlayerController playlist is synced
            this.player.setPlaylist(this.playlist);

            let nextIndex;
            if (this.player.isShuffle && this.player.shuffledIndices.length > 0) {
                const currentShuffledIndex = this.player.shuffledIndices.indexOf(this.currentIndex);
                if (currentShuffledIndex >= 0 && currentShuffledIndex < this.player.shuffledIndices.length - 1) {
                    nextIndex = this.player.shuffledIndices[currentShuffledIndex + 1];
                } else {
                    // Regenerate shuffle if at end
                    this.player.generateShuffledIndices();
                    nextIndex = this.player.shuffledIndices[0];
                }
            } else {
                nextIndex = (this.currentIndex + 1) % this.playlist.length;
            }

            if (this.player.repeatMode === REPEAT_MODES.OFF && nextIndex === 0 && this.currentIndex === this.playlist.length - 1) {
                // End of playlist, no repeat
                this.player.pause();
                return;
            }

            this.currentIndex = nextIndex;
            this.player.setCurrentIndex(nextIndex);
            const track = this.playlist[nextIndex];
            if (track) {
                await this.loadAndPlay(track);
            }
        } catch (error) {
            console.error('Error playing next:', error);
        }
    }
    
    updatePlaylistDisplay() {
        // Update playlist detail view if open
        if (this.playlistDetailPage && this.playlistDetailPage.style.display !== 'none') {
            this.displayPlaylistTracks(this.playlist);
        }
    }

    handleShuffle() {
        this.player.toggleShuffle();
        this.updateShuffleButton();
        this.savePlaylist();
    }

    handleRepeat() {
        this.player.toggleRepeat();
        this.updateRepeatButton();
        this.savePlaylist();
    }

    handleTrackEnd() {
        // Handled by PlayerController, but we need to sync state
        this.currentTrack = this.player.getCurrentTrack();
        this.currentIndex = this.player.currentIndex;
        this.updatePlayButton();
        this.updatePlayerUI();
        this.updatePlaylistDisplay();
        this.savePlaylist();
    }
    
    handleAudioError() {
        this.uiManager.showToast('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.', 'error');
        // Try to play next track
        this.handleNext();
    }

    handleAudioError() {
        this.uiManager.showToast('خطا در پخش موزیک. در حال پخش موزیک بعدی...', 'error');
        this.handleNext();
    }

    // Search handlers
    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.uiManager.showError('لطفا نام موزیک را وارد کنید');
            return;
        }

        if (this.navigation.getCurrentPage() !== 'search') {
            this.navigation.navigateToPage('search');
        }

        if (this.searchLoadingIndicator) {
            this.searchLoadingIndicator.style.display = 'flex';
        }

        try {
            const result = await this.searchManager.search(query, 1);
            this.displaySearchResults(result.results, true);
            this.setupInfiniteScroll();
        } catch (error) {
            console.error('Search error:', error);
            this.uiManager.showError('خطا در جستجو. لطفا دوباره تلاش کنید.');
        } finally {
            if (this.searchLoadingIndicator) {
                this.searchLoadingIndicator.style.display = 'none';
            }
        }
    }

    displaySearchResults(results, clear = false) {
        if (!this.resultsContainerMain) return;

        if (clear) {
            this.resultsContainerMain.innerHTML = '';
        }

        if (!results || results.length === 0) {
            if (clear) {
                this.resultsContainerMain.innerHTML = '<p class="empty-state">چیزی پیدا نشد</p>';
            }
            return;
        }

        results.forEach(track => {
            const isFavorite = this.playlistManager.isTrackInFavorites(track);
            const trackElement = this.uiManager.createTrackElement(track, 'results', null, {
                isFavorite
            });
            
            this.attachTrackElementListeners(trackElement, track, 'results');
            this.resultsContainerMain.appendChild(trackElement);
        });

        this.displaySearchHistory();
    }

    displaySearchHistory() {
        if (!this.searchHistoryList) return;

        this.searchHistoryList.innerHTML = '';
        const history = this.searchManager.getSearchHistory();

        if (!history || history.length === 0) {
            this.searchHistoryList.innerHTML = '<p class="empty-state">هیچ جستجویی انجام نشده است</p>';
            return;
        }

        history.forEach((query, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-text">${query}</div>
                <button class="btn-icon history-delete-btn" data-index="${index}" title="حذف">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                    </svg>
                </button>
            `;

            item.addEventListener('click', () => {
                this.searchInput.value = query;
                this.handleSearch();
            });

            const deleteBtn = item.querySelector('.history-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.searchManager.removeFromSearchHistory(index);
                    this.displaySearchHistory();
                });
            }

            this.searchHistoryList.appendChild(item);
        });
    }

    // Playlist handlers
    handleCreatePlaylist(trackToAdd = null) {
        const name = prompt('نام پلی‌لیست را وارد کنید:');
        if (!name || !name.trim()) {
            return;
        }

        try {
            const id = this.playlistManager.createPlaylist(name.trim(), trackToAdd);
            this.uiManager.showToast('پلی‌لیست جدید ساخته شد', 'success');
            if (this.navigation.getCurrentPage() === 'playlists') {
                this.displayPlaylists();
            }
            return id;
        } catch (error) {
            this.uiManager.showToast(error.message, 'error');
            return null;
        }
    }

    displayPlaylists() {
        if (!this.playlistsListMain) return;

        this.playlistsListMain.innerHTML = '';
        const playlists = this.playlistManager.getAllPlaylists();

        if (playlists.length === 0) {
            this.playlistsListMain.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی وجود ندارد</p>';
            return;
        }

        // Sort: favorite first
        const sortedPlaylists = playlists.sort(([id1], [id2]) => {
            if (id1 === FAVORITE_PLAYLIST_ID) return -1;
            if (id2 === FAVORITE_PLAYLIST_ID) return 1;
            return 0;
        });

        sortedPlaylists.forEach(([id, playlist]) => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'custom-playlist-item-main';
            if (id === FAVORITE_PLAYLIST_ID) {
                playlistEl.classList.add('favorite-playlist');
            }

            const isSelected = this.playlistManager.getCurrentPlaylistId() === id;

            playlistEl.innerHTML = `
                <div class="playlist-info-main">
                    <h3>${playlist.name} ${id === FAVORITE_PLAYLIST_ID ? '❤️' : ''}</h3>
                    <p>${playlist.tracks.length} موزیک</p>
                </div>
                <button class="btn btn-small btn-play-playlist-main" data-playlist-id="${id}">▶</button>
            `;

            playlistEl.querySelector('.btn-play-playlist-main').addEventListener('click', () => {
                this.selectPlaylist(id);
            });

            playlistEl.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.selectPlaylist(id);
                }
            });

            this.playlistsListMain.appendChild(playlistEl);
        });
    }

    selectPlaylist(playlistId) {
        const playlist = this.playlistManager.getPlaylist(playlistId);
        if (!playlist || playlist.tracks.length === 0) {
            this.uiManager.showToast('پلی‌لیست خالی است', 'error');
            return;
        }

        this.playlistManager.setCurrentPlaylistId(playlistId);
        this.showPlaylistDetail(playlistId, playlist);
        
        // Auto-play first track
        this.playlist = [...playlist.tracks];
        this.currentIndex = 0;

        this.player.setPlaylist(this.playlist);
        this.player.setCurrentIndex(0);
        this.player.loadAndPlay(this.playlist[0]);

        this.currentTrack = this.playlist[0];
        this.updatePlayerUI();
        this.updatePlayButton();
        this.savePlaylist();
        this.addToRecentPlaylists(playlistId, playlist.name, playlist.tracks);
    }
    
    showPlaylistDetail(playlistId, playlist) {
        if (!playlist && playlistId) {
            playlist = this.playlistManager.getPlaylist(playlistId);
        }
        
        if (!playlist) {
            console.error('Playlist not found:', playlistId);
            return;
        }
        
        if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
            playlist.tracks = [];
        }
        
        // Hide all pages
        Object.values(this.pages).forEach(p => {
            if (p) {
                p.classList.remove('active');
                p.style.display = 'none';
                p.style.visibility = 'hidden';
            }
        });
        
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        if (this.playlistDetailPage) {
            this.playlistDetailPage.classList.add('active');
            this.playlistDetailPage.style.display = 'block';
            this.playlistDetailPage.style.visibility = 'visible';
            
            const titleEl = document.getElementById('playlistDetailTitle');
            if (titleEl) {
                titleEl.textContent = playlist.name || 'پلی‌لیست';
            }
            
            this.playlistManager.setCurrentPlaylistId(playlistId);
            this.playlist = playlist.tracks;
            
            this.displayPlaylistTracks(playlist.tracks);
        }
    }
    
    displayPlaylistTracks(tracks) {
        if (!this.playlistTracksContainer) {
            console.error('playlistTracksContainer not found');
            return;
        }
        
        this.playlistTracksContainer.innerHTML = '';
        
        if (!tracks || tracks.length === 0) {
            this.playlistTracksContainer.innerHTML = '<p class="empty-state">این پلی‌لیست خالی است</p>';
            return;
        }
        
        tracks.forEach((track, index) => {
            if (!track) return;
            
            if (!track.title) track.title = 'بدون عنوان';
            if (!track.artist) track.artist = 'ناشناس';
            if (!track.id) track.id = Date.now() + index;
            
            const currentPlaylistId = this.playlistManager.getCurrentPlaylistId();
            const isCurrentlyPlaying = this.currentIndex === index && currentPlaylistId === this.playlistManager.getCurrentPlaylistId();
            const trackElement = this.uiManager.createTrackElement(track, 'playlist-detail', index, {
                isCurrentlyPlaying
            });
            
            this.attachTrackElementListeners(trackElement, track, 'playlist-detail');
            
            if (isCurrentlyPlaying) {
                trackElement.classList.add('active');
            }
            
            this.playlistTracksContainer.appendChild(trackElement);
        });
    }

    // Track handlers
    async playTrack(trackId, source) {
        let track = null;

        if (source === 'results') {
            // For search results, set current playlist to search results
            this.playlistManager.setCurrentPlaylistId(null);
            // Add all search results to playlist if not already there
            const searchResults = this.searchManager.getSearchResults();
            searchResults.forEach(result => {
                if (!this.playlist.find(t => t.id === result.id)) {
                    this.playlist.push({...result});
                }
            });
            track = searchResults.find(t => t.id === trackId);
        } else if (source === 'playlist' || source === 'playlist-detail') {
            track = this.playlist.find(t => t.id === trackId);
            if (source === 'playlist-detail') {
                // Find track index in current playlist
                const trackIndex = this.playlist.findIndex(t => t.id === trackId);
                if (trackIndex !== -1) {
                    this.currentIndex = trackIndex;
                    this.player.setPlaylist(this.playlist);
                    this.player.setCurrentIndex(trackIndex);
                    await this.loadAndPlay(this.playlist[trackIndex]);
                    return;
                }
            }
        } else if (source === 'home') {
            // Playing from home page (recent tracks)
            track = this.recentTracks.find(t => t.id === trackId) || 
                    this.playlist.find(t => t.id === trackId);
            
            // If track found in recent tracks but not in playlist, add it
            if (track && !this.playlist.find(t => t.id === trackId)) {
                this.playlist.push({...track});
            }
        } else if (source === 'explore') {
            // Playing from explore page - try to find track from DOM element first (most reliable)
            const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
            if (trackElement && trackElement._trackData) {
                // Use stored track data from element
                track = {...trackElement._trackData};
            } else {
                // Fallback: try to find track from exploreManager
                const allExploreItems = [
                    ...(this.exploreManager.getCachedItems('https://mytehranmusic.com/') || []),
                    ...(this.exploreManager.getCachedItems('https://mytehranmusic.com/top-month-tehranmusic/') || []),
                    ...(this.exploreManager.getCachedItems('https://mytehranmusic.com/podcasts/') || []),
                    ...(this.exploreManager.getCachedItems(this.exploreManager.currentExploreUrl || '') || [])
                ];
                
                track = allExploreItems.find(t => t.id === trackId);
                
                // Last fallback: extract from DOM
                if (!track && trackElement) {
                    const trackTitle = trackElement.dataset.trackTitle;
                    const trackArtist = trackElement.dataset.trackArtist;
                    const trackImage = trackElement.dataset.trackImage;
                    const trackUrl = trackElement.dataset.trackUrl;
                    const trackPageUrl = trackElement.dataset.trackPageUrl;
                    
                    if (trackTitle && (trackUrl || trackPageUrl)) {
                        track = {
                            id: trackId,
                            title: trackTitle,
                            artist: trackArtist || 'ناشناس',
                            image: trackImage || '',
                            url: trackUrl || trackPageUrl || '',
                            pageUrl: trackPageUrl || trackUrl || ''
                        };
                    }
                }
            }
            
            // Ensure pageUrl is set (required for audio extraction)
            if (track) {
                // If url is a direct audio file (from data-music), we still need pageUrl
                if (track.url && (track.url.includes('.mp3') || track.url.includes('.m4a') || track.url.includes('dl.mytehranmusic.com'))) {
                    // This is a direct audio URL from data-music attribute
                    // We need the page URL to extract it properly if CORS fails
                    if (!track.pageUrl) {
                        // Try to find page URL from DOM
                        if (trackElement) {
                            const linkEl = trackElement.querySelector('a');
                            if (linkEl) {
                                track.pageUrl = linkEl.href || linkEl.getAttribute('href') || '';
                                if (track.pageUrl && !track.pageUrl.startsWith('http')) {
                                    track.pageUrl = `https://mytehranmusic.com${track.pageUrl}`;
                                }
                            }
                        }
                        // If still no pageUrl, use url as fallback (will try direct play first)
                        if (!track.pageUrl) {
                            track.pageUrl = track.url;
                        }
                    }
                } else if (!track.pageUrl && track.url) {
                    // URL is a page URL, use it as pageUrl
                    track.pageUrl = track.url;
                }
            }
            
            // Add to playlist if not already there
            if (track && !this.playlist.find(t => t.id === trackId)) {
                this.playlist.push({...track});
            }
        }

        if (!track) {
            console.warn('Track not found:', trackId, 'source:', source);
            return;
        }

        const existingIndex = this.playlist.findIndex(t => t.id === trackId);
        if (existingIndex === -1) {
            this.playlist.push(track);
            this.currentIndex = this.playlist.length - 1;
        } else {
            this.currentIndex = existingIndex;
        }

        this.player.setPlaylist(this.playlist);
        this.player.setCurrentIndex(this.currentIndex);
        await this.loadAndPlay(track);
    }
    
    async loadAndPlay(track) {
        if (!track) return;
        
        // Store current track
        this.currentTrack = {...track};
        
        // Update Media Session metadata for Bluetooth controls and notifications
        this.player.updateMediaSessionMetadata(track);
        
        // Update UI
        this.updatePlayerUI();
        this.updatePlayerFavoriteButton();
        
        // Reset lyrics section when track changes
        if (this.lyricsContent) {
            this.lyricsContent.dataset.loaded = 'false';
            this.lyricsContent.dataset.trackUrl = '';
        }
        
        // Update lyrics page if it's currently visible
        if (this.pages.lyrics && this.pages.lyrics.style.display !== 'none') {
            this.loadLyricsPage();
        }
        
        // Reset progress bar
        if (this.playerBarProgressFill) {
            this.playerBarProgressFill.style.width = '0%';
        }
        if (this.playerBarProgressHandle) {
            this.playerBarProgressHandle.style.left = '0%';
        }
        if (this.progressBarFill) {
            this.progressBarFill.style.width = '0%';
        }
        if (this.progressBarHandle) {
            this.progressBarHandle.style.left = '0%';
        }
        
        // Show bottom player bar
        if (this.bottomPlayerBar) {
            this.bottomPlayerBar.style.display = 'flex';
        }
        
        // Check if track.url is a direct audio file
        const isDirectAudio = track.url && (
            track.url.includes('.mp3') || 
            track.url.includes('.m4a') || 
            track.url.includes('.ogg') || 
            track.url.includes('dl.mytehranmusic.com')
        );
        
        // If we have a direct audio URL, try it first (faster)
        // But also ensure we have pageUrl as fallback
        if (isDirectAudio && track.pageUrl) {
            // Try direct audio first, fallback to page extraction if CORS fails
            this.audioPlayer.crossOrigin = null;
            this.audioPlayer.src = track.url;
            
            let errorHandled = false;
            const handleDirectAudioError = async () => {
                if (errorHandled) return;
                errorHandled = true;
                console.log('Direct audio failed, extracting from page...');
                await this.extractAndPlayFromPage(track);
            };
            
            this.audioPlayer.addEventListener('error', handleDirectAudioError, { once: true });
            
            try {
                await this.audioPlayer.load();
                await this.audioPlayer.play();
                this.audioPlayer.removeEventListener('error', handleDirectAudioError);
                this.updatePlayButton();
                // Cache audio silently (errors are handled inside cacheAudio)
                this.player.cacheAudio(track.url).catch(() => {});
                this.savePlaylist();
                this.addToRecentTracks(track);
                return;
            } catch (err) {
                console.error('Direct audio play error:', err);
                if (err.name === 'NotAllowedError' || err.name === 'NotSupportedError' || 
                    err.message.includes('CORS') || err.message.includes('cross-origin')) {
                    handleDirectAudioError();
                    return;
                }
            }
        }
        
        // Always try to extract from page URL (most reliable)
        if (track.pageUrl) {
            await this.extractAndPlayFromPage(track);
            return;
        }
        
        // Fallback: Check if URL is a direct audio file (if not already checked)
        if (!isDirectAudio && audioUrl) {
            // Try direct audio URL first (might work for some servers)
            this.audioPlayer.crossOrigin = null;
            this.audioPlayer.src = audioUrl;
            
            // Set up error handler for CORS issues
            let errorHandled = false;
            const handleAudioError = async (e) => {
                if (errorHandled) return;
                errorHandled = true;
                
                console.log('Direct audio failed, trying to extract from page...');
                // Try to extract from page if we have the URL
                // For mytehranmusic.com, we can construct page URL from audio URL
                if (audioUrl.includes('dl.mytehranmusic.com')) {
                    // Try to construct page URL from audio URL
                    // This is a fallback - ideally track should have pageUrl
                    this.uiManager.showToast('در حال بارگذاری...', 'info');
                    // We'll need to search for the track or use a different approach
                    this.uiManager.showToast('لطفا از صفحه اصلی آهنگ استفاده کنید', 'error');
                } else {
                    this.uiManager.showToast('خطا در پخش موزیک', 'error');
                }
            };
            
            // Listen for CORS/network errors
            this.audioPlayer.addEventListener('error', handleAudioError, { once: true });
            
            try {
                await this.audioPlayer.load();
                await this.audioPlayer.play();
                // Success - remove error handler
                this.audioPlayer.removeEventListener('error', handleAudioError);
                this.updatePlayButton();
                this.player.cacheAudio(audioUrl).catch(err => console.warn('Failed to cache audio:', err));
                this.savePlaylist();
                this.addToRecentTracks(track);
            } catch (err) {
                console.error('Play error:', err);
                // Check if it's a CORS error
                if (err.name === 'NotAllowedError' || err.message.includes('CORS') || err.message.includes('cross-origin') || err.name === 'NotSupportedError') {
                    handleAudioError(err);
                } else {
                    // Other error
                    this.uiManager.showToast('خطا در پخش موزیک', 'error');
                }
            }
        } else {
            this.uiManager.showToast('آدرس موزیک نامعتبر است', 'error');
        }
    }
    
    async extractAndPlayFromPage(track) {
        if (!track.pageUrl) {
            this.uiManager.showToast('لینک موزیک یافت نشد', 'error');
            return;
        }
        
        this.uiManager.showLoading(true);
        const pageUrl = track.pageUrl || track.url;
        
        try {
            const html = await ApiClient.fetchTrackPage(pageUrl);
            const audioUrl = this.extractAudioUrl(html);
            
            this.uiManager.showLoading(false);
            
            if (audioUrl) {
                console.log('Extracted audio URL:', audioUrl);
                this.audioPlayer.crossOrigin = 'anonymous';
                this.audioPlayer.src = audioUrl;
                
                try {
                    await this.audioPlayer.load();
                    await this.audioPlayer.play();
                    this.updatePlayButton();
                    this.player.cacheAudio(audioUrl).catch(err => console.warn('Failed to cache audio:', err));
                    this.savePlaylist();
                    this.addToRecentTracks(track);
                } catch (playError) {
                    console.error('Play error after extraction:', playError);
                    // Even extracted URL might have CORS issues
                    // Try with crossOrigin = null
                    this.audioPlayer.crossOrigin = null;
                    this.audioPlayer.src = audioUrl;
                    try {
                        await this.audioPlayer.load();
                        await this.audioPlayer.play();
                        this.updatePlayButton();
                        this.player.cacheAudio(audioUrl).catch(err => console.warn('Failed to cache audio:', err));
                        this.savePlaylist();
                        this.addToRecentTracks(track);
                    } catch (retryError) {
                        console.error('Retry play error:', retryError);
                        this.uiManager.showToast('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.', 'error');
                    }
                }
            } else {
                this.uiManager.showToast('نمی‌توان موزیک را پخش کرد. لطفا موزیک دیگری انتخاب کنید.', 'error');
            }
        } catch (error) {
            this.uiManager.showLoading(false);
            console.error('Error extracting audio:', error);
            this.uiManager.showToast('خطا در بارگذاری موزیک. لطفا دوباره تلاش کنید.', 'error');
        }
    }
    
    extractAudioUrl(html) {
        if (!html || typeof html !== 'string') {
            console.error('Invalid HTML provided to extractAudioUrl');
            return null;
        }
        
        // Check if HTML is actually JSON (from CORS proxy)
        let actualHtml = html;
        try {
            const jsonData = JSON.parse(html);
            if (jsonData && jsonData.contents) {
                actualHtml = jsonData.contents;
            }
        } catch (e) {
            // Not JSON, use as is
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(actualHtml, 'text/html');
        
        // Method 1: Check for data-music attribute (most reliable for this site)
        const playButton = doc.querySelector('div.mcpplay[data-music]');
        if (playButton) {
            const musicUrl = playButton.getAttribute('data-music');
            if (musicUrl && musicUrl.trim()) {
                const normalizedUrl = musicUrl.startsWith('http') ? musicUrl : `https://mytehranmusic.com${musicUrl}`;
                console.log('Found audio URL from data-music:', normalizedUrl);
                return normalizedUrl;
            }
        }
        
        // Method 2: Direct audio source tag
        const audioSource = doc.querySelector('audio source');
        if (audioSource && audioSource.src) {
            const src = audioSource.src;
            if (src && src.trim() && (src.includes('.mp3') || src.includes('.m4a') || src.includes('.ogg'))) {
                const normalizedUrl = src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
                console.log('Found audio URL from audio source:', normalizedUrl);
                return normalizedUrl;
            }
        }
        
        // Method 3: Audio element with src
        const audioElement = doc.querySelector('audio');
        if (audioElement && audioElement.src) {
            const src = audioElement.src;
            if (src && src.trim() && (src.includes('.mp3') || src.includes('.m4a') || src.includes('.ogg'))) {
                const normalizedUrl = src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
                console.log('Found audio URL from audio element:', normalizedUrl);
                return normalizedUrl;
            }
        }
        
        // Method 4: Data attributes (fallback)
        const dataAudio = doc.querySelector('[data-audio], [data-src], [data-mp3]');
        if (dataAudio) {
            const src = dataAudio.getAttribute('data-audio') || 
                       dataAudio.getAttribute('data-src') || 
                       dataAudio.getAttribute('data-mp3');
            if (src && src.trim()) {
                const normalizedUrl = src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
                console.log('Found audio URL from data attributes:', normalizedUrl);
                return normalizedUrl;
            }
        }
        
        // Method 5: Look for download links with .mp3 or .m4a
        const downloadLinks = doc.querySelectorAll('a[href*=".mp3"], a[href*=".m4a"], a[href*=".ogg"], a[download]');
        for (const link of downloadLinks) {
            const href = link.href || link.getAttribute('href');
            if (href && (href.includes('.mp3') || href.includes('.m4a') || href.includes('.ogg'))) {
                const normalizedUrl = href.startsWith('http') ? href : `https://mytehranmusic.com${href}`;
                console.log('Found audio URL from download link:', normalizedUrl);
                return normalizedUrl;
            }
        }
        
        // Method 6: Look in script tags for audio URLs
        const scripts = doc.querySelectorAll('script');
        for (const script of scripts) {
            const content = script.textContent || script.innerHTML;
            // Look for URLs ending with audio extensions or dl.mytehranmusic.com
            const audioUrlMatch = content.match(/https?:\/\/[^\s"']+\.(mp3|m4a|ogg)/i) ||
                                 content.match(/https?:\/\/dl\.mytehranmusic\.com[^\s"']+/i);
            if (audioUrlMatch && audioUrlMatch[0]) {
                console.log('Found audio URL from script tag:', audioUrlMatch[0]);
                return audioUrlMatch[0];
            }
        }
        
        console.warn('No audio URL found in HTML');
        return null;
    }

    attachTrackElementListeners(element, track, source) {
        element.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const action = btn.dataset.action;
                const trackId = parseInt(btn.dataset.trackId);

                if (action === 'play') {
                    if (source === 'playlist-detail') {
                        // Find track index in current playlist
                        const trackIndex = this.playlist.findIndex(t => t.id === trackId);
                        if (trackIndex !== -1) {
                            this.currentIndex = trackIndex;
                            this.player.setPlaylist(this.playlist);
                            this.player.setCurrentIndex(trackIndex);
                            this.loadAndPlay(this.playlist[trackIndex]);
                            this.updatePlaylistDisplay();
                        }
                    } else {
                        this.playTrack(trackId, source);
                    }
                } else if (action === 'toggle-favorite') {
                    this.handleToggleFavorite(track);
                    // Update UI
                    const heartBtn = element.querySelector('.btn-favorite');
                    const heartIcon = element.querySelector('.heart-icon');
                    if (heartBtn && heartIcon) {
                        const isFav = this.playlistManager.isTrackInFavorites(track);
                        if (isFav) {
                            heartBtn.classList.add('favorite-active');
                            heartBtn.title = 'حذف از علاقه‌مندی‌ها';
                            heartIcon.setAttribute('fill', 'currentColor');
                        } else {
                            heartBtn.classList.remove('favorite-active');
                            heartBtn.title = 'اضافه به علاقه‌مندی‌ها';
                            heartIcon.setAttribute('fill', 'none');
                        }
                    }
                } else if (action === 'add-to-custom') {
                    this.handleAddToPlaylist(track);
                } else if (action === 'remove') {
                    this.handleRemoveFromPlaylist(trackId);
                }
            });
        });
        
        // Click on track item to play (for playlist-detail)
        if (source === 'playlist-detail') {
            element.addEventListener('click', (e) => {
                // Don't trigger if clicking on a button
                if (e.target.closest('button')) {
                    return;
                }
                const trackId = parseInt(element.dataset.trackId);
                const trackIndex = this.playlist.findIndex(t => t.id === trackId);
                if (trackIndex !== -1) {
                    this.currentIndex = trackIndex;
                    this.player.setPlaylist(this.playlist);
                    this.player.setCurrentIndex(trackIndex);
                    this.loadAndPlay(this.playlist[trackIndex]);
                    this.updatePlaylistDisplay();
                }
            });
        }
    }

    handleToggleFavorite(track) {
        const isFavorite = this.playlistManager.toggleFavorite(track);
        this.uiManager.showToast(
            isFavorite ? 'آهنگ به علاقه‌مندی‌ها اضافه شد' : 'آهنگ از علاقه‌مندی‌ها حذف شد',
            'success'
        );
        this.updatePlayerFavoriteButton();
    }

    handlePlayerFavorite() {
        if (!this.currentTrack) {
            this.uiManager.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        this.handleToggleFavorite(this.currentTrack);
    }

    handleAddToPlaylist(track) {
        // Show playlist selector dialog
        const playlists = this.playlistManager.getAllPlaylists()
            .filter(([id]) => id !== FAVORITE_PLAYLIST_ID);

        if (playlists.length === 0) {
            if (confirm('هیچ پلی‌لیستی وجود ندارد. می‌خواهید پلی‌لیست جدید بسازید؟')) {
                this.handleCreatePlaylist(track);
            }
            return;
        }

        // Create dialog (simplified - full implementation would use UIManager)
        const dialog = document.createElement('div');
        dialog.className = 'playlist-selector-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>اضافه کردن به پلی‌لیست</h3>
                <p>${track.title} - ${track.artist}</p>
                <div class="playlist-selector-list">
                    ${playlists.map(([id, playlist]) => `
                        <div class="playlist-selector-item">
                            <span>${playlist.name} (${playlist.tracks.length} موزیک)</span>
                            <button class="btn btn-small btn-select-playlist" data-playlist-id="${id}">انتخاب</button>
                        </div>
                    `).join('')}
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-secondary btn-close-dialog">انصراف</button>
                    <button class="btn btn-primary btn-create-new-from-dialog">پلی‌لیست جدید</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        dialog.querySelector('.btn-close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });

        dialog.querySelector('.btn-create-new-from-dialog').addEventListener('click', () => {
            const id = this.handleCreatePlaylist(track);
            if (id) {
                document.body.removeChild(dialog);
            }
        });

        dialog.querySelectorAll('.btn-select-playlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const playlistId = btn.dataset.playlistId;
                try {
                    this.playlistManager.addTrackToPlaylist(playlistId, track);
                    this.uiManager.showToast('موزیک به پلی‌لیست اضافه شد', 'success');
                    document.body.removeChild(dialog);
                } catch (error) {
                    this.uiManager.showToast(error.message, 'error');
                }
            });
        });
    }

    handlePlayerAddToPlaylist() {
        if (!this.currentTrack) {
            this.uiManager.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        this.handleAddToPlaylist(this.currentTrack);
    }
    
    handleRemoveFromPlaylist(trackId) {
        const playlistId = this.playlistManager.getCurrentPlaylistId();
        if (!playlistId) {
            // Remove from current playing playlist
            const index = this.playlist.findIndex(t => t.id === trackId);
            if (index !== -1) {
                this.playlist.splice(index, 1);
                if (this.currentIndex >= this.playlist.length) {
                    this.currentIndex = -1;
                    this.currentTrack = null;
                } else if (this.currentIndex > index) {
                    this.currentIndex--;
                }
                this.player.setPlaylist(this.playlist);
                this.player.setCurrentIndex(this.currentIndex);
                this.updatePlaylistDisplay();
                this.savePlaylist();
            }
            return;
        }
        
        const playlist = this.playlistManager.getPlaylist(playlistId);
        if (!playlist) return;
        
        const index = playlist.tracks.findIndex(t => t.id === trackId);
        if (index !== -1) {
            try {
                this.playlistManager.removeTrackFromPlaylist(playlistId, index);
                this.uiManager.showToast('آهنگ از پلی‌لیست حذف شد', 'success');
                
                // Update current playlist if it's the same
                if (this.playlistManager.getCurrentPlaylistId() === playlistId) {
                    this.playlist = [...playlist.tracks];
                    if (this.currentIndex >= this.playlist.length) {
                        this.currentIndex = -1;
                        this.currentTrack = null;
                    }
                    this.player.setPlaylist(this.playlist);
                    this.player.setCurrentIndex(this.currentIndex);
                }
                
                this.displayPlaylists();
                this.displayPlaylistTracks(playlist.tracks);
                this.savePlaylist();
            } catch (error) {
                this.uiManager.showToast(error.message, 'error');
            }
        }
    }

    // Lyrics handlers
    handlePlayerLyrics() {
        if (!this.currentTrack) {
            this.uiManager.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        this.navigation.navigateToPage('lyrics');
        this.loadLyricsPage();
    }

    async loadLyricsPage(forceReload = false) {
        if (!this.currentTrack) return;

        if (this.lyricsPageTrackTitle) {
            this.lyricsPageTrackTitle.textContent = this.currentTrack.title || '-';
        }
        if (this.lyricsPageTrackArtist) {
            this.lyricsPageTrackArtist.textContent = this.currentTrack.artist || '-';
        }

        const cached = this.lyricsManager.getCachedLyrics(this.currentTrack);
        if (!forceReload && cached !== undefined) {
            if (typeof cached === 'string' && cached.trim()) {
                this.displayLyricsPageContent(cached);
                return;
            } else {
                this.displayLyricsPageError('متن آهنگ یافت نشد');
                return;
            }
        }

        if (this.lyricsPageContent) {
            this.lyricsPageContent.innerHTML = `
                <div class="lyrics-loading">
                    <div class="spinner spinner-small"></div>
                    <p>در حال بارگذاری متن آهنگ...</p>
                </div>
            `;
        }

        try {
            const lyrics = await this.lyricsManager.extractLyrics(this.currentTrack, forceReload);
            if (lyrics && lyrics.trim()) {
                this.displayLyricsPageContent(lyrics);
            } else {
                this.displayLyricsPageError('متن آهنگ یافت نشد');
            }
        } catch (error) {
            console.error('Error loading lyrics:', error);
            this.displayLyricsPageError('خطا در بارگذاری متن آهنگ');
        }
    }

    displayLyricsPageContent(lyrics) {
        if (!this.lyricsPageContent) return;
        const formatted = this.lyricsManager.formatLyricsForLyricsPage(lyrics);
        this.lyricsPageContent.innerHTML = `<div class="lyrics-text-page">${formatted}</div>`;
    }

    displayLyricsPageError(message) {
        if (!this.lyricsPageContent) return;
        this.lyricsPageContent.innerHTML = `
            <div class="lyrics-empty">
                <p>${message}</p>
            </div>
        `;
    }

    handleRefreshLyrics() {
        if (!this.currentTrack) return;
        this.lyricsManager.clearCache(this.currentTrack);
        this.loadLyricsPage(true);
    }

    retryLoadLyrics() {
        if (!this.currentTrack) return;
        this.lyricsManager.clearCache(this.currentTrack);
        this.showLyrics(true);
    }

    async showLyrics(forceReload = false) {
        if (!this.lyricsSection || !this.lyricsContent || !this.currentTrack) return;

        this.lyricsSection.style.display = 'block';
        if (this.lyricsFooter) {
            this.lyricsFooter.style.display = 'none';
        }

        const cached = this.lyricsManager.getCachedLyrics(this.currentTrack);
        if (!forceReload && cached !== undefined) {
            if (typeof cached === 'string' && cached.trim()) {
                const formatted = this.lyricsManager.formatLyricsForPlayer(cached);
                this.lyricsContent.innerHTML = `<div class="lyrics-text">${formatted}</div>`;
                return;
            } else {
                this.lyricsContent.innerHTML = `
                    <div class="lyrics-empty">
                        <p>متن آهنگ یافت نشد</p>
                    </div>
                `;
                if (this.lyricsFooter) {
                    this.lyricsFooter.style.display = 'flex';
                }
                return;
            }
        }

        this.lyricsContent.innerHTML = `
            <div class="lyrics-loading">
                <div class="spinner spinner-small"></div>
                <p>در حال بارگذاری متن آهنگ...</p>
            </div>
        `;

        try {
            const lyrics = await this.lyricsManager.extractLyrics(this.currentTrack, forceReload);
            if (lyrics && lyrics.trim()) {
                const formatted = this.lyricsManager.formatLyricsForPlayer(lyrics);
                this.lyricsContent.innerHTML = `<div class="lyrics-text">${formatted}</div>`;
            } else {
                this.lyricsContent.innerHTML = `
                    <div class="lyrics-empty">
                        <p>متن آهنگ یافت نشد</p>
                    </div>
                `;
                if (this.lyricsFooter) {
                    this.lyricsFooter.style.display = 'flex';
                }
            }
        } catch (error) {
            console.error('Error loading lyrics:', error);
            this.lyricsContent.innerHTML = `
                <div class="lyrics-error">
                    <p>خطا در بارگذاری متن آهنگ</p>
                </div>
            `;
            if (this.lyricsFooter) {
                this.lyricsFooter.style.display = 'flex';
            }
        }
    }

    hideLyrics() {
        if (this.lyricsSection) {
            this.lyricsSection.style.display = 'none';
        }
    }

    // Home page handlers
    updateHomePage() {
        this.displayRecentTracks();
        this.displayRecentPlaylists();
    }

    displayRecentTracks() {
        if (!this.recentTracksContainer) return;

        this.recentTracksContainer.innerHTML = '';

        if (!this.recentTracks || this.recentTracks.length === 0) {
            this.recentTracksContainer.innerHTML = '<p class="empty-state">هیچ موزیکی پخش نشده است</p>';
            return;
        }

        const tracksToShow = this.recentTracks.slice(0, 3);
        tracksToShow.forEach(track => {
            const isFavorite = this.playlistManager.isTrackInFavorites(track);
            const trackEl = this.uiManager.createTrackElement(track, 'home', null, { isFavorite });
            this.attachTrackElementListeners(trackEl, track, 'home');
            this.recentTracksContainer.appendChild(trackEl);
        });
    }

    displayRecentPlaylists() {
        if (!this.recentPlaylistsContainer) return;

        this.recentPlaylistsContainer.innerHTML = '';

        if (this.recentPlaylists.length === 0) {
            this.recentPlaylistsContainer.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی پخش نشده است</p>';
            return;
        }

        const playlistsToShow = this.recentPlaylists.slice(-3).reverse();
        playlistsToShow.forEach(({ id, name, tracks }) => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'recent-playlist-item';
            playlistEl.innerHTML = `
                <div class="playlist-info">
                    <h4>${name || 'بدون نام'}</h4>
                    <p>${tracks || 0} موزیک</p>
                </div>
                <button class="btn btn-small btn-play-playlist" data-playlist-id="${id}">▶ پخش</button>
            `;

            playlistEl.querySelector('.btn-play-playlist').addEventListener('click', () => {
                this.selectPlaylist(id);
            });

            this.recentPlaylistsContainer.appendChild(playlistEl);
        });
    }

    addToRecentTracks(track) {
        this.recentTracks = this.recentTracks.filter(t => t.id !== track.id);
        this.recentTracks.unshift({ ...track });
        this.recentTracks = this.recentTracks.slice(0, LIMITS.RECENT_TRACKS);
        this.saveRecentData();

        if (this.navigation.getCurrentPage() === 'home') {
            this.displayRecentTracks();
        }
    }

    addToRecentPlaylists(playlistId, playlistName, tracks) {
        const tracksCount = Array.isArray(tracks) ? tracks.length : (typeof tracks === 'number' ? tracks : 0);
        this.recentPlaylists = this.recentPlaylists.filter(p => p.id !== playlistId);
        this.recentPlaylists.unshift({ id: playlistId, name: playlistName, tracks: tracksCount });
        this.recentPlaylists = this.recentPlaylists.slice(0, LIMITS.RECENT_PLAYLISTS);
        this.saveRecentData();

        if (this.navigation.getCurrentPage() === 'home') {
            this.displayRecentPlaylists();
        }
    }

    saveRecentData() {
        StorageManager.saveRecentData(
            this.recentTracks,
            this.recentPlaylists,
            this.searchManager.getSearchHistory()
        );
    }

    // Explore handlers
    async loadExploreData() {
        await Promise.all([
            this.loadLatestTracks(),
            this.loadTopMonthly(),
            this.loadPodcasts()
        ]);
    }

    async loadLatestTracks() {
        if (!this.latestTracksList) return;

        const url = 'https://mytehranmusic.com/';
        const cached = this.exploreManager.getCachedItems(url);

        if (cached && cached.length > 0) {
            this.renderExploreItems(this.latestTracksList, cached, true, 'latest');
        } else {
            this.latestTracksList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }

        try {
            const { items, hasMore } = await this.exploreManager.fetchExploreItems(url, 5);
            if (this.exploreManager.hasItemsChanged(cached, items)) {
                this.renderExploreItems(this.latestTracksList, items, hasMore, 'latest');
            }
        } catch (error) {
            console.error('Error loading latest tracks:', error);
        }
    }

    async loadTopMonthly() {
        if (!this.topMonthlyList) return;

        const url = 'https://mytehranmusic.com/top-month-tehranmusic/';
        const cached = this.exploreManager.getCachedItems(url);

        if (cached && cached.length > 0) {
            this.renderExploreItems(this.topMonthlyList, cached, true, 'topMonthly');
        } else {
            this.topMonthlyList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }

        try {
            const { items, hasMore } = await this.exploreManager.fetchExploreItems(url, 5);
            if (this.exploreManager.hasItemsChanged(cached, items)) {
                this.renderExploreItems(this.topMonthlyList, items, hasMore, 'topMonthly');
            }
        } catch (error) {
            console.error('Error loading top monthly:', error);
        }
    }

    async loadPodcasts() {
        if (!this.podcastsList) return;

        const url = 'https://mytehranmusic.com/podcasts/';
        const cached = this.exploreManager.getCachedItems(url);

        if (cached && cached.length > 0) {
            this.renderExploreItems(this.podcastsList, cached, true, 'podcasts');
        } else {
            this.podcastsList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }

        try {
            const { items, hasMore } = await this.exploreManager.fetchExploreItems(url, 5);
            if (this.exploreManager.hasItemsChanged(cached, items)) {
                this.renderExploreItems(this.podcastsList, items, hasMore, 'podcasts');
            }
        } catch (error) {
            console.error('Error loading podcasts:', error);
        }
    }

    renderExploreItems(container, items, hasMore, type) {
        if (!container) return;

        container.innerHTML = '';

        items.forEach(track => {
            const isFavorite = this.playlistManager.isTrackInFavorites(track);
            const item = this.uiManager.createTrackElement(track, 'explore', null, { isFavorite });
            
            // Store track object in element for easy access
            item._trackData = track;
            
            this.attachTrackElementListeners(item, track, 'explore');
            container.appendChild(item);
        });

        if (hasMore) {
            const viewMoreBtn = document.createElement('div');
            viewMoreBtn.className = 'explore-view-more';
            viewMoreBtn.innerHTML = `
                <div class="explore-view-more-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8z"/>
                    </svg>
                    <span>مشاهده بیشتر</span>
                </div>
            `;
            viewMoreBtn.addEventListener('click', () => {
                this.exploreManager.currentExploreType = type;
                this.navigation.navigateToPage('exploreDetail');
                this.loadExploreDetail(type, 1);
            });
            container.appendChild(viewMoreBtn);
        }
    }

    async loadExploreDetail(type, page = 1) {
        if (this.exploreManager.exploreLoading) return;

        this.exploreManager.exploreLoading = true;

        if (page === 1) {
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'flex';
            }
            if (this.exploreDetailContainer) {
                this.exploreDetailContainer.innerHTML = '';
            }
        } else {
            if (this.exploreDetailInfiniteLoader) {
                this.exploreDetailInfiniteLoader.style.display = 'flex';
            }
        }

        const url = this.exploreManager.getExploreUrl(type, page);
        const title = this.exploreManager.getExploreTitle(type);

        if (this.exploreDetailTitle) {
            this.exploreDetailTitle.textContent = title;
        }

        try {
            const { items, hasMore } = await this.exploreManager.fetchExploreItems(url, 20);
            this.exploreManager.exploreHasMore = hasMore;
            this.exploreManager.currentExplorePage = page;

            items.forEach(track => {
                const isFavorite = this.playlistManager.isTrackInFavorites(track);
                const trackEl = this.uiManager.createTrackElement(track, 'explore', null, { isFavorite });
                this.attachTrackElementListeners(trackEl, track, 'explore');
                if (this.exploreDetailContainer) {
                    this.exploreDetailContainer.appendChild(trackEl);
                }
            });

            if (this.exploreDetailInfiniteLoader) {
                this.exploreDetailInfiniteLoader.style.display = 'none';
            }
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'none';
            }

            this.exploreManager.exploreLoading = false;

            if (hasMore && page === 1) {
                this.setupExploreDetailInfiniteScroll();
            }
        } catch (error) {
            console.error('Error loading explore detail:', error);
            this.exploreManager.exploreLoading = false;
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'none';
            }
        }
    }

    setupExploreDetailInfiniteScroll() {
        // Remove existing listener if any
        if (this.exploreDetailScrollHandler) {
            window.removeEventListener('scroll', this.exploreDetailScrollHandler);
        }
        
        this.exploreDetailScrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Show/hide scroll to top button
            if (this.exploreDetailScrollToTopBtn) {
                if (this.navigation.getCurrentPage() === 'exploreDetail' && scrollTop > 300) {
                    this.exploreDetailScrollToTopBtn.style.display = 'flex';
                } else {
                    this.exploreDetailScrollToTopBtn.style.display = 'none';
                }
            }
            
            // Load more when near bottom
            if (!this.exploreManager.exploreLoading && 
                this.exploreManager.exploreHasMore && 
                scrollTop + windowHeight >= documentHeight - 200) {
                this.loadExploreDetail(this.exploreManager.currentExploreType, this.exploreManager.currentExplorePage + 1);
            }
        };
        
        window.addEventListener('scroll', this.exploreDetailScrollHandler);
        
        // Setup scroll to top button
        if (this.exploreDetailScrollToTopBtn) {
            this.exploreDetailScrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // UI updates
    updatePlayerUI() {
        if (!this.currentTrack) return;

        this.uiManager.updatePlayerUI(this.currentTrack, {
            currentTrackEl: this.currentTrackEl,
            currentArtistEl: this.currentArtistEl,
            playerBarTitle: this.playerBarTitle,
            playerBarArtist: this.playerBarArtist,
            playerBarImage: this.playerBarImage,
            currentTrackImage: this.currentTrackImage
        });

        if (this.bottomPlayerBar) {
            this.bottomPlayerBar.style.display = 'flex';
        }

        this.updatePlayerFavoriteButton();
    }

    updatePlayerFavoriteButton() {
        if (!this.playerFavoriteBtn || !this.currentTrack) return;

        const isFavorite = this.playlistManager.isTrackInFavorites(this.currentTrack);
        if (isFavorite) {
            this.playerFavoriteBtn.classList.add('active');
            if (this.playerFavoriteIcon) {
                this.playerFavoriteIcon.setAttribute('fill', 'currentColor');
            }
        } else {
            this.playerFavoriteBtn.classList.remove('active');
            if (this.playerFavoriteIcon) {
                this.playerFavoriteIcon.setAttribute('fill', 'none');
            }
        }
    }

    updateProgressBar() {
        if (!this.audioPlayer) return;

        const percentage = this.player.getProgressPercentage();

        this.uiManager.updateProgressBar(percentage, {
            playerBarProgressFill: this.playerBarProgressFill,
            playerBarProgressHandle: this.playerBarProgressHandle,
            progressBarFill: this.progressBarFill,
            progressBarHandle: this.progressBarHandle
        }, this.player.isDraggingProgress || this.player.isDraggingPlayerProgress);

        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = this.player.getCurrentTimeFormatted();
        }
        if (this.totalTimeEl) {
            this.totalTimeEl.textContent = this.player.getTotalTimeFormatted();
        }
    }

    updatePlayButton() {
        if (!this.audioPlayer) return;
        this.uiManager.updatePlayPauseButton(!this.audioPlayer.paused, {
            playerBarPlayIcon: this.playerBarPlayIcon,
            playerBarPauseIcon: this.playerBarPauseIcon
        });
    }

    updateShuffleButton() {
        this.uiManager.updateShuffleButton(this.player.isShuffle, {
            shuffleBtn: this.shuffleBtn
        });
    }

    updateRepeatButton() {
        this.uiManager.updateRepeatButton(this.player.repeatMode, {
            repeatBtn: this.repeatBtn,
            playerBarRepeat: this.playerBarRepeat,
            playerBarRepeatOffIcon: document.getElementById('playerBarRepeatOffIcon'),
            playerBarRepeatOneIcon: document.getElementById('playerBarRepeatOneIcon'),
            playerBarRepeatAllIcon: document.getElementById('playerBarRepeatAllIcon')
        });
    }

    // Setup progress bars
    setupProgressBars() {
        // Setup bottom player bar progress
        if (this.playerBarProgressContainer && this.playerBarProgressTrack) {
            this.setupProgressBar(this.playerBarProgressContainer, this.playerBarProgressTrack, 'bottom');
        }

        // Setup player section progress
        if (this.progressBarTrack) {
            this.setupProgressBar(null, this.progressBarTrack, 'player');
        }
    }

    setupProgressBar(container, track, type) {
        let isMouseDown = false;

        const seekToPosition = (e) => {
            const rect = track.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            this.player.seekToPosition(percentage);
            this.updateProgressBar();
        };

        track.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            if (type === 'bottom') {
                this.player.isDraggingProgress = true;
            } else {
                this.player.isDraggingPlayerProgress = true;
            }
            seekToPosition(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                if (type === 'bottom' && this.player.isDraggingProgress) {
                    seekToPosition(e);
                } else if (type === 'player' && this.player.isDraggingPlayerProgress) {
                    seekToPosition(e);
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                if (type === 'bottom') {
                    this.player.isDraggingProgress = false;
                } else {
                    this.player.isDraggingPlayerProgress = false;
                }
            }
        });

        track.addEventListener('touchstart', (e) => {
            isMouseDown = true;
            if (type === 'bottom') {
                this.player.isDraggingProgress = true;
            } else {
                this.player.isDraggingPlayerProgress = true;
            }
            seekToPosition(e.touches[0]);
        });

        document.addEventListener('touchmove', (e) => {
            if (isMouseDown) {
                e.preventDefault();
                if (type === 'bottom' && this.player.isDraggingProgress) {
                    seekToPosition(e.touches[0]);
                } else if (type === 'player' && this.player.isDraggingPlayerProgress) {
                    seekToPosition(e.touches[0]);
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isMouseDown) {
                isMouseDown = false;
                if (type === 'bottom') {
                    this.player.isDraggingProgress = false;
                } else {
                    this.player.isDraggingPlayerProgress = false;
                }
            }
        });
    }

    // Infinite scroll
    setupInfiniteScroll() {
        const loader = document.getElementById('infiniteScrollLoader');
        if (!loader) return;

        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting &&
                    this.searchManager.hasMoreResults &&
                    !this.searchManager.isLoadingMore &&
                    this.searchManager.currentSearchQuery &&
                    this.navigation.getCurrentPage() === 'search') {
                    this.loadMoreSearchResults();
                }
            });
        }, {
            root: null,
            rootMargin: '200px',
            threshold: 0.1
        });

        this.scrollObserver.observe(loader);
    }

    async loadMoreSearchResults() {
        try {
            const result = await this.searchManager.loadMoreResults();
            if (result && result.results) {
                this.displaySearchResults(result.results, false);
            }
        } catch (error) {
            console.error('Error loading more results:', error);
        }
    }

    // Page content updates
    updateCurrentPageContent() {
        const currentPage = this.navigation.getCurrentPage();

        switch (currentPage) {
            case 'home':
                this.updateHomePage();
                break;
            case 'playlists':
                this.displayPlaylists();
                break;
            case 'search':
                this.displaySearchHistory();
                break;
            case 'explore':
                this.loadExploreData();
                break;
            case 'exploreDetail':
                if (this.exploreManager.currentExploreType) {
                    this.loadExploreDetail(this.exploreManager.currentExploreType, 1);
                }
                break;
        }
    }

    // Save playlist
    savePlaylist() {
        StorageManager.savePlaylist(
            this.playlist,
            this.currentIndex,
            this.playlistManager.getCurrentPlaylistId(),
            this.player.repeatMode,
            this.player.isShuffle
        );
    }

    // Reset all data
    async handleResetAll() {
        if (!confirm('آیا مطمئن هستید که می‌خواهید همه داده‌ها و کش را پاک کنید؟')) {
            return;
        }

        this.uiManager.showError('در حال پاک کردن داده‌ها و کش...');

        try {
            await StorageManager.clearAllData();

            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister()));
            }

            this.uiManager.showError('همه داده‌ها و کش پاک شد. صفحه در حال بارگذاری مجدد...');

            setTimeout(() => {
                window.location.reload(true);
            }, 1500);
        } catch (error) {
            console.error('Error resetting data:', error);
            this.uiManager.showError('خطا در پاک کردن داده‌ها: ' + error.message);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});

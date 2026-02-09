// MyTehran Music Player - Main Application Logic

class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentIndex = -1;
        this.isShuffle = false;
        this.repeatMode = 0; // 0 = no repeat, 1 = repeat one, 2 = repeat all
        this.shuffledIndices = [];
        this.searchResults = [];
        this.currentSearchQuery = '';
        this.currentSearchPage = 1;
        this.isLoadingMore = false;
        this.hasMoreResults = true;
        this.customPlaylists = {}; // Initialize customPlaylists
        this.currentPlaylistId = null;
        this.nextPlaylistId = 1;
        this.FAVORITE_PLAYLIST_ID = 'favorite'; // Special ID for favorite playlist
        this.previousPage = null; // Store previous page for player page navigation
        this.currentTrack = null; // Store currently playing track
        this.lyricsCache = {}; // Cache for lyrics by track URL
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadPlaylist();
        this.loadCustomPlaylists();
        this.loadRecentData();
        this.loadLyricsCache();
        this.setupInfiniteScroll();
        // Setup initial page (home) and display content
        // Use setTimeout to ensure DOM is fully ready and all data is loaded
        setTimeout(() => {
            this.setupNavigation();
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
        
        // Explore Page
        this.latestTracksList = document.getElementById('latestTracksList');
        this.topMonthlyList = document.getElementById('topMonthlyList');
        this.podcastsList = document.getElementById('podcastsList');
        this.exploreDetailContainer = document.getElementById('exploreDetailContainer');
        this.exploreDetailTitle = document.getElementById('exploreDetailTitle');
        this.exploreDetailInfiniteLoader = document.getElementById('exploreDetailInfiniteLoader');
        this.exploreDetailLoadingIndicator = document.getElementById('exploreDetailLoadingIndicator');
        this.exploreDetailScrollToTopBtn = document.getElementById('exploreDetailScrollToTopBtn');
        this.backFromExploreDetailBtn = document.getElementById('backFromExploreDetailBtn');
        
        // Setup scroll to top button for explore detail page
        if (this.exploreDetailScrollToTopBtn) {
            this.exploreDetailScrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        this.currentExploreType = null;
        this.currentExplorePage = 1;
        this.exploreHasMore = false;
        this.exploreLoading = false;
        this.exploreCache = {};
        this.loadExploreCache();
        
        // Search
        this.searchInput = document.getElementById('searchInputMain');
        this.searchBtn = document.getElementById('searchBtnMain');
        
        // Player
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playerSection = document.getElementById('playerSection');
        this.currentTrackEl = document.getElementById('currentTrack');
        this.currentArtistEl = document.getElementById('currentArtist');
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
        this.playerBarRepeatOffIcon = document.getElementById('playerBarRepeatOffIcon');
        this.playerBarRepeatOneIcon = document.getElementById('playerBarRepeatOneIcon');
        this.playerBarRepeatAllIcon = document.getElementById('playerBarRepeatAllIcon');
        this.playerBarShuffleOffIcon = document.getElementById('playerBarShuffleOffIcon');
        this.playerBarShuffleOnIcon = document.getElementById('playerBarShuffleOnIcon');
        
        // Progress Bar (Bottom Player Bar)
        this.playerBarProgressContainer = document.getElementById('playerBarProgressContainer');
        this.playerBarProgressTrack = document.getElementById('playerBarProgressTrack');
        this.playerBarProgressFill = document.getElementById('playerBarProgressFill');
        this.playerBarProgressHandle = document.getElementById('playerBarProgressHandle');
        this.isDraggingProgress = false;
        
        // Progress Bar (Player Section)
        this.progressBarTrack = document.getElementById('progressBarTrack');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.progressBarHandle = document.getElementById('progressBarHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        this.isDraggingPlayerProgress = false;
        
        // Controls
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Player section action buttons
        this.playerFavoriteBtn = document.getElementById('playerFavoriteBtn');
        this.playerAddToPlaylistBtn = document.getElementById('playerAddToPlaylistBtn');
        this.playerLyricsBtn = document.getElementById('playerLyricsBtn');
        this.playerFavoriteIcon = document.getElementById('playerFavoriteIcon');
        
        // Lyrics section (in player page)
        this.lyricsSection = document.getElementById('lyricsSection');
        this.lyricsContent = document.getElementById('lyricsContent');
        this.lyricsFooter = document.getElementById('lyricsFooter');
        this.closeLyricsBtn = document.getElementById('closeLyricsBtn');
        this.retryLyricsBtn = document.getElementById('retryLyricsBtn');
        
        // Lyrics page
        this.lyricsPageContent = document.getElementById('lyricsPageContent');
        this.lyricsPageTrackTitle = document.getElementById('lyricsPageTrackTitle');
        this.lyricsPageTrackArtist = document.getElementById('lyricsPageTrackArtist');
        this.backFromLyricsBtn = document.getElementById('backFromLyricsBtn');
        this.refreshLyricsBtn = document.getElementById('refreshLyricsBtn');
        
        // Home Page
        this.recentTracksContainer = document.getElementById('recentTracks');
        this.recentPlaylistsContainer = document.getElementById('recentPlaylists');
        this.resetAllBtn = document.getElementById('resetAllBtn');
        
        // Search Page
        this.searchHistoryList = document.getElementById('searchHistoryList');
        this.searchResultsMain = document.getElementById('searchResultsMain');
        this.resultsContainerMain = document.getElementById('resultsContainerMain');
        this.searchLoadingIndicator = document.getElementById('searchLoadingIndicator');
        this.searchScrollToTopBtn = document.getElementById('searchScrollToTopBtn');
        
        // Setup scroll to top button for search page
        if (this.searchScrollToTopBtn) {
            this.searchScrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // Show/hide button based on scroll position
            this.searchScrollHandler = () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (this.currentPage === 'search' && scrollTop > 300) {
                    this.searchScrollToTopBtn.style.display = 'flex';
                } else {
                    this.searchScrollToTopBtn.style.display = 'none';
                }
            };
            window.addEventListener('scroll', this.searchScrollHandler);
        }
        
        // Playlists Page
        this.playlistsListMain = document.getElementById('playlistsListMain');
        this.createPlaylistBtnMain = document.getElementById('createPlaylistBtnMain');
        this.playlistDetailPage = document.getElementById('playlistDetailPage');
        this.playlistTracksContainer = document.getElementById('playlistTracksContainer');
        this.backToPlaylistsBtn = document.getElementById('backToPlaylistsBtn');
        
        // UI
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.toastContainer = document.getElementById('toastContainer');
    }

    attachEventListeners() {
        // Search
        this.searchBtn.addEventListener('click', () => this.search());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // Audio events
        this.audioPlayer.addEventListener('ended', () => {
            if (this.repeatMode === 1) {
                // Repeat one: play the same track again
                this.audioPlayer.currentTime = 0;
                this.audioPlayer.play();
            } else {
                // Play next track
                this.playNext();
            }
        });
        this.audioPlayer.addEventListener('error', (e) => {
            this.showError('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.');
            this.playNext();
        });
        this.audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgressBar();
        });
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.updateProgressBar();
        });
        
        // Player section progress bar event listeners
        if (this.progressBarTrack) {
            this.setupPlayerProgressBar();
        }

        // Player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Player section action buttons
        if (this.playerFavoriteBtn) {
            this.playerFavoriteBtn.addEventListener('click', () => this.handlePlayerFavorite());
        }
        if (this.playerAddToPlaylistBtn) {
            this.playerAddToPlaylistBtn.addEventListener('click', () => this.handlePlayerAddToPlaylist());
        }
        if (this.playerLyricsBtn) {
            this.playerLyricsBtn.addEventListener('click', () => this.handlePlayerLyrics());
        }
        if (this.closeLyricsBtn) {
            this.closeLyricsBtn.addEventListener('click', () => this.hideLyrics());
        }
        if (this.retryLyricsBtn) {
            this.retryLyricsBtn.addEventListener('click', () => this.retryLoadLyrics());
        }
        if (this.backFromLyricsBtn) {
            this.backFromLyricsBtn.addEventListener('click', () => {
                this.navigateToPage('player');
            });
        }
        if (this.refreshLyricsBtn) {
            this.refreshLyricsBtn.addEventListener('click', () => this.handleRefreshLyrics());
        }
        if (this.backFromExploreDetailBtn) {
            this.backFromExploreDetailBtn.addEventListener('click', () => {
                this.navigateToPage('explore');
            });
        }

        // Playlist controls
        if (this.clearPlaylistBtn) {
            this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        }
        
        // Custom Playlists (old - keep for compatibility)
        if (this.createPlaylistBtn) {
            this.createPlaylistBtn.addEventListener('click', () => this.createNewPlaylist());
        }
        
        // Navigation - Bottom Nav
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
                    this.navigateToPage(page);
                }
            });
        });
        
        // Back to playlists button
        if (this.backToPlaylistsBtn) {
            this.backToPlaylistsBtn.addEventListener('click', () => {
                if (this.playlistDetailPage) {
                    this.playlistDetailPage.style.display = 'none';
                    this.playlistDetailPage.style.visibility = 'hidden';
                    this.playlistDetailPage.classList.remove('active');
                }
                // Ensure we navigate to playlists page
                this.previousPage = null;
                this.navigateToPage('playlists');
            });
        }
        
        // Player page navigation - click on player bar track info
        if (this.playerBarTrack) {
            this.playerBarTrack.addEventListener('click', () => {
                // Only navigate if there's a track playing
                if (this.currentIndex >= 0 && this.playlist.length > 0) {
                    // Save current page before navigating to player page
                    // Only save if current page is not player to avoid loops
                    if (this.currentPage && this.currentPage !== 'player') {
                        this.previousPage = this.currentPage;
                    } else if (!this.previousPage) {
                        this.previousPage = 'home';
                    }
                    this.navigateToPage('player');
                }
            });
        }
        
        // Back from player page button
        if (this.backFromPlayerBtn) {
            this.backFromPlayerBtn.addEventListener('click', () => {
                // Get previous page, ensuring it's not player
                let targetPage = this.previousPage;
                
                // If previousPage is not set or is player, go to home
                if (!targetPage || targetPage === 'player') {
                    targetPage = 'home';
                }
                
                // Clear previousPage to prevent loops
                this.previousPage = null;
                
                // Navigate to target page
                this.navigateToPage(targetPage);
            });
        }
        
        // Search (Main)
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.searchMain());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchMain();
            });
        }
        
        // Playlists Page
        if (this.createPlaylistBtnMain) {
            this.createPlaylistBtnMain.addEventListener('click', () => this.createNewPlaylist());
        }
        
        // Reset All Button
        if (this.resetAllBtn) {
            this.resetAllBtn.addEventListener('click', () => this.resetAllData());
        }
        
        // Bottom Player Bar
        if (this.playerBarPlayPause) {
            this.playerBarPlayPause.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.playerBarPrev) {
            this.playerBarPrev.addEventListener('click', () => this.playPrevious());
        }
        if (this.playerBarNext) {
            this.playerBarNext.addEventListener('click', () => this.playNext());
        }
        if (this.playerBarRepeat) {
            this.playerBarRepeat.addEventListener('click', () => this.toggleRepeat());
        }
        if (this.playerBarShuffle) {
            this.playerBarShuffle.addEventListener('click', () => this.toggleShuffle());
        }
        
        // Progress Bar Events
        if (this.playerBarProgressContainer) {
            this.setupProgressBar();
        }
    }
    
    setupProgressBar() {
        if (!this.playerBarProgressContainer || !this.playerBarProgressTrack) return;
        
        // Click to seek
        this.playerBarProgressContainer.addEventListener('click', (e) => {
            if (this.isDraggingProgress) return;
            this.seekToPosition(e);
        });
        
        // Drag to seek
        let isMouseDown = false;
        
        this.playerBarProgressTrack.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            this.isDraggingProgress = true;
            this.playerBarProgressContainer.classList.add('dragging');
            this.seekToPosition(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isMouseDown && this.isDraggingProgress) {
                this.seekToPosition(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.isDraggingProgress = false;
                this.playerBarProgressContainer.classList.remove('dragging');
            }
        });
        
        // Touch events for mobile
        this.playerBarProgressTrack.addEventListener('touchstart', (e) => {
            isMouseDown = true;
            this.isDraggingProgress = true;
            this.playerBarProgressContainer.classList.add('dragging');
            this.seekToPosition(e.touches[0]);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isMouseDown && this.isDraggingProgress) {
                e.preventDefault();
                this.seekToPosition(e.touches[0]);
            }
        });
        
        document.addEventListener('touchend', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.isDraggingProgress = false;
                this.playerBarProgressContainer.classList.remove('dragging');
            }
        });
    }
    
    seekToPosition(e) {
        if (!this.playerBarProgressTrack || !this.audioPlayer) return;
        
        const rect = this.playerBarProgressTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        if (this.audioPlayer.duration) {
            this.audioPlayer.currentTime = percentage * this.audioPlayer.duration;
            this.updateProgressBar();
        }
    }
    
    setupPlayerProgressBar() {
        if (!this.progressBarTrack) return;
        
        let isMouseDown = false;
        
        // Mouse events
        this.progressBarTrack.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            this.isDraggingPlayerProgress = true;
            this.seekToPlayerPosition(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isMouseDown && this.isDraggingPlayerProgress) {
                this.seekToPlayerPosition(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.isDraggingPlayerProgress = false;
            }
        });
        
        // Touch events for mobile
        this.progressBarTrack.addEventListener('touchstart', (e) => {
            isMouseDown = true;
            this.isDraggingPlayerProgress = true;
            this.seekToPlayerPosition(e.touches[0]);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isMouseDown && this.isDraggingPlayerProgress) {
                e.preventDefault();
                this.seekToPlayerPosition(e.touches[0]);
            }
        });
        
        document.addEventListener('touchend', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.isDraggingPlayerProgress = false;
            }
        });
    }
    
    seekToPlayerPosition(e) {
        if (!this.progressBarTrack || !this.audioPlayer) return;
        
        const rect = this.progressBarTrack.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        if (this.audioPlayer.duration) {
            this.audioPlayer.currentTime = percentage * this.audioPlayer.duration;
            this.updateProgressBar();
        }
    }
    
    updateProgressBar() {
        if (!this.audioPlayer) return;
        
        // Update bottom player bar progress
        if (this.playerBarProgressFill && this.playerBarProgressHandle && !this.isDraggingProgress) {
            if (this.audioPlayer.duration && this.audioPlayer.duration > 0) {
                const percentage = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                this.playerBarProgressFill.style.width = percentage + '%';
                this.playerBarProgressHandle.style.left = percentage + '%';
            } else {
                this.playerBarProgressFill.style.width = '0%';
                this.playerBarProgressHandle.style.left = '0%';
            }
        }
        
        // Update player section progress bar
        if (this.progressBarFill && this.progressBarHandle && !this.isDraggingPlayerProgress) {
            if (this.audioPlayer.duration && this.audioPlayer.duration > 0) {
                const percentage = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                this.progressBarFill.style.width = percentage + '%';
                this.progressBarHandle.style.left = percentage + '%';
            } else {
                this.progressBarFill.style.width = '0%';
                this.progressBarHandle.style.left = '0%';
            }
        }
        
        // Update time displays
        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = this.formatTime(this.audioPlayer.currentTime || 0);
        }
        if (this.totalTimeEl && this.audioPlayer.duration) {
            this.totalTimeEl.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async search() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('لطفا نام موزیک را وارد کنید');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            // Use the correct search URL format: https://mytehranmusic.com/?s=query
            const result = await this.fetchSearchResults(query, 1);
            const results = result.results || [];
            
            this.searchResults = results;
            this.displayResults(results);
            this.showLoading(false);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('خطا در جستجو. لطفا دوباره تلاش کنید.');
            this.showLoading(false);
        }
    }

    async fetchSearchResults(query, page = 1) {
        // Use the correct search URL format: https://mytehranmusic.com/?s=query&paged=page
        let searchUrl = `https://mytehranmusic.com/?s=${encodeURIComponent(query)}`;
        if (page > 1) {
            searchUrl += `&paged=${page}`;
        }
        
        // Use CORS proxy to bypass CORS restrictions
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const htmlContent = data.contents;
            
            return this.parseSearchResults(htmlContent, query, page);
        } catch (error) {
            console.warn('Error fetching search results:', error);
            // Try alternative proxy services
            return await this.fetchSearchResultsAlternative(query, page);
        }
    }

    async fetchSearchResultsAlternative(query, page = 1) {
        let searchUrl = `https://mytehranmusic.com/?s=${encodeURIComponent(query)}`;
        if (page > 1) {
            searchUrl += `&paged=${page}`;
        }
        
        // Try alternative CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const htmlContent = await response.text();
            return this.parseSearchResults(htmlContent, query, page);
        } catch (error) {
            console.warn('Alternative proxy also failed:', error);
            const fallback = this.fallbackSearchResults(query);
            return {
                results: fallback,
                hasMore: false,
                page: page
            };
        }
    }

    parseSearchResults(html, query, page = 1) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];

        // Parse based on the actual structure: div.grid-item contains each music track
        // Structure: div.grid-item > div.mcpplay (with data attributes) > div.title > div.artist
        const gridItems = doc.querySelectorAll('div.grid-item');
        
        console.log(`Found ${gridItems.length} grid items`);
        
        gridItems.forEach((gridItem, index) => {
            // Find the play button with data attributes
            const playButton = gridItem.querySelector('div.mcpplay');
            
            if (!playButton) {
                return; // Skip if no play button found
            }
            
            // Extract data from data attributes (most reliable)
            const trackTitle = playButton.getAttribute('data-track') || '';
            const artist = playButton.getAttribute('data-artist') || 'ناشناس';
            const imageUrl = playButton.getAttribute('data-image') || '';
            const musicUrl = playButton.getAttribute('data-music') || '';
            
            // Fallback: try to get from DOM elements if data attributes are missing
            let title = trackTitle;
            let image = imageUrl;
            let url = musicUrl; // This is the direct music URL from data-music
            let pageUrl = ''; // This is the page URL (fallback)
            
            // Get title from div.title if data-track is missing
            if (!title) {
                const titleEl = gridItem.querySelector('div.title a');
                if (titleEl) {
                    title = titleEl.textContent.trim();
                }
            }
            
            // Get artist from div.artist if data-artist is missing
            let finalArtist = artist;
            if (!finalArtist || finalArtist === 'ناشناس') {
                const artistEl = gridItem.querySelector('div.artist a');
                if (artistEl) {
                    finalArtist = artistEl.textContent.trim();
                }
            }
            
            // Get image from img tag if data-image is missing
            if (!image) {
                const imgEl = gridItem.querySelector('div.img img, img[src*="timthumb"], img[alt="Cover"]');
                if (imgEl) {
                    image = imgEl.src || imgEl.getAttribute('src') || '';
                    // If it's a timthumb URL, try to extract original or use as is
                    // timthumb URLs are fine to use directly
                }
            }
            
            // Get page URL (for fallback if music URL is missing)
            const pageLink = gridItem.querySelector('div.title a, div.img a');
            if (pageLink) {
                pageUrl = pageLink.href || pageLink.getAttribute('href') || '';
                if (pageUrl && !pageUrl.startsWith('http')) {
                    pageUrl = `https://mytehranmusic.com${pageUrl}`;
                }
            }
            
            // Normalize image URL
            if (image && !image.startsWith('http') && !image.startsWith('data:')) {
                if (image.startsWith('//')) {
                    image = 'https:' + image;
                } else if (image.startsWith('/')) {
                    image = 'https://mytehranmusic.com' + image;
                } else {
                    image = 'https://mytehranmusic.com/' + image;
                }
            }
            
            // Normalize music URL (direct audio file URL from data-music)
            if (url && !url.startsWith('http') && !url.startsWith('data:')) {
                if (url.startsWith('//')) {
                    url = 'https:' + url;
                } else if (url.startsWith('/')) {
                    url = 'https://mytehranmusic.com' + url;
                } else {
                    // If it's a relative path, make it absolute
                    url = 'https://mytehranmusic.com/' + url;
                }
            }
            
            // If no direct music URL, use page URL as fallback
            if (!url && pageUrl) {
                url = pageUrl;
            }
            
            // Only add if we have at least title and some URL
            if (title && url) {
                // Store both direct music URL and page URL
                const trackData = {
                    id: Date.now() + index + (page - 1) * 10000, // Unique ID per page
                    title: title.trim(),
                    artist: finalArtist.trim() || 'ناشناس',
                    url: url, // Direct music URL from data-music if available, otherwise page URL
                    image: image || ''
                };
                
                // Store page URL separately if we have direct music URL
                if (musicUrl && musicUrl === url) {
                    // We have direct music URL, store page URL for fallback
                    trackData.pageUrl = pageUrl;
                } else if (pageUrl && pageUrl === url) {
                    // We only have page URL, no direct music URL
                    trackData.pageUrl = pageUrl;
                }
                
                console.log('Parsed track:', trackData.title, 'URL:', trackData.url, 'PageURL:', trackData.pageUrl);
                
                results.push(trackData);
            }
        });

        console.log(`Parsed ${results.length} tracks from page ${page}`);

        // Check for pagination after parsing results
        let hasMore = false;
        if (results.length > 0) {
            hasMore = this.checkForMorePages(doc);
            console.log(`Has more pages: ${hasMore}`);
        }

        if (results.length === 0) {
            const fallback = this.fallbackSearchResults(query);
            return {
                results: fallback,
                hasMore: false,
                page: page
            };
        }
        
        return {
            results: results,
            hasMore: hasMore,
            page: page
        };
    }

    checkForMorePages(doc) {
        // Check for pagination links - WordPress typically uses .page-numbers or .pagination
        const nextLink = doc.querySelector('a.next.page-numbers, .pagination a.next, .wp-pagenavi a.next, a[rel="next"]');
        if (nextLink) {
            return true;
        }
        
        // Check if there are multiple pages by looking for page numbers
        const pageNumbers = doc.querySelectorAll('.page-numbers, .pagination a, .wp-pagenavi a');
        if (pageNumbers.length > 1) {
            // Check if current page is not the last
            let maxPage = 1;
            pageNumbers.forEach(link => {
                const text = link.textContent.trim();
                const pageNum = parseInt(text);
                if (!isNaN(pageNum) && pageNum > maxPage) {
                    maxPage = pageNum;
                }
            });
            // If we found page numbers > 1, assume there might be more
            return maxPage > 1;
        }
        
        // Default: assume there might be more if we got results
        return true;
    }

    fallbackSearchResults(query) {
        // Fallback method: Create a structure that allows manual URL input
        // This is a workaround when direct parsing fails
        return [{
            id: Date.now(),
            title: `نتایج جستجو برای: ${query}`,
            artist: 'برای استفاده، لطفا لینک مستقیم موزیک را وارد کنید',
            url: '',
            image: '',
            isPlaceholder: true
        }];
    }

    displayResults(results) {
        // This function is for old layout, skip if containers don't exist
        if (!this.resultsContainer) {
            return; // Skip if container doesn't exist
        }
        
        this.resultsContainer.innerHTML = '';
        
        if (this.resultsCount) {
            this.resultsCount.textContent = results.length;
        }

        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<p class="empty-state">نتیجه‌ای یافت نشد</p>';
            return;
        }

        results.forEach((track, index) => {
            const trackElement = this.createTrackElement(track, 'results');
            this.resultsContainer.appendChild(trackElement);
        });
    }

    createTrackElement(track, source = 'playlist', index = null) {
        const div = document.createElement('div');
        div.className = 'track-item';
        
        // Add compact class for playlist-detail
        if (source === 'playlist-detail') {
            div.classList.add('compact');
        }
        
        div.dataset.trackId = track.id;
        // Store track data for explore items
        if (source === 'explore') {
            div.dataset.trackTitle = track.title || '';
            div.dataset.trackArtist = track.artist || '';
            div.dataset.trackImage = track.image || '';
            div.dataset.trackUrl = track.url || '';
            div.dataset.trackPageUrl = track.pageUrl || '';
        }

        // Check if this track is currently playing
        const isCurrentlyPlaying = source !== 'results' && 
                                   this.currentIndex >= 0 && 
                                   this.playlist[this.currentIndex] && 
                                   this.playlist[this.currentIndex].id === track.id;
        
        if (isCurrentlyPlaying) {
            div.classList.add('active');
        }

        // Ensure track has required properties
        const trackTitle = track.title || 'بدون عنوان';
        const trackArtist = track.artist || 'ناشناس';
        const trackImage = track.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b3b3b3"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
        
        // Check if track is in favorite list (pass track object for URL comparison)
        const isFavorite = this.isTrackInFavoritesByUrl(track);
        
        // Different layout for playlist-detail (Spotify-style)
        if (source === 'playlist-detail') {
            const trackNumber = index !== null ? index + 1 : '';
            const showPlayButton = isCurrentlyPlaying;
            div.innerHTML = `
                ${showPlayButton ? '' : `<span class="track-number">${trackNumber}</span>`}
                <button class="track-play-button" data-action="play" data-track-id="${track.id || Date.now()}" title="پخش" style="display: ${showPlayButton ? 'flex' : 'none'};">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <div class="track-image-compact">
                    <img src="${trackImage}" alt="${this.escapeHtml(trackTitle)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23b3b3b3\\'%3E%3Cpath d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/%3E%3C/svg%3E'">
                </div>
                <div class="track-info-compact">
                    <span class="track-title-compact">${this.escapeHtml(trackTitle)}</span>
                    <span class="track-artist-compact">${this.escapeHtml(trackArtist)}</span>
                </div>
                <button class="btn-remove-compact" data-action="remove" data-track-id="${track.id || Date.now()}" title="حذف از پلی‌لیست">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            `;
        } else {
            div.innerHTML = `
                <div class="track-image">
                    <img src="${trackImage}" alt="${this.escapeHtml(track.title)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23b3b3b3\\'%3E%3Cpath d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/%3E%3C/svg%3E'">
                </div>
                <div class="track-info">
                    <h4>${this.escapeHtml(track.title)}</h4>
                    <p>${this.escapeHtml(track.artist)}</p>
                </div>
                <div class="track-actions">
                    ${source === 'playlist' ? 
                        // For playlist page, show play and remove buttons
                        `<button class="btn btn-small btn-play" data-action="play" data-track-id="${track.id}" title="پخش">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                         </button>
                         <button class="btn btn-small btn-remove" data-action="remove" data-track-id="${track.id}" title="حذف">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                         </button>` :
                        // For results, explore, home, and other sources: show play, add-to-custom, and favorite buttons
                        `<button class="btn btn-small btn-play" data-action="play" data-track-id="${track.id}" title="پخش">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                         </button>
                         <button class="btn btn-small btn-add-to-custom" data-action="add-to-custom" data-track-id="${track.id}" title="اضافه به پلی‌لیست سفارشی">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                         </button>
                         <button class="btn btn-small btn-favorite ${isFavorite ? 'favorite-active' : ''}" data-action="toggle-favorite" data-track-id="${track.id}" title="${isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'اضافه به علاقه‌مندی‌ها'}">
                            <svg class="heart-icon" width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                         </button>`
                    }
                </div>
            `;
        }

        // Attach event listeners
        div.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const action = btn.dataset.action;
                const trackIdStr = btn.dataset.trackId;
                
                if (!trackIdStr) {
                    console.warn('No trackId found for button:', btn);
                    return;
                }
                
                const trackId = parseInt(trackIdStr);
                if (isNaN(trackId)) {
                    console.warn('Invalid trackId:', trackIdStr);
                    return;
                }
                
                if (action === 'toggle-favorite') {
                    // For explore tracks, use track object directly
                    if (source === 'explore' && track) {
                        this.toggleFavoriteByTrack(track);
                    } else {
                        this.toggleFavorite(trackId);
                    }
                    // Update the heart icon in the UI
                    const heartBtn = div.querySelector('.btn-favorite');
                    const heartIcon = div.querySelector('.heart-icon');
                    const isFav = this.isTrackInFavoritesByUrl(track);
                    if (isFav) {
                        heartBtn.classList.add('favorite-active');
                        heartBtn.title = 'حذف از علاقه‌مندی‌ها';
                        heartIcon.setAttribute('fill', 'currentColor');
                    } else {
                        heartBtn.classList.remove('favorite-active');
                        heartBtn.title = 'اضافه به علاقه‌مندی‌ها';
                        heartIcon.setAttribute('fill', 'none');
                    }
                } else if (action === 'add-to-custom') {
                    // Find track from different sources
                    let trackToAdd = null;
                    if (source === 'results') {
                        trackToAdd = this.searchResults.find(t => t.id === trackId);
                    } else if (source === 'explore' || source === 'home') {
                        // For explore and home, use the track object passed to createTrackElement
                        trackToAdd = track;
                    }
                    
                    if (trackToAdd) {
                        this.showAddToPlaylistDialogByTrack(trackToAdd);
                    } else {
                        console.warn('Track not found for add-to-custom:', trackId, 'source:', source);
                        // Try to reconstruct track from DOM as fallback for explore
                        if (source === 'explore') {
                            const trackTitle = div.dataset.trackTitle;
                            const trackArtist = div.dataset.trackArtist;
                            const trackImage = div.dataset.trackImage;
                            const trackUrl = div.dataset.trackUrl;
                            const trackPageUrl = div.dataset.trackPageUrl;
                            
                            if (trackTitle && trackArtist) {
                                trackToAdd = {
                                    id: trackId,
                                    title: trackTitle,
                                    artist: trackArtist,
                                    image: trackImage,
                                    url: trackUrl,
                                    pageUrl: trackPageUrl
                                };
                                this.showAddToPlaylistDialogByTrack(trackToAdd);
                            }
                        }
                    }
                } else if (action === 'play') {
                    if (source === 'playlist-detail') {
                        // Find track index in current playlist
                        const trackIndex = this.playlist.findIndex(t => t.id === trackId);
                        if (trackIndex !== -1) {
                            this.currentIndex = trackIndex;
                            this.loadAndPlay(this.playlist[trackIndex]);
                            this.updatePlaylistDisplay();
                            // Update active state in detail view
                            if (this.playlistTracksContainer) {
                                this.displayPlaylistTracks(this.playlist);
                            }
                        }
                    } else {
                        this.playTrack(trackId, source);
                    }
                } else if (action === 'remove') {
                    this.removeFromPlaylist(trackId);
                    // Refresh playlist detail if we're viewing it
                    if (source === 'playlist-detail' && this.currentPlaylistId) {
                        const playlist = this.customPlaylists[this.currentPlaylistId];
                        if (playlist && this.playlistTracksContainer) {
                            this.displayPlaylistTracks(playlist.tracks);
                        }
                    }
                }
            });
        });

        // Click on track item to play (for playlist-detail)
        if (source === 'playlist-detail') {
            div.addEventListener('click', (e) => {
                // Don't trigger if clicking on a button
                if (e.target.closest('button')) {
                    return;
                }
                const trackId = parseInt(div.dataset.trackId);
                const trackIndex = this.playlist.findIndex(t => t.id === trackId);
                if (trackIndex !== -1) {
                    this.currentIndex = trackIndex;
                    this.loadAndPlay(this.playlist[trackIndex]);
                    this.updatePlaylistDisplay();
                    // Update active state in detail view
                    if (this.playlistTracksContainer) {
                        this.displayPlaylistTracks(this.playlist);
                    }
                }
            });
        }

        return div;
    }

    showAddToPlaylistDialog(trackId) {
        const track = this.searchResults.find(t => t.id === trackId);
        if (!track) return;
        
        // Ensure customPlaylists is an object
        if (!this.customPlaylists || typeof this.customPlaylists !== 'object') {
            this.customPlaylists = {};
        }
        
        // Filter out favorite playlist and get other playlists
        const playlists = Object.entries(this.customPlaylists).filter(([id]) => id !== this.FAVORITE_PLAYLIST_ID);
        
        const dialog = document.createElement('div');
        dialog.className = 'playlist-selector-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>اضافه کردن به پلی‌لیست</h3>
                <p>${this.escapeHtml(track.title)} - ${this.escapeHtml(track.artist)}</p>
                <div class="playlist-selector-list">
                    ${playlists.map(([id, playlist]) => `
                        <div class="playlist-selector-item">
                            <span>${this.escapeHtml(playlist.name)} (${playlist.tracks.length} موزیک)</span>
                            <button class="btn btn-small btn-select-playlist" data-playlist-id="${id}" data-track-id="${trackId}">انتخاب</button>
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
        
        // Close button
        dialog.querySelector('.btn-close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Create new playlist
        dialog.querySelector('.btn-create-new-from-dialog').addEventListener('click', () => {
            const newPlaylistId = this.createNewPlaylist(track);
            if (newPlaylistId) {
                document.body.removeChild(dialog);
                this.showError('پلی‌لیست جدید ساخته شد و موزیک اضافه شد');
            }
        });
        
        // Select playlist buttons
        dialog.querySelectorAll('.btn-select-playlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const playlistId = btn.dataset.playlistId;
                this.addTrackToCustomPlaylist(playlistId, track);
                document.body.removeChild(dialog);
                this.showError('موزیک به پلی‌لیست اضافه شد');
            });
        });
    }
    
    // Normalize URL for comparison
    normalizeUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            return urlObj.origin + urlObj.pathname;
        } catch (e) {
            return url.split('?')[0].split('#')[0];
        }
    }
    
    // Check if track is in favorites by track object (more reliable)
    isTrackInFavoritesByUrl(track) {
        if (!track) return false;
        if (!this.customPlaylists || !this.customPlaylists[this.FAVORITE_PLAYLIST_ID]) {
            return false;
        }
        const favoritePlaylist = this.customPlaylists[this.FAVORITE_PLAYLIST_ID];
        if (!favoritePlaylist.tracks) return false;
        
        const trackUrl = this.normalizeUrl(track.url);
        const trackPageUrl = track.pageUrl ? this.normalizeUrl(track.pageUrl) : null;
        
        // Check if track exists by URL
        return favoritePlaylist.tracks.some(t => {
            const existingUrl = this.normalizeUrl(t.url);
            const existingPageUrl = t.pageUrl ? this.normalizeUrl(t.pageUrl) : null;
            
            return existingUrl === trackUrl || 
                   (trackPageUrl && existingPageUrl === trackPageUrl) ||
                   (trackPageUrl && existingUrl === trackPageUrl) ||
                   (existingPageUrl && trackUrl === existingPageUrl);
        });
    }
    
    // Legacy method for backward compatibility
    isTrackInFavorites(trackId) {
        // Try to find track in search results
        const track = this.searchResults.find(t => t.id === trackId);
        if (track) {
            return this.isTrackInFavoritesByUrl(track);
        }
        return false;
    }
    
    toggleFavorite(trackId) {
        if (!trackId || isNaN(trackId)) {
            console.warn('Invalid trackId in toggleFavorite:', trackId);
            return;
        }
        
        // Try to find track in different sources
        let track = this.searchResults.find(t => t.id === trackId);
        if (!track) {
            track = this.playlist.find(t => t.id === trackId);
        }
        if (!track) {
            track = this.recentTracks.find(t => t.id === trackId);
        }
        if (!track) {
            // Try to find in custom playlists
            for (const playlist of Object.values(this.customPlaylists)) {
                track = playlist.tracks.find(t => t.id === trackId);
                if (track) break;
            }
        }
        
        if (!track) {
            console.warn('Track not found for id:', trackId);
            return;
        }
        
        // Ensure favorite playlist exists
        if (!this.customPlaylists[this.FAVORITE_PLAYLIST_ID]) {
            this.customPlaylists[this.FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true
            };
        }
        
        const favoritePlaylist = this.customPlaylists[this.FAVORITE_PLAYLIST_ID];
        
        // Normalize URL for comparison
        const normalizeUrl = (url) => {
            if (!url) return '';
            try {
                const urlObj = new URL(url);
                return urlObj.origin + urlObj.pathname;
            } catch (e) {
                return url.split('?')[0].split('#')[0];
            }
        };
        
        const trackUrl = normalizeUrl(track.url);
        const trackPageUrl = track.pageUrl ? normalizeUrl(track.pageUrl) : null;
        
        // Check if track already exists by URL
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
            this.saveCustomPlaylists();
            this.showToast('آهنگ از علاقه‌مندی‌ها حذف شد', 'success');
        } else {
            // Add to favorites
            favoritePlaylist.tracks.push({...track});
            this.saveCustomPlaylists();
            this.showToast('آهنگ به علاقه‌مندی‌ها اضافه شد', 'success');
        }
        
        // Update player section favorite button if current track
        if (this.currentTrack && this.isSameTrack(this.currentTrack, track)) {
            this.updatePlayerFavoriteButton();
        }
    }
    
    // Helper function to check if two tracks are the same
    isSameTrack(track1, track2) {
        if (!track1 || !track2) return false;
        const normalizeUrl = (url) => {
            if (!url) return '';
            try {
                const urlObj = new URL(url);
                return urlObj.origin + urlObj.pathname;
            } catch (e) {
                return url.split('?')[0].split('#')[0];
            }
        };
        const url1 = normalizeUrl(track1.url);
        const url2 = normalizeUrl(track2.url);
        const pageUrl1 = track1.pageUrl ? normalizeUrl(track1.pageUrl) : null;
        const pageUrl2 = track2.pageUrl ? normalizeUrl(track2.pageUrl) : null;
        return url1 === url2 || (pageUrl1 && pageUrl2 && pageUrl1 === pageUrl2);
    }
    
    // Update player section favorite button state
    updatePlayerFavoriteButton() {
        if (!this.playerFavoriteBtn || !this.currentTrack) return;
        
        const isFavorite = this.isTrackInFavoritesByUrl(this.currentTrack);
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
    
    // Handle favorite button click in player section
    handlePlayerFavorite() {
        if (!this.currentTrack) {
            this.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        
        // Try to find track ID from different sources
        let trackId = this.currentTrack.id;
        
        // If no ID, try to find track by URL in different sources
        if (!trackId) {
            const foundTrack = this.searchResults.find(t => this.isSameTrack(t, this.currentTrack)) ||
                             this.playlist.find(t => this.isSameTrack(t, this.currentTrack)) ||
                             this.recentTracks.find(t => this.isSameTrack(t, this.currentTrack));
            if (foundTrack) {
                trackId = foundTrack.id;
            }
        }
        
        if (trackId) {
            this.toggleFavorite(trackId);
        } else {
            // If no track ID, toggle favorite directly using track object
            this.toggleFavoriteByTrack(this.currentTrack);
        }
    }
    
    // Toggle favorite by track object (when track ID is not available)
    toggleFavoriteByTrack(track) {
        if (!track) return;
        
        // Ensure favorite playlist exists
        if (!this.customPlaylists[this.FAVORITE_PLAYLIST_ID]) {
            this.customPlaylists[this.FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true
            };
        }
        
        const favoritePlaylist = this.customPlaylists[this.FAVORITE_PLAYLIST_ID];
        
        const normalizeUrl = (url) => {
            if (!url) return '';
            try {
                const urlObj = new URL(url);
                return urlObj.origin + urlObj.pathname;
            } catch (e) {
                return url.split('?')[0].split('#')[0];
            }
        };
        
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
            favoritePlaylist.tracks.splice(existingIndex, 1);
            this.saveCustomPlaylists();
            this.showToast('آهنگ از علاقه‌مندی‌ها حذف شد', 'success');
        } else {
            favoritePlaylist.tracks.push({...track});
            this.saveCustomPlaylists();
            this.showToast('آهنگ به علاقه‌مندی‌ها اضافه شد', 'success');
        }
        
        this.updatePlayerFavoriteButton();
    }
    
    // Handle add to playlist button click in player section
    handlePlayerAddToPlaylist() {
        if (!this.currentTrack) {
            this.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        
        // Find track ID from different sources
        let trackId = this.currentTrack.id;
        if (!trackId) {
            const foundTrack = this.searchResults.find(t => this.isSameTrack(t, this.currentTrack)) ||
                             this.playlist.find(t => this.isSameTrack(t, this.currentTrack)) ||
                             this.recentTracks.find(t => this.isSameTrack(t, this.currentTrack));
            if (foundTrack) {
                trackId = foundTrack.id;
            }
        }
        
        if (trackId) {
            this.showAddToPlaylistDialog(trackId);
        } else {
            // If no track ID, show dialog using track object directly
            this.showAddToPlaylistDialogByTrack(this.currentTrack);
        }
    }
    
    // Handle lyrics button click in player section
    handlePlayerLyrics() {
        if (!this.currentTrack) {
            this.showToast('هیچ آهنگی در حال پخش نیست', 'error');
            return;
        }
        
        // Navigate to lyrics page
        this.navigateToPage('lyrics');
        this.loadLyricsPage();
    }
    
    // Reset lyrics section for new track
    resetLyricsForNewTrack() {
        if (this.lyricsContent) {
            this.lyricsContent.dataset.loaded = 'false';
            this.lyricsContent.dataset.trackUrl = '';
            // If lyrics section is visible, reload lyrics for new track
            if (this.lyricsSection && this.lyricsSection.style.display !== 'none') {
                this.showLyrics();
            }
        }
    }
    
    // Show lyrics section and load lyrics
    async showLyrics(forceReload = false) {
        if (!this.lyricsSection || !this.lyricsContent || !this.currentTrack) return;
        
        // Show lyrics section
        this.lyricsSection.style.display = 'block';
        
        // Hide retry button initially
        if (this.lyricsFooter) {
            this.lyricsFooter.style.display = 'none';
        }
        
        // Get cache key from track URL
        const cacheKey = this.getLyricsCacheKey(this.currentTrack);
        
        // Check cache first (unless force reload)
        if (!forceReload && cacheKey && this.lyricsCache[cacheKey] !== undefined) {
            const cachedLyrics = this.lyricsCache[cacheKey];
            // Ensure cachedLyrics is a non-empty string before using it
            if (typeof cachedLyrics === 'string' && cachedLyrics.trim()) {
                // Use cached lyrics
                this.lyricsContent.innerHTML = `<div class="lyrics-text">${this.formatLyrics(cachedLyrics)}</div>`;
                this.lyricsContent.dataset.loaded = 'true';
                this.lyricsContent.dataset.trackUrl = this.currentTrack.url;
                return;
            } else {
                // Cached as "no lyrics found" - show with retry button
                this.lyricsContent.innerHTML = `
                    <div class="lyrics-empty">
                        <p>متن آهنگ یافت نشد</p>
                    </div>
                `;
                this.lyricsContent.dataset.loaded = 'true';
                this.lyricsContent.dataset.trackUrl = this.currentTrack.url;
                // Show retry button
                if (this.lyricsFooter) {
                    this.lyricsFooter.style.display = 'flex';
                }
                return;
            }
        }
        
        // Check if lyrics already loaded for this track (in current session) - unless force reload
        if (!forceReload && this.lyricsContent.dataset.loaded === 'true' && this.lyricsContent.dataset.trackUrl === this.currentTrack.url) {
            return; // Already loaded for this track
        }
        
        // Show loading state
        this.lyricsContent.innerHTML = `
            <div class="lyrics-loading">
                <div class="spinner spinner-small"></div>
                <p>در حال بارگذاری متن آهنگ...</p>
            </div>
        `;
        
        // Extract lyrics from page
        let lyrics = null;
        let errorOccurred = false;
        
        try {
            lyrics = await this.extractLyrics(this.currentTrack);
        } catch (error) {
            console.error('Error loading lyrics:', error);
            errorOccurred = true;
        }
        
        if (lyrics && lyrics.trim()) {
            // Cache the lyrics
            if (cacheKey) {
                this.lyricsCache[cacheKey] = lyrics;
                this.saveLyricsCache();
            }
            
            // Display lyrics
            this.lyricsContent.innerHTML = `<div class="lyrics-text">${this.formatLyrics(lyrics)}</div>`;
            this.lyricsContent.dataset.loaded = 'true';
            this.lyricsContent.dataset.trackUrl = this.currentTrack.url;
        } else {
            // No lyrics found or error occurred
            if (errorOccurred) {
                // Error state - show retry button
                this.lyricsContent.innerHTML = `
                    <div class="lyrics-error">
                        <p>خطا در بارگذاری متن آهنگ</p>
                        <p class="lyrics-error-detail">لطفا دوباره تلاش کنید</p>
                    </div>
                `;
                // Show retry button
                if (this.lyricsFooter) {
                    this.lyricsFooter.style.display = 'flex';
                }
            } else {
                // No lyrics found - cache empty string to avoid retrying (but allow manual retry)
                if (cacheKey && !forceReload) {
                    this.lyricsCache[cacheKey] = '';
                    this.saveLyricsCache();
                }
                
                // Show empty state with retry button
                this.lyricsContent.innerHTML = `
                    <div class="lyrics-empty">
                        <p>متن آهنگ یافت نشد</p>
                    </div>
                `;
                // Show retry button
                if (this.lyricsFooter) {
                    this.lyricsFooter.style.display = 'flex';
                }
            }
            this.lyricsContent.dataset.loaded = 'true';
            this.lyricsContent.dataset.trackUrl = this.currentTrack.url;
        }
    }
    
    // Retry loading lyrics
    retryLoadLyrics() {
        if (!this.currentTrack) return;
        
        // Clear cache for this track to force reload
        const cacheKey = this.getLyricsCacheKey(this.currentTrack);
        if (cacheKey && this.lyricsCache[cacheKey]) {
            delete this.lyricsCache[cacheKey];
            this.saveLyricsCache();
        }
        
        // Reset loaded state
        if (this.lyricsContent) {
            this.lyricsContent.dataset.loaded = 'false';
            this.lyricsContent.dataset.trackUrl = '';
        }
        
        // Reload lyrics
        this.showLyrics(true);
    }
    
    // Load lyrics page content
    async loadLyricsPage(forceReload = false) {
        if (!this.currentTrack) return;
        
        // Update track info
        if (this.lyricsPageTrackTitle) {
            this.lyricsPageTrackTitle.textContent = this.currentTrack.title || '-';
        }
        if (this.lyricsPageTrackArtist) {
            this.lyricsPageTrackArtist.textContent = this.currentTrack.artist || '-';
        }
        
        // Get cache key
        const cacheKey = this.getLyricsCacheKey(this.currentTrack);
        
        // Check cache first (unless force reload)
        if (!forceReload && cacheKey && this.lyricsCache[cacheKey] !== undefined) {
            const cachedLyrics = this.lyricsCache[cacheKey];
            if (typeof cachedLyrics === 'string' && cachedLyrics.trim() && cachedLyrics.length >= 10) {
                // Use cached lyrics
                this.displayLyricsPageContent(cachedLyrics);
                return;
            } else {
                // Cached as "no lyrics found"
                this.displayLyricsPageError('متن آهنگ یافت نشد');
                return;
            }
        }
        
        // Show loading state
        if (this.lyricsPageContent) {
            this.lyricsPageContent.innerHTML = `
                <div class="lyrics-loading">
                    <div class="spinner spinner-small"></div>
                    <p>در حال بارگذاری متن آهنگ...</p>
                </div>
            `;
        }
        
        // Extract lyrics from page
        let lyrics = null;
        let errorOccurred = false;
        
        try {
            lyrics = await this.extractLyrics(this.currentTrack);
        } catch (error) {
            console.error('Error loading lyrics:', error);
            errorOccurred = true;
        }
        
        if (lyrics && lyrics.trim() && lyrics.length >= 10) {
            // Cache the lyrics
            if (cacheKey) {
                this.lyricsCache[cacheKey] = lyrics;
                this.saveLyricsCache();
            }
            
            // Display lyrics
            this.displayLyricsPageContent(lyrics);
        } else {
            // No lyrics found or error occurred
            if (errorOccurred) {
                this.displayLyricsPageError('خطا در بارگذاری متن آهنگ');
            } else {
                // Cache empty string to avoid retrying
                if (cacheKey && !forceReload) {
                    this.lyricsCache[cacheKey] = '';
                    this.saveLyricsCache();
                }
                this.displayLyricsPageError('متن آهنگ یافت نشد');
            }
        }
    }
    
    // Display lyrics content on lyrics page
    displayLyricsPageContent(lyrics) {
        if (!this.lyricsPageContent) return;
        this.lyricsPageContent.innerHTML = `<div class="lyrics-text-page">${this.formatLyricsForPage(lyrics)}</div>`;
    }
    
    // Display error on lyrics page
    displayLyricsPageError(message) {
        if (!this.lyricsPageContent) return;
        this.lyricsPageContent.innerHTML = `
            <div class="lyrics-empty">
                <p>${message}</p>
            </div>
        `;
    }
    
    // Format lyrics for display on lyrics page
    formatLyricsForPage(lyrics) {
        // Escape HTML
        lyrics = this.escapeHtml(lyrics);
        // Replace line breaks with <br>
        lyrics = lyrics.replace(/\n/g, '<br>');
        return lyrics;
    }
    
    // Handle refresh lyrics button
    handleRefreshLyrics() {
        if (!this.currentTrack) return;
        
        // Clear cache for this track
        const cacheKey = this.getLyricsCacheKey(this.currentTrack);
        if (cacheKey && this.lyricsCache[cacheKey]) {
            delete this.lyricsCache[cacheKey];
            this.saveLyricsCache();
        }
        
        // Reload lyrics
        this.loadLyricsPage(true);
    }
    
    // Get cache key for lyrics
    getLyricsCacheKey(track) {
        if (!track) return null;
        // Use pageUrl if available, otherwise use url
        const url = track.pageUrl || track.url;
        if (!url) return null;
        // Normalize URL for cache key
        try {
            const urlObj = new URL(url);
            return urlObj.origin + urlObj.pathname;
        } catch (e) {
            return url.split('?')[0].split('#')[0];
        }
    }
    
    // Save lyrics cache to localStorage
    saveLyricsCache() {
        try {
            localStorage.setItem('mytehranLyricsCache', JSON.stringify(this.lyricsCache));
        } catch (e) {
            console.warn('Could not save lyrics cache:', e);
        }
    }
    
    // Load lyrics cache from localStorage
    loadLyricsCache() {
        try {
            const cached = localStorage.getItem('mytehranLyricsCache');
            if (cached) {
                this.lyricsCache = JSON.parse(cached);
            }
        } catch (e) {
            console.warn('Could not load lyrics cache:', e);
            this.lyricsCache = {};
        }
    }
    
    // Hide lyrics section
    hideLyrics() {
        if (this.lyricsSection) {
            this.lyricsSection.style.display = 'none';
        }
    }
    
    // Extract lyrics from mytehranmusic.com page using contentp div
    async extractLyrics(track) {
        if (!track) return null;
        
        // Try pageUrl first, then url
        const pageUrl = track.pageUrl || track.url;
        if (!pageUrl) return null;
        
        try {
            // Use CORS proxy to fetch page
            let proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`;
            let response = await fetch(proxyUrl);
            
            if (!response.ok) {
                // Try alternative proxy
                proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pageUrl)}`;
                response = await fetch(proxyUrl);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let html;
            if (response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                html = data.contents;
            } else {
                html = await response.text();
            }
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Find contentp div
            const contentp = doc.querySelector('.contentp');
            if (!contentp) {
                return null;
            }
            
            // Pattern 1: Check if there's exactly one div inside contentp with br tags
            const innerDivs = contentp.querySelectorAll(':scope > div');
            if (innerDivs.length === 1) {
                const firstDiv = innerDivs[0];
                const hasBrTags = contentp.querySelectorAll('br').length > 0;
                
                if (hasBrTags) {
                    // Extract text after the first div
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
                                // Extract text from element
                                lyricsText += node.textContent;
                            }
                        }
                    }
                    
                    lyricsText = this.cleanLyricsText(lyricsText);
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
                        // Only process if it's a br or text content
                        if (node.nodeName === 'BR') {
                            lyricsText += '\n';
                        } else {
                            lyricsText += node.textContent;
                        }
                    }
                }
                
                lyricsText = this.cleanLyricsText(lyricsText);
                if (lyricsText.length >= 10) {
                    return lyricsText;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting lyrics:', error);
            throw error; // Re-throw to be caught by showLyrics
        }
    }
    
    // Clean lyrics text: normalize br tags, remove leading/trailing brs
    cleanLyricsText(text) {
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
    
    // Format lyrics text for display
    formatLyrics(lyrics) {
        // Escape HTML
        lyrics = this.escapeHtml(lyrics);
        // Replace line breaks with <br>
        lyrics = lyrics.replace(/\n\n+/g, '</p><p>');
        lyrics = lyrics.replace(/\n/g, '<br>');
        // Wrap in paragraphs
        return `<p>${lyrics}</p>`;
    }
    
    // Show add to playlist dialog by track object
    showAddToPlaylistDialogByTrack(track) {
        if (!track) return;
        
        // Ensure customPlaylists is an object
        if (!this.customPlaylists || typeof this.customPlaylists !== 'object') {
            this.customPlaylists = {};
        }
        
        // Filter out favorite playlist and get other playlists
        const playlists = Object.entries(this.customPlaylists).filter(([id]) => id !== this.FAVORITE_PLAYLIST_ID);
        
        const dialog = document.createElement('div');
        dialog.className = 'playlist-selector-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>اضافه کردن به پلی‌لیست</h3>
                <p>${this.escapeHtml(track.title)} - ${this.escapeHtml(track.artist)}</p>
                <div class="playlist-selector-list">
                    ${playlists.map(([id, playlist]) => `
                        <div class="playlist-selector-item">
                            <span>${this.escapeHtml(playlist.name)} (${playlist.tracks.length} موزیک)</span>
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
        
        // Close button
        dialog.querySelector('.btn-close-dialog').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // Create new playlist
        dialog.querySelector('.btn-create-new-from-dialog').addEventListener('click', () => {
            const newPlaylistId = this.createNewPlaylist(track);
            if (newPlaylistId) {
                document.body.removeChild(dialog);
                this.showToast('پلی‌لیست جدید ساخته شد و موزیک اضافه شد', 'success');
            }
        });
        
        // Select playlist buttons
        dialog.querySelectorAll('.btn-select-playlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const playlistId = btn.dataset.playlistId;
                this.addTrackToCustomPlaylist(playlistId, track);
                document.body.removeChild(dialog);
                this.showToast('موزیک به پلی‌لیست اضافه شد', 'success');
            });
        });
    }


    removeFromPlaylist(trackId) {
        if (this.currentPlaylistId) {
            // Remove from custom playlist
            const playlist = this.customPlaylists[this.currentPlaylistId];
            if (playlist) {
                const trackIndex = playlist.tracks.findIndex(t => t.id === trackId);
                if (trackIndex !== -1) {
                    this.removeTrackFromPlaylist(this.currentPlaylistId, trackIndex);
                }
            }
        } else {
            // Remove from search results playlist
            this.playlist = this.playlist.filter(t => t.id !== trackId);
            
            if (this.currentIndex >= this.playlist.length) {
                this.currentIndex = -1;
                this.audioPlayer.pause();
                // Hide bottom player bar if no track is playing
                if (this.bottomPlayerBar) {
                    this.bottomPlayerBar.style.display = 'none';
                }
            }
            
            this.updatePlaylistDisplay();
            this.savePlaylist();
        }
    }

    playTrack(trackId, source = 'playlist') {
        let track;
        
        if (source === 'results') {
            // For search results, set current playlist to search results
            this.currentPlaylistId = null;
            // Add all search results to playlist if not already there
            this.searchResults.forEach(result => {
                if (!this.playlist.find(t => t.id === result.id)) {
                    this.playlist.push({...result});
                }
            });
            track = this.searchResults.find(t => t.id === trackId);
        } else if (source === 'home') {
            // Playing from home page (recent tracks)
            // Try to find track in recent tracks or playlist
            track = this.recentTracks.find(t => t.id === trackId) || 
                    this.playlist.find(t => t.id === trackId);
            
            // If track found in recent tracks but not in playlist, add it
            if (track && !this.playlist.find(t => t.id === trackId)) {
                this.playlist.push({...track});
            }
        } else if (source === 'explore') {
            // Playing from explore page - find track in DOM
            const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
            if (trackElement) {
                // Try to find track in explore detail container or explore lists
                const exploreDetailContainer = document.getElementById('exploreDetailContainer');
                const latestTracksList = document.getElementById('latestTracksList');
                const topMonthlyList = document.getElementById('topMonthlyList');
                const podcastsList = document.getElementById('podcastsList');
                
                // Search in all explore containers
                let foundTrack = null;
                const allContainers = [exploreDetailContainer, latestTracksList, topMonthlyList, podcastsList].filter(Boolean);
                
                for (const container of allContainers) {
                    const item = container.querySelector(`[data-track-id="${trackId}"]`);
                    if (item) {
                        // Extract track data from the DOM element
                        const titleEl = item.querySelector('.track-info h4');
                        const artistEl = item.querySelector('.track-info p');
                        const imageEl = item.querySelector('.track-image img');
                        
                        if (titleEl && artistEl) {
                            foundTrack = {
                                id: trackId,
                                title: titleEl.textContent,
                                artist: artistEl.textContent,
                                image: imageEl ? imageEl.src : '',
                                url: item.dataset.trackUrl || '',
                                pageUrl: item.dataset.pageUrl || ''
                            };
                            break;
                        }
                    }
                }
                
                if (foundTrack) {
                    track = foundTrack;
                    // Add to playlist if not already there
                    if (!this.playlist.find(t => t.id === trackId)) {
                        this.playlist.push({...track});
                    }
                }
            }
        } else {
            // Playing from current playlist
            track = this.playlist.find(t => t.id === trackId);
        }
        
        if (!track) {
            console.warn('Track not found:', trackId, 'source:', source);
            return;
        }

        this.currentIndex = this.playlist.findIndex(t => t.id === trackId);
        this.loadAndPlay(track);
        this.updatePlaylistDisplay();
        this.savePlaylist();
    }

    loadAndPlay(track) {
        // Store current track (make a copy to avoid reference issues)
        this.currentTrack = {...track};
        this.currentTrackEl.textContent = track.title;
        this.currentArtistEl.textContent = track.artist;
        
        // Update player section favorite button state
        this.updatePlayerFavoriteButton();
        
        // Reset lyrics section when track changes
        this.resetLyricsForNewTrack();
        
        // Update lyrics page if it's currently visible
        if (this.pages.lyrics && this.pages.lyrics.style.display !== 'none') {
            this.loadLyricsPage();
        }
        
        // Update bottom player bar
        if (this.playerBarTitle) this.playerBarTitle.textContent = track.title;
        if (this.playerBarArtist) this.playerBarArtist.textContent = track.artist;
        if (this.playerBarImage) {
            this.playerBarImage.src = track.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b3b3b3"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
        }
        if (this.bottomPlayerBar) {
            this.bottomPlayerBar.style.display = 'flex';
        }
        
        // Reset progress bar
        if (this.playerBarProgressFill) {
            this.playerBarProgressFill.style.width = '0%';
        }
        if (this.playerBarProgressHandle) {
            this.playerBarProgressHandle.style.left = '0%';
        }
        
        // Update current track image
        const currentImageEl = document.getElementById('currentTrackImage');
        if (currentImageEl) {
            currentImageEl.src = track.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b3b3b3"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
        }
        
        // Check if URL is a direct audio file (from data-music attribute)
        const audioUrl = track.url;
        const isDirectAudio = audioUrl && (
            audioUrl.endsWith('.mp3') || 
            audioUrl.endsWith('.m4a') || 
            audioUrl.endsWith('.ogg') || 
            audioUrl.endsWith('.wav') ||
            audioUrl.includes('dl.mytehranmusic.com') ||
            audioUrl.includes('.mp3') ||
            audioUrl.includes('.m4a')
        );
        
        if (isDirectAudio) {
            // Direct audio URL - try to use it directly
            console.log('Using direct audio URL:', audioUrl);
            
            // First, try without CORS (some servers allow it)
            this.audioPlayer.crossOrigin = null;
            this.audioPlayer.src = audioUrl;
            
            // Set up error handler for CORS issues
            let errorHandled = false;
            const handleAudioError = (e) => {
                if (errorHandled) return;
                errorHandled = true;
                
                console.log('Audio error detected, trying CORS proxy...', e);
                
                // Try CORS proxy - use a service that supports audio streaming
                // Note: Most CORS proxies don't work well with audio, so we'll extract from page
                if (track.pageUrl) {
                    console.log('Extracting audio from page URL...');
                    this.extractAudioFromPage(track);
                } else {
                    // Try one more time with CORS enabled
                    this.audioPlayer.crossOrigin = 'anonymous';
                    this.audioPlayer.src = audioUrl;
                    
                    this.audioPlayer.addEventListener('error', () => {
                        console.error('CORS still failing, need to extract from page');
                        this.showError('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.');
                    }, { once: true });
                    
                    this.audioPlayer.play().catch(() => {
                        this.showError('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.');
                    });
                }
            };
            
            // Listen for CORS/network errors
            this.audioPlayer.addEventListener('error', handleAudioError, { once: true });
            
            // Also check for CORS errors in play promise
            this.audioPlayer.play().then(() => {
                // Success - remove error handler and cache
                this.audioPlayer.removeEventListener('error', handleAudioError);
                this.cacheAudio(audioUrl);
                // Show bottom player bar - player section is in playerPage
                if (this.bottomPlayerBar) {
                    this.bottomPlayerBar.style.display = 'block';
                }
                this.updatePlayButton();
                // Add to recent tracks
                this.addToRecentTracks(track);
            }).catch(err => {
                console.error('Play error:', err);
                // Check if it's a CORS error
                if (err.name === 'NotAllowedError' || err.message.includes('CORS') || err.message.includes('cross-origin')) {
                    handleAudioError(err);
                } else {
                    // Other error, try error handler anyway
                    handleAudioError(err);
                }
            });
        } else {
            // Page URL - need to extract audio from the page
            this.extractAudioFromPage(track);
        }
    }

    extractAudioFromPage(track) {
        this.showLoading(true);
        const pageUrl = track.pageUrl || track.url;
        
        if (!pageUrl) {
            this.showLoading(false);
            this.showError('لینک موزیک یافت نشد');
            return;
        }
        
        this.extractAudioUrl(pageUrl).then(url => {
            this.showLoading(false);
            if (url) {
                console.log('Extracted audio URL:', url);
                this.audioPlayer.crossOrigin = 'anonymous';
                this.audioPlayer.src = url;
                this.cacheAudio(url);
                this.audioPlayer.play().then(() => {
                    // Add to recent tracks when play succeeds
                    this.addToRecentTracks(track);
                }).catch(err => {
                    console.error('Play error:', err);
                    this.showError('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.');
                });
                // Show bottom player bar - player section is in playerPage
                if (this.bottomPlayerBar) {
                    this.bottomPlayerBar.style.display = 'block';
                }
                this.updatePlayButton();
            } else {
                this.showError('نمی‌توان موزیک را پخش کرد. لطفا موزیک دیگری انتخاب کنید.');
            }
        }).catch(err => {
            this.showLoading(false);
            console.error('Error extracting audio:', err);
            this.showError('خطا در بارگذاری موزیک. لطفا دوباره تلاش کنید.');
        });
    }

    async extractAudioUrl(pageUrl) {
        try {
            // Try primary CORS proxy
            let proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`;
            let response = await fetch(proxyUrl);
            
            if (!response.ok) {
                // Try alternative proxy
                proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pageUrl)}`;
                response = await fetch(proxyUrl);
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let html;
            if (response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                html = data.contents;
            } else {
                html = await response.text();
            }
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Method 1: Check for data-music attribute (most reliable for this site)
            const playButton = doc.querySelector('div.mcpplay[data-music]');
            if (playButton) {
                const musicUrl = playButton.getAttribute('data-music');
                if (musicUrl) {
                    return musicUrl.startsWith('http') ? musicUrl : `https://mytehranmusic.com${musicUrl}`;
                }
            }
            
            // Method 2: Direct audio source tag
            const audioSource = doc.querySelector('audio source');
            if (audioSource && audioSource.src) {
                const src = audioSource.src;
                return src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
            }
            
            // Method 3: Audio element with src
            const audioElement = doc.querySelector('audio');
            if (audioElement && audioElement.src) {
                const src = audioElement.src;
                return src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
            }
            
            // Method 4: Data attributes (fallback)
            const dataAudio = doc.querySelector('[data-audio], [data-src], [data-mp3]');
            if (dataAudio) {
                const src = dataAudio.getAttribute('data-audio') || 
                           dataAudio.getAttribute('data-src') || 
                           dataAudio.getAttribute('data-mp3');
                if (src) {
                    return src.startsWith('http') ? src : `https://mytehranmusic.com${src}`;
                }
            }
            
            // Method 5: Look for download links with .mp3 or .m4a
            const downloadLinks = doc.querySelectorAll('a[href*=".mp3"], a[href*=".m4a"], a[href*=".ogg"], a[download]');
            for (const link of downloadLinks) {
                const href = link.href || link.getAttribute('href');
                if (href && (href.includes('.mp3') || href.includes('.m4a') || href.includes('.ogg'))) {
                    return href.startsWith('http') ? href : `https://mytehranmusic.com${href}`;
                }
            }
            
            // Method 6: Look in script tags for audio URLs
            const scripts = doc.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.textContent || script.innerHTML;
                // Look for URLs ending with audio extensions or dl.mytehranmusic.com
                const audioUrlMatch = content.match(/https?:\/\/[^\s"']+\.(mp3|m4a|ogg)/i) ||
                                     content.match(/https?:\/\/dl\.mytehranmusic\.com[^\s"']+/i);
                if (audioUrlMatch) {
                    return audioUrlMatch[0];
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting audio URL:', error);
            return null;
        }
    }

    togglePlayPause() {
        if (this.audioPlayer.paused) {
            if (this.currentIndex === -1 && this.playlist.length > 0) {
                this.currentIndex = 0;
                this.loadAndPlay(this.playlist[0]);
            } else {
                this.audioPlayer.play();
            }
        } else {
            this.audioPlayer.pause();
        }
        this.updatePlayButton();
    }

    playNext() {
        if (this.playlist.length === 0) return;

        // If no track is currently playing, start from the first one
        if (this.currentIndex === -1) {
            this.currentIndex = 0;
            this.loadAndPlay(this.playlist[0]);
            return;
        }

        // Store previous index to detect wrap-around
        const previousIndex = this.currentIndex;
        let nextIndex;
        
        if (this.isShuffle) {
            if (this.shuffledIndices.length === 0) {
                this.generateShuffledIndices();
            }
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
            nextIndex = (currentShuffleIndex + 1) % this.shuffledIndices.length;
            this.currentIndex = this.shuffledIndices[nextIndex];
        } else {
            nextIndex = (this.currentIndex + 1) % this.playlist.length;
            this.currentIndex = nextIndex;
        }

        // If we've wrapped around to the first track (from last) and repeat all is off, stop
        if (this.currentIndex === 0 && previousIndex === this.playlist.length - 1 && this.repeatMode !== 2 && !this.isShuffle) {
            this.audioPlayer.pause();
            this.currentIndex = this.playlist.length - 1; // Stay on last track
            return;
        }

        // Continue playing next track
        this.loadAndPlay(this.playlist[this.currentIndex]);
    }

    playPrevious() {
        if (this.playlist.length === 0) return;

        if (this.isShuffle) {
            if (this.shuffledIndices.length === 0) {
                this.generateShuffledIndices();
            }
            const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
            const prevShuffleIndex = currentShuffleIndex === 0 ? 
                this.shuffledIndices.length - 1 : currentShuffleIndex - 1;
            this.currentIndex = this.shuffledIndices[prevShuffleIndex];
        } else {
            this.currentIndex = this.currentIndex === 0 ? 
                this.playlist.length - 1 : this.currentIndex - 1;
        }

        this.loadAndPlay(this.playlist[this.currentIndex]);
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.updateShuffleButton();
        
        if (this.isShuffle) {
            this.generateShuffledIndices();
        }
        
        this.savePlaylist();
    }

    updateShuffleButton() {
        if (this.shuffleBtn) {
            if (this.isShuffle) {
                this.shuffleBtn.classList.add('active');
                this.shuffleBtn.title = 'Shuffle: فعال';
            } else {
                this.shuffleBtn.classList.remove('active');
                this.shuffleBtn.title = 'Shuffle: غیرفعال';
            }
        }
        // Bottom player bar
        if (this.playerBarShuffle) {
            if (this.isShuffle) {
                this.playerBarShuffle.classList.add('active');
                if (this.playerBarShuffleOffIcon) this.playerBarShuffleOffIcon.style.display = 'none';
                if (this.playerBarShuffleOnIcon) this.playerBarShuffleOnIcon.style.display = 'block';
            } else {
                this.playerBarShuffle.classList.remove('active');
                if (this.playerBarShuffleOffIcon) this.playerBarShuffleOffIcon.style.display = 'block';
                if (this.playerBarShuffleOnIcon) this.playerBarShuffleOnIcon.style.display = 'none';
            }
        }
    }

    toggleRepeat() {
        // Cycle through: 0 (no repeat) -> 1 (repeat one) -> 2 (repeat all) -> 0
        this.repeatMode = (this.repeatMode + 1) % 3;
        this.updateRepeatButton();
        this.savePlaylist();
    }

    updateRepeatButton() {
        if (this.repeatBtn) {
            // Remove all repeat classes
            this.repeatBtn.classList.remove('repeat-off', 'repeat-one', 'repeat-all', 'active');
            
            // Hide all icons first
            const repeatOffIcon = document.getElementById('repeatOffIcon');
            const repeatOneIcon = document.getElementById('repeatOneIcon');
            const repeatAllIcon = document.getElementById('repeatAllIcon');
            
            if (repeatOffIcon) repeatOffIcon.style.display = 'none';
            if (repeatOneIcon) repeatOneIcon.style.display = 'none';
            if (repeatAllIcon) repeatAllIcon.style.display = 'none';
            
            switch (this.repeatMode) {
                case 0: // No repeat
                    this.repeatBtn.classList.add('repeat-off');
                    if (repeatOffIcon) repeatOffIcon.style.display = 'block';
                    this.repeatBtn.title = 'Repeat: غیرفعال';
                    break;
                case 1: // Repeat one
                    this.repeatBtn.classList.add('repeat-one', 'active');
                    if (repeatOneIcon) repeatOneIcon.style.display = 'block';
                    this.repeatBtn.title = 'Repeat: تکرار یک موزیک';
                    break;
                case 2: // Repeat all
                    this.repeatBtn.classList.add('repeat-all', 'active');
                    if (repeatAllIcon) repeatAllIcon.style.display = 'block';
                    this.repeatBtn.title = 'Repeat: تکرار کل پلی‌لیست';
                    break;
            }
        }
        // Bottom player bar
        if (this.playerBarRepeat) {
            if (this.playerBarRepeatOffIcon) this.playerBarRepeatOffIcon.style.display = 'none';
            if (this.playerBarRepeatOneIcon) this.playerBarRepeatOneIcon.style.display = 'none';
            if (this.playerBarRepeatAllIcon) this.playerBarRepeatAllIcon.style.display = 'none';
            
            switch (this.repeatMode) {
                case 0:
                    if (this.playerBarRepeatOffIcon) this.playerBarRepeatOffIcon.style.display = 'block';
                    this.playerBarRepeat.classList.remove('active');
                    break;
                case 1:
                    if (this.playerBarRepeatOneIcon) this.playerBarRepeatOneIcon.style.display = 'block';
                    this.playerBarRepeat.classList.add('active');
                    break;
                case 2:
                    if (this.playerBarRepeatAllIcon) this.playerBarRepeatAllIcon.style.display = 'block';
                    this.playerBarRepeat.classList.add('active');
                    break;
            }
        }
    }

    generateShuffledIndices() {
        this.shuffledIndices = Array.from({length: this.playlist.length}, (_, i) => i);
        // Fisher-Yates shuffle
        for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
        }
    }

    updatePlayButton() {
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
        
        if (this.audioPlayer.paused) {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            // Bottom player bar
            if (this.playerBarPlayIcon) this.playerBarPlayIcon.style.display = 'block';
            if (this.playerBarPauseIcon) this.playerBarPauseIcon.style.display = 'none';
        } else {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            // Bottom player bar
            if (this.playerBarPlayIcon) this.playerBarPlayIcon.style.display = 'none';
            if (this.playerBarPauseIcon) this.playerBarPauseIcon.style.display = 'block';
        }
    }

    async cacheAudio(audioUrl) {
        // Cache audio file using Service Worker
        if ('serviceWorker' in navigator && 'caches' in window) {
            try {
                const cache = await caches.open('mytehran-audio-v1');
                // Check if already cached
                const cached = await cache.match(audioUrl);
                if (!cached) {
                    // Fetch and cache the audio
                    await cache.add(audioUrl);
                    console.log('Audio cached:', audioUrl);
                }
            } catch (error) {
                console.warn('Failed to cache audio:', error);
                // Don't show error to user, caching is optional
            }
        }
    }

    updatePlaylistDisplay() {
        // Check if playlistContainer exists (it might not exist in new layout)
        if (!this.playlistContainer) {
            return; // Skip if container doesn't exist
        }
        
        this.playlistContainer.innerHTML = '';
        
        if (this.playlistCount) {
            this.playlistCount.textContent = this.playlist.length;
        }

        if (this.playlist.length === 0) {
            this.playlistContainer.innerHTML = '<p class="empty-state">پلی‌لیست خالی است</p>';
            return;
        }

        this.playlist.forEach((track, index) => {
            const trackElement = this.createTrackElement(track, 'playlist');
            if (index === this.currentIndex) {
                trackElement.classList.add('active');
            }
            this.playlistContainer.appendChild(trackElement);
        });
    }

    clearPlaylist() {
        if (confirm('آیا مطمئن هستید که می‌خواهید پلی‌لیست را پاک کنید؟')) {
            this.playlist = [];
            this.currentIndex = -1;
            this.audioPlayer.pause();
            this.audioPlayer.src = '';
            // Hide bottom player bar if no track is playing
            if (this.bottomPlayerBar) {
                this.bottomPlayerBar.style.display = 'none';
            }
            this.updatePlaylistDisplay();
            this.savePlaylist();
        }
    }

    savePlaylist() {
        // Save current playing state (for search results or selected custom playlist)
        localStorage.setItem('mytehranPlaylist', JSON.stringify(this.playlist));
        localStorage.setItem('mytehranCurrentIndex', this.currentIndex.toString());
        localStorage.setItem('mytehranCurrentPlaylistId', this.currentPlaylistId);
        localStorage.setItem('mytehranRepeatMode', this.repeatMode.toString());
        localStorage.setItem('mytehranShuffle', this.isShuffle.toString());
    }

    saveCustomPlaylists() {
        localStorage.setItem('mytehranCustomPlaylists', JSON.stringify(this.customPlaylists));
        localStorage.setItem('mytehranNextPlaylistId', this.nextPlaylistId.toString());
    }

    loadCustomPlaylists() {
        // Ensure customPlaylists is initialized
        if (!this.customPlaylists || typeof this.customPlaylists !== 'object') {
            this.customPlaylists = {};
        }
        
        const saved = localStorage.getItem('mytehranCustomPlaylists');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    this.customPlaylists = parsed;
                } else {
                    this.customPlaylists = {};
                }
            } catch (e) {
                console.error('Error loading custom playlists:', e);
                this.customPlaylists = {};
            }
        }
        
        // Initialize favorite playlist if it doesn't exist
        if (!this.customPlaylists[this.FAVORITE_PLAYLIST_ID]) {
            this.customPlaylists[this.FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true // Mark as favorite playlist
            };
            this.saveCustomPlaylists();
        }
        
        // Initialize favorite playlist if it doesn't exist
        if (!this.customPlaylists[this.FAVORITE_PLAYLIST_ID]) {
            this.customPlaylists[this.FAVORITE_PLAYLIST_ID] = {
                name: 'علاقه‌مندی‌ها',
                tracks: [],
                downloaded: false,
                isFavorite: true // Mark as favorite playlist
            };
            this.saveCustomPlaylists();
        }
        
        const savedNextId = localStorage.getItem('mytehranNextPlaylistId');
        if (savedNextId) {
            this.nextPlaylistId = parseInt(savedNextId);
        }
        
        // Don't display here - will be displayed when navigating to playlists page
        // This prevents error during initialization when currentPage is not set yet
    }

    createNewPlaylist(trackToAdd = null) {
        const name = prompt('نام پلی‌لیست را وارد کنید:');
        if (!name || !name.trim()) {
            return;
        }
        
        const id = this.nextPlaylistId++;
        this.customPlaylists[id] = {
            name: name.trim(),
            tracks: [],
            downloaded: false
        };
        
        // If track is provided, add it to the new playlist
        if (trackToAdd) {
            this.addTrackToCustomPlaylist(id, trackToAdd);
        }
        
        this.saveCustomPlaylists();
        
        // Only display if we're on playlists page
        if (this.currentPage === 'playlists') {
            this.displayCustomPlaylistsMain();
        }
        
        return id; // Return the new playlist ID
    }

    displayCustomPlaylists() {
        // This function is for old layout, use displayCustomPlaylistsMain instead
        if (this.playlistsListMain) {
            this.displayCustomPlaylistsMain();
            return;
        }
        
        // Fallback for old layout if playlistsList exists
        if (!this.playlistsList) {
            return;
        }
        
        this.playlistsList.innerHTML = '';
        
        // Ensure customPlaylists is an object
        if (!this.customPlaylists || typeof this.customPlaylists !== 'object') {
            this.customPlaylists = {};
        }
        
        const playlists = Object.entries(this.customPlaylists);
        if (playlists.length === 0) {
            this.playlistsList.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی وجود ندارد</p>';
            return;
        }
        
        playlists.forEach(([id, playlist]) => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'custom-playlist-item';
            if (this.currentPlaylistId === id) {
                playlistEl.classList.add('active');
            }
            
            playlistEl.innerHTML = `
                <div class="playlist-info">
                    <h4>${this.escapeHtml(playlist.name)}</h4>
                    <p>${playlist.tracks.length} موزیک</p>
                    ${playlist.downloaded ? '<span class="downloaded-badge">✓ دانلود شده</span>' : ''}
                </div>
                <div class="playlist-actions">
                    <button class="btn btn-small btn-play-playlist" data-playlist-id="${id}" title="پخش">▶</button>
                    <button class="btn btn-small btn-download-playlist" data-playlist-id="${id}" title="دانلود برای آفلاین">⬇</button>
                    <button class="btn btn-small btn-edit-playlist" data-playlist-id="${id}" title="ویرایش">✏</button>
                    <button class="btn btn-small btn-delete-playlist" data-playlist-id="${id}" title="حذف">🗑</button>
                </div>
            `;
            
            // Attach event listeners
            playlistEl.querySelector('.btn-play-playlist').addEventListener('click', () => {
                this.selectCustomPlaylist(id);
            });
            
            playlistEl.querySelector('.btn-download-playlist').addEventListener('click', () => {
                this.downloadPlaylist(id);
            });
            
            playlistEl.querySelector('.btn-edit-playlist').addEventListener('click', () => {
                this.editPlaylist(id);
            });
            
            playlistEl.querySelector('.btn-delete-playlist').addEventListener('click', () => {
                this.deletePlaylist(id);
            });
            
            this.playlistsList.appendChild(playlistEl);
        });
    }

    selectCustomPlaylist(playlistId, autoPlay = false) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) {
            console.error('Playlist not found:', playlistId);
            return;
        }
        
        if (playlist.tracks.length === 0) {
            this.showError('پلی‌لیست خالی است');
            return;
        }
        
        this.currentPlaylistId = playlistId;
        this.playlist = [...playlist.tracks];
        
        // Show playlist detail page
        this.showPlaylistDetail(playlistId, playlist);
        
        // If autoPlay is true, play the first track
        if (autoPlay) {
            this.currentIndex = 0;
            const firstTrack = this.playlist[0];
            if (firstTrack) {
                this.loadAndPlay(firstTrack);
            }
            this.savePlaylist();
        }
        
        // Add to recent playlists
        this.addToRecentPlaylists(playlistId, playlist.name, playlist.tracks);
    }
    
    showPlaylistDetail(playlistId, playlist) {
        // If playlist is not provided, get it from customPlaylists
        if (!playlist && playlistId) {
            playlist = this.customPlaylists[playlistId];
        }
        
        if (!playlist) {
            console.error('Playlist not found:', playlistId);
            return;
        }
        
        // Ensure tracks array exists
        if (!playlist.tracks || !Array.isArray(playlist.tracks)) {
            console.warn('Playlist tracks is not an array:', playlist);
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
        
        // Scroll to top of page when opening playlist detail
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Show playlist detail page
        if (this.playlistDetailPage) {
            this.playlistDetailPage.classList.add('active');
            this.playlistDetailPage.style.display = 'block';
            this.playlistDetailPage.style.visibility = 'visible';
            
            // Set title
            const titleEl = document.getElementById('playlistDetailTitle');
            if (titleEl) {
                titleEl.textContent = playlist.name || 'پلی‌لیست';
            }
            
            // Set current playlist for playback
            this.currentPlaylistId = playlistId;
            this.playlist = playlist.tracks;
            
            // Display tracks
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
        
        console.log('Displaying playlist tracks:', tracks.length, tracks);
        
        tracks.forEach((track, index) => {
            if (!track) {
                console.warn('Invalid track at index', index);
                return;
            }
            
            // Ensure track has required properties
            if (!track.title) {
                console.warn('Track missing title at index', index, track);
                track.title = 'بدون عنوان';
            }
            if (!track.artist) {
                console.warn('Track missing artist at index', index, track);
                track.artist = 'ناشناس';
            }
            if (!track.id) {
                track.id = Date.now() + index;
            }
            
            console.log('Creating track element:', track.title, track.artist, track);
            const trackElement = this.createTrackElement(track, 'playlist-detail', index);
            if (trackElement) {
                this.playlistTracksContainer.appendChild(trackElement);
            } else {
                console.error('Failed to create track element for:', track);
            }
        });
    }

    async downloadPlaylist(playlistId) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist || playlist.tracks.length === 0) {
            this.showError('پلی‌لیست خالی است');
            return;
        }
        
        this.showLoading(true);
        this.showError('در حال دانلود موزیک‌ها...');
        
        try {
            let successCount = 0;
            let failCount = 0;
            
            for (const track of playlist.tracks) {
                const audioUrl = track.url;
                const isDirectAudio = audioUrl.endsWith('.mp3') || 
                                      audioUrl.endsWith('.m4a') || 
                                      audioUrl.endsWith('.ogg') || 
                                      audioUrl.includes('dl.mytehranmusic.com');
                
                if (isDirectAudio) {
                    try {
                        await this.cacheAudio(audioUrl);
                        successCount++;
                    } catch (err) {
                        console.warn('Failed to cache:', audioUrl, err);
                        failCount++;
                    }
                } else {
                    // Try to extract and cache
                    try {
                        const url = await this.extractAudioUrl(audioUrl);
                        if (url) {
                            await this.cacheAudio(url);
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (err) {
                        console.warn('Failed to extract and cache:', audioUrl, err);
                        failCount++;
                    }
                }
            }
            
            playlist.downloaded = true;
            this.saveCustomPlaylists();
            this.displayCustomPlaylistsMain();
            
            this.showLoading(false);
            this.hideError();
            this.showError(`دانلود کامل شد: ${successCount} موفق، ${failCount} ناموفق`);
        } catch (error) {
            console.error('Download error:', error);
            this.showLoading(false);
            this.showError('خطا در دانلود پلی‌لیست');
        }
    }

    editPlaylist(playlistId) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) return;
        
        // Show playlist tracks in a modal or section
        this.showPlaylistEditor(playlistId, playlist);
    }

    showPlaylistEditor(playlistId, playlist) {
        // Create a simple editor interface
        const editor = document.createElement('div');
        editor.className = 'playlist-editor';
        editor.innerHTML = `
            <div class="editor-header">
                <h3>ویرایش: ${this.escapeHtml(playlist.name)}</h3>
                <button class="btn-close-editor">✕</button>
            </div>
            <div class="editor-tracks">
                ${playlist.tracks.map((track, index) => `
                    <div class="editor-track-item">
                        <span>${index + 1}. ${this.escapeHtml(track.title)} - ${this.escapeHtml(track.artist)}</span>
                        <button class="btn btn-small btn-remove-from-playlist" data-playlist-id="${playlistId}" data-track-index="${index}">🗑</button>
                    </div>
                `).join('')}
            </div>
            <div class="editor-actions">
                <button class="btn btn-secondary btn-close-editor">بستن</button>
            </div>
        `;
        
        document.body.appendChild(editor);
        
        // Close button
        editor.querySelectorAll('.btn-close-editor').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(editor);
            });
        });
        
        // Remove track buttons
        editor.querySelectorAll('.btn-remove-from-playlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const trackIndex = parseInt(btn.dataset.trackIndex);
                this.removeTrackFromPlaylist(playlistId, trackIndex);
                document.body.removeChild(editor);
                this.displayCustomPlaylistsMain();
            });
        });
    }

    deletePlaylist(playlistId) {
        // Prevent deletion of favorite playlist
        if (playlistId === this.FAVORITE_PLAYLIST_ID) {
            this.showError('نمی‌توان پلی‌لیست علاقه‌مندی‌ها را حذف کرد');
            return;
        }
        
        if (confirm('آیا مطمئن هستید که می‌خواهید این پلی‌لیست را حذف کنید؟')) {
            delete this.customPlaylists[playlistId];
            if (this.currentPlaylistId === playlistId) {
                this.currentPlaylistId = null;
                this.playlist = [];
                this.currentIndex = -1;
            }
            this.saveCustomPlaylists();
            this.displayCustomPlaylistsMain();
            this.updatePlaylistDisplay();
        }
    }

    addTrackToCustomPlaylist(playlistId, track) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) {
            console.error('Playlist not found:', playlistId);
            return;
        }
        
        // Normalize URL for comparison (remove query params, fragments, etc.)
        const normalizeUrl = (url) => {
            if (!url) return '';
            try {
                const urlObj = new URL(url);
                // Compare based on pathname and hostname, ignore query params
                return urlObj.origin + urlObj.pathname;
            } catch (e) {
                // If URL parsing fails, use as is
                return url.split('?')[0].split('#')[0];
            }
        };
        
        const trackUrl = normalizeUrl(track.url);
        const trackPageUrl = track.pageUrl ? normalizeUrl(track.pageUrl) : null;
        
        // Check if track already exists by URL (more reliable than ID)
        const existingTrack = playlist.tracks.find(t => {
            const existingUrl = normalizeUrl(t.url);
            const existingPageUrl = t.pageUrl ? normalizeUrl(t.pageUrl) : null;
            
            // Check if URLs match (either direct URL or page URL)
            return existingUrl === trackUrl || 
                   (trackPageUrl && existingPageUrl === trackPageUrl) ||
                   (trackPageUrl && existingUrl === trackPageUrl) ||
                   (existingPageUrl && trackUrl === existingPageUrl);
        });
        
        if (existingTrack) {
            this.showError('این موزیک قبلا در پلی‌لیست است');
            return;
        }
        
        playlist.tracks.push({...track});
        playlist.downloaded = false; // Reset download status
        this.saveCustomPlaylists();
        
        // Only display if we're on playlists page
        if (this.currentPage === 'playlists') {
            this.displayCustomPlaylistsMain();
        }
        
        // Also update search results if track is displayed there
        this.updateTrackElementInResults(track.id);
    }
    
    updateTrackElementInResults(trackId) {
        // Update heart icon in search results if track is displayed
        const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackElement) {
            const heartBtn = trackElement.querySelector('.btn-favorite');
            const heartIcon = trackElement.querySelector('.heart-icon');
            if (heartBtn && heartIcon) {
                const isFav = this.isTrackInFavorites(trackId);
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
        }
    }

    removeTrackFromPlaylist(playlistId, trackIndex) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) return;
        
        playlist.tracks.splice(trackIndex, 1);
        playlist.downloaded = false; // Reset download status
        
        if (this.currentPlaylistId === playlistId) {
            this.playlist = [...playlist.tracks];
            if (this.currentIndex >= this.playlist.length) {
                this.currentIndex = -1;
            }
            this.updatePlaylistDisplay();
        }
        
        this.saveCustomPlaylists();
    }

    loadPlaylist() {
        const saved = localStorage.getItem('mytehranPlaylist');
        if (saved) {
            try {
                this.playlist = JSON.parse(saved);
                const savedIndex = localStorage.getItem('mytehranCurrentIndex');
                if (savedIndex) {
                    this.currentIndex = parseInt(savedIndex);
                }
                
                // Load repeat mode
                const savedRepeatMode = localStorage.getItem('mytehranRepeatMode');
                if (savedRepeatMode !== null) {
                    this.repeatMode = parseInt(savedRepeatMode);
                }
                
                // Load shuffle state
                const savedShuffle = localStorage.getItem('mytehranShuffle');
                if (savedShuffle !== null) {
                    this.isShuffle = savedShuffle === 'true';
                }
                
                // Load current playlist ID
                const savedPlaylistId = localStorage.getItem('mytehranCurrentPlaylistId');
                if (savedPlaylistId !== null && savedPlaylistId !== 'null') {
                    this.currentPlaylistId = savedPlaylistId;
                    // If it's a custom playlist, load it
                    if (this.customPlaylists[savedPlaylistId]) {
                        this.playlist = [...this.customPlaylists[savedPlaylistId].tracks];
                    }
                } else {
                    this.currentPlaylistId = null;
                }
                
                // Only update display if container exists
                if (this.playlistContainer) {
                    this.updatePlaylistDisplay();
                }
                this.updateShuffleButton();
                this.updateRepeatButton();
            } catch (e) {
                console.error('Error loading playlist:', e);
            }
        }
    }

    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
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
                <span class="toast-message">${this.escapeHtml(message)}</span>
            </div>
        `;
        
        // Add to container
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
            }, 300); // Wait for animation to complete
        }, 2000);
    }

    setupNavigation() {
        // Try to load saved page from localStorage
        let savedPage = 'home';
        try {
            const saved = localStorage.getItem('mytehranCurrentPage');
            console.log('Saved page from localStorage:', saved);
            if (saved && (saved === 'home' || saved === 'search' || saved === 'playlists')) {
                savedPage = saved;
                console.log('Restoring saved page:', savedPage);
            } else {
                console.log('No valid saved page found, defaulting to home');
            }
        } catch (e) {
            console.warn('Could not load saved page from localStorage:', e);
        }
        
        console.log('Navigating to page:', savedPage);
        console.log('Available pages:', Object.keys(this.pages));
        
        // Navigate to saved page or default to home
        this.navigateToPage(savedPage);
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page, 'from:', this.currentPage);
        console.log('Available pages:', this.pages);
        
        // Prevent navigation to the same page
        if (this.currentPage === page && page !== 'player') {
            console.log('Already on page:', page);
            return;
        }
        
        // Save current page as previous before navigating (except for player page)
        // Only update previousPage if we're not going to player page
        // and current page is not player (to avoid loops)
        if (this.currentPage && this.currentPage !== 'player' && page !== 'player') {
            this.previousPage = this.currentPage;
        }
        
        // Hide all pages first (force hide with !important via inline style)
        Object.values(this.pages).forEach(p => {
            if (p) {
                p.classList.remove('active');
                p.style.display = 'none';
                p.style.visibility = 'hidden';
            }
        });
        
        // Also hide playlistDetailPage if it exists (it's not in this.pages)
        if (this.playlistDetailPage) {
            this.playlistDetailPage.classList.remove('active');
            this.playlistDetailPage.style.display = 'none';
            this.playlistDetailPage.style.visibility = 'hidden';
        }
        
        // Hide exploreDetailPage if navigating away from it
        if (page !== 'exploreDetail' && this.pages.exploreDetail) {
            this.pages.exploreDetail.classList.remove('active');
            this.pages.exploreDetail.style.display = 'none';
            this.pages.exploreDetail.style.visibility = 'hidden';
        }
        
        // Remove active from all nav items
        if (this.navItems && this.navItems.length > 0) {
            this.navItems.forEach(item => item.classList.remove('active'));
        }
        
        // Scroll to top of page when navigating
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Show selected page
        if (this.pages[page]) {
            this.pages[page].classList.add('active');
            this.pages[page].style.display = 'block';
            this.pages[page].style.visibility = 'visible';
            console.log('Page', page, 'displayed successfully');
        } else {
            console.error('Page not found:', page, 'Available:', Object.keys(this.pages));
            // Fallback to home if page not found
            if (this.pages.home) {
                this.pages.home.classList.add('active');
                this.pages.home.style.display = 'block';
                this.pages.home.style.visibility = 'visible';
                page = 'home';
            }
        }
        
        // Activate nav item (only for main pages, not player)
        if (this.navItems && this.navItems.length > 0 && page !== 'player') {
            const navItem = Array.from(this.navItems).find(item => item.dataset.page === page);
            if (navItem) {
                navItem.classList.add('active');
            }
        }
        
        this.currentPage = page;
        
        // Load explore data when navigating to explore page
        if (page === 'explore') {
            this.loadExploreData();
        }
        
        // Save current page to localStorage
        try {
            localStorage.setItem('mytehranCurrentPage', page);
            console.log('Saved current page to localStorage:', page);
        } catch (e) {
            console.warn('Could not save current page to localStorage:', e);
        }
        
        // Update page content
        if (page === 'home') {
            this.updateHomePage();
        } else if (page === 'playlists') {
            this.displayCustomPlaylistsMain();
        } else if (page === 'search') {
            // Ensure search history is displayed
            this.displaySearchHistory();
        } else if (page === 'exploreDetail') {
            // Handle explore detail page
            if (this.currentExploreType) {
                this.loadExploreDetail(this.currentExploreType, 1);
            }
        } else if (page !== 'exploreDetail') {
            // Remove scroll listener when leaving explore detail page
            if (this.exploreDetailScrollHandler) {
                window.removeEventListener('scroll', this.exploreDetailScrollHandler);
                this.exploreDetailScrollHandler = null;
            }
        }
    }
    
    // Load explore page data
    async loadExploreData() {
        await Promise.all([
            this.loadLatestTracks(),
            this.loadTopMonthly(),
            this.loadPodcasts()
        ]);
    }
    
    // Fetch and parse items from a URL with retry logic and multiple proxy fallbacks
    async fetchExploreItems(url, limit = 5, retryCount = 0, maxRetries = 3) {
        // List of CORS proxy services to try
        const proxyServices = [
            {
                name: 'allorigins',
                getUrl: (targetUrl) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
                parseResponse: async (response) => {
                    if (response.headers.get('content-type')?.includes('application/json')) {
                        const data = await response.json();
                        return data.contents;
                    }
                    return await response.text();
                }
            },
            {
                name: 'corsproxy',
                getUrl: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
                parseResponse: async (response) => {
                    if (response.headers.get('content-type')?.includes('application/json')) {
                        const data = await response.json();
                        return data.contents || data;
                    }
                    return await response.text();
                }
            },
            {
                name: 'cors-anywhere',
                getUrl: (targetUrl) => `https://cors-anywhere.herokuapp.com/${targetUrl}`,
                parseResponse: async (response) => await response.text()
            },
            {
                name: 'proxy',
                getUrl: (targetUrl) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
                parseResponse: async (response) => await response.text()
            }
        ];
        
        // Try each proxy service
        for (let proxyIndex = 0; proxyIndex < proxyServices.length; proxyIndex++) {
            const proxy = proxyServices[proxyIndex];
            
            try {
                const proxyUrl = proxy.getUrl(url);
                
                // Create abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    // If this is not the last proxy, try next one
                    if (proxyIndex < proxyServices.length - 1) {
                        continue;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Parse response based on proxy type
                const html = await proxy.parseResponse(response);
                
                if (!html || html.trim().length === 0) {
                    // If this is not the last proxy, try next one
                    if (proxyIndex < proxyServices.length - 1) {
                        continue;
                    }
                    throw new Error('Empty response from proxy');
                }
                
                const result = this.parseExploreItems(html, limit);
                
                // Cache result if limit is 5 (first 5 items)
                if (limit === 5 && result.items.length > 0) {
                    this.cacheExploreItems(url, result.items);
                }
                
                return result;
            } catch (error) {
                // If this is the last proxy and we've tried all retries, throw
                if (proxyIndex === proxyServices.length - 1 && retryCount >= maxRetries) {
                    console.error(`All proxies failed for ${url}. Last error:`, error);
                    return { items: [], hasMore: false };
                }
                
                // If this is not the last proxy, try next one
                if (proxyIndex < proxyServices.length - 1) {
                    continue;
                }
                
                // If all proxies failed in this attempt, retry with next attempt
                if (retryCount < maxRetries) {
                    console.warn(`Proxy ${proxy.name} failed (attempt ${retryCount + 1}/${maxRetries}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                    return this.fetchExploreItems(url, limit, retryCount + 1, maxRetries);
                }
            }
        }
        
        // If we get here, all proxies failed
        console.error(`All proxy services failed for ${url} after ${retryCount + 1} attempts`);
        return { items: [], hasMore: false };
    }
    
    // Parse items from HTML (similar to parseSearchResults)
    parseExploreItems(html, limit = 5) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];
        
        // Try multiple selectors for grid items
        let gridItems = doc.querySelectorAll('div.grid-item');
        
        // Fallback: if no grid-item found, try other common selectors
        if (gridItems.length === 0) {
            gridItems = doc.querySelectorAll('article, .post-item, .item, [class*="grid"], [class*="item"]');
        }
        
        // Additional fallback for top-month page: look for links with images
        // Note: This fallback is handled in the second parsing section below
        // We'll skip creating wrapper divs here as it's complex and error-prone
        
        gridItems.forEach((gridItem, index) => {
            if (index >= limit) return; // Limit to first N items
            
            // Try multiple selectors for play button
            let playButton = gridItem.querySelector('div.mcpplay');
            if (!playButton) {
                playButton = gridItem.querySelector('[data-music], [data-track], .play-button, [class*="play"]');
            }
            
            // If still no play button, try to extract from the item itself
            if (!playButton) {
                // Check if the gridItem itself has data attributes
                if (gridItem.hasAttribute('data-music') || gridItem.hasAttribute('data-track')) {
                    playButton = gridItem;
                }
                // Don't skip - continue to extract info even without play button
            }
            
            // Safely extract attributes from playButton (if it exists)
            const trackTitle = playButton ? (playButton.getAttribute('data-track') || '') : '';
            const artist = playButton ? (playButton.getAttribute('data-artist') || 'ناشناس') : 'ناشناس';
            const imageUrl = playButton ? (playButton.getAttribute('data-image') || '') : '';
            const musicUrl = playButton ? (playButton.getAttribute('data-music') || '') : '';
            
            let title = trackTitle;
            let image = imageUrl;
            let url = musicUrl;
            let pageUrl = '';
            
            // Try multiple selectors for title
            if (!title) {
                let titleEl = gridItem.querySelector('div.title a, h2 a, h3 a, .title a, [class*="title"] a');
                if (!titleEl) titleEl = gridItem.querySelector('div.title, h2, h3, .title, [class*="title"]');
                if (titleEl) title = titleEl.textContent.trim();
            }
            
            // Try multiple selectors for artist
            let finalArtist = artist;
            if (!finalArtist || finalArtist === 'ناشناس') {
                let artistEl = gridItem.querySelector('div.artist a, .artist a, [class*="artist"] a');
                if (!artistEl) artistEl = gridItem.querySelector('div.artist, .artist, [class*="artist"]');
                if (artistEl) finalArtist = artistEl.textContent.trim();
            }
            
            if (!image) {
                let imgEl = gridItem.querySelector('div.img img, img[src*="timthumb"], img[src*="thumb"], .img img, [class*="img"] img, img');
                if (imgEl) image = imgEl.src || imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
            }
            
            // Try multiple selectors for page link
            let pageLink = gridItem.querySelector('div.title a, div.img a, h2 a, h3 a, a[href*="/"]');
            if (!pageLink) {
                // Try to find any link in the item
                pageLink = gridItem.querySelector('a[href]');
            }
            if (pageLink) {
                pageUrl = pageLink.href || pageLink.getAttribute('href') || '';
                if (pageUrl && !pageUrl.startsWith('http')) {
                    pageUrl = `https://mytehranmusic.com${pageUrl}`;
                }
            }
            
            // If still no music URL, use pageUrl as fallback
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
            
            // Accept items even without play button if they have title and URL
            // This is important for top-month page which may not have play buttons
            if (title && url) {
                const trackData = {
                    id: Date.now() + index,
                    title: title.trim(),
                    artist: finalArtist.trim() || 'ناشناس',
                    url: url,
                    image: image || '',
                    pageUrl: pageUrl || url
                };
                results.push(trackData);
            }
        });
        
        // If we still don't have results, try a different approach for top-month page
        // Look for links that contain "دانلود" or "بهترین" and have images
        if (results.length === 0) {
            const allLinks = doc.querySelectorAll('a[href*="/"]');
            const processedUrls = new Set();
            
            allLinks.forEach((link, index) => {
                if (index >= limit) return;
                
                const href = link.getAttribute('href') || '';
                if (!href || processedUrls.has(href)) return;
                
                // Check if link text contains keywords indicating it's a track/playlist
                const linkText = link.textContent.trim();
                // For top-month page, look for links about monthly playlists
                const hasRelevantKeywords = linkText.includes('دانلود') || 
                                           linkText.includes('بهترین') || 
                                           linkText.includes('آهنگ') ||
                                           linkText.includes('پلی لیست') ||
                                           linkText.includes('تاپ') ||
                                           linkText.includes('ماه') ||
                                           (linkText.length > 10 && href.includes('top-month'));
                
                if (!hasRelevantKeywords) return;
                
                // Find image near this link
                let img = link.querySelector('img');
                if (!img) {
                    const parent = link.closest('div, article, section');
                    if (parent) {
                        img = parent.querySelector('img');
                    }
                }
                
                // Extract title from link text or nearby element
                let itemTitle = linkText;
                if (!itemTitle || itemTitle.length < 5) {
                    const parent = link.closest('div, article, section');
                    if (parent) {
                        const titleEl = parent.querySelector('h2, h3, .title, [class*="title"]');
                        if (titleEl) itemTitle = titleEl.textContent.trim();
                    }
                }
                
                // Clean title (remove "دانلود" prefix if present)
                itemTitle = itemTitle.replace(/^دانلود\s*/i, '').trim();
                
                if (itemTitle && href && itemTitle.length > 5) {
                    processedUrls.add(href);
                    
                    let imageUrl = '';
                    if (img) {
                        imageUrl = img.src || img.getAttribute('src') || img.getAttribute('data-src') || '';
                    }
                    
                    // Normalize URLs
                    let finalUrl = href;
                    if (!finalUrl.startsWith('http')) {
                        finalUrl = `https://mytehranmusic.com${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
                    }
                    
                    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                        if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
                        else if (imageUrl.startsWith('/')) imageUrl = 'https://mytehranmusic.com' + imageUrl;
                        else imageUrl = 'https://mytehranmusic.com/' + imageUrl;
                    }
                    
                    results.push({
                        id: Date.now() + index,
                        title: itemTitle,
                        artist: 'پلی لیست',
                        url: finalUrl,
                        image: imageUrl,
                        pageUrl: finalUrl
                    });
                }
            });
        }
        
        // Check for pagination
        const hasMore = this.checkForMorePages(doc);
        
        return { items: results, hasMore };
    }
    
    // Load latest tracks
    async loadLatestTracks() {
        if (!this.latestTracksList) return;
        
        const url = 'https://mytehranmusic.com/';
        
        // Check cache first
        const cached = this.getCachedExploreItems(url);
        if (cached && cached.length > 0) {
            // Show cached items immediately
            this.renderExploreItems(this.latestTracksList, cached, true, 'latest');
            // Show loading indicator while checking for updates
            this.latestTracksList.insertAdjacentHTML('afterbegin', '<div class="explore-loading-inline"><div class="spinner spinner-small"></div></div>');
        } else {
            this.latestTracksList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }
        
        // Fetch fresh data
        const { items, hasMore } = await this.fetchExploreItems(url, 5);
        
        // Remove loading indicator
        const loadingEl = this.latestTracksList.querySelector('.explore-loading-inline');
        if (loadingEl) loadingEl.remove();
        
        // Update only if items changed
        if (this.hasItemsChanged(cached, items)) {
            this.renderExploreItems(this.latestTracksList, items, hasMore, 'latest');
        }
    }
    
    // Load top monthly tracks
    async loadTopMonthly() {
        if (!this.topMonthlyList) return;
        
        const url = 'https://mytehranmusic.com/top-month-tehranmusic/';
        
        // Check cache first
        const cached = this.getCachedExploreItems(url);
        if (cached && cached.length > 0) {
            // Show cached items immediately
            this.renderExploreItems(this.topMonthlyList, cached, true, 'topMonthly');
            // Show loading indicator while checking for updates
            this.topMonthlyList.insertAdjacentHTML('afterbegin', '<div class="explore-loading-inline"><div class="spinner spinner-small"></div></div>');
        } else {
            this.topMonthlyList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }
        
        try {
            // Fetch fresh data
            const { items, hasMore } = await this.fetchExploreItems(url, 5);
            
            // Remove loading indicator
            const loadingEl = this.topMonthlyList.querySelector('.explore-loading-inline');
            if (loadingEl) loadingEl.remove();
            
            // If we got items, update the list
            if (items && items.length > 0) {
                // Update only if items changed
                if (this.hasItemsChanged(cached, items)) {
                    this.renderExploreItems(this.topMonthlyList, items, hasMore, 'topMonthly');
                }
            } else {
                // If no items and we have cache, keep showing cache
                if (!cached || cached.length === 0) {
                    this.topMonthlyList.innerHTML = '<div class="explore-loading"><p>آیتمی یافت نشد</p></div>';
                }
            }
        } catch (error) {
            console.error('Error loading top monthly tracks:', error);
            // Remove loading indicator
            const loadingEl = this.topMonthlyList.querySelector('.explore-loading-inline');
            if (loadingEl) loadingEl.remove();
            
            // If we have cache, keep showing it
            if (!cached || cached.length === 0) {
                this.topMonthlyList.innerHTML = '<div class="explore-loading"><p>خطا در بارگذاری</p></div>';
            }
        }
    }
    
    // Load podcasts
    async loadPodcasts() {
        if (!this.podcastsList) return;
        
        const url = 'https://mytehranmusic.com/podcasts/';
        
        // Check cache first
        const cached = this.getCachedExploreItems(url);
        if (cached && cached.length > 0) {
            // Show cached items immediately
            this.renderExploreItems(this.podcastsList, cached, true, 'podcasts');
            // Show loading indicator while checking for updates
            this.podcastsList.insertAdjacentHTML('afterbegin', '<div class="explore-loading-inline"><div class="spinner spinner-small"></div></div>');
        } else {
            this.podcastsList.innerHTML = '<div class="explore-loading"><div class="spinner spinner-small"></div></div>';
        }
        
        // Fetch fresh data
        const { items, hasMore } = await this.fetchExploreItems(url, 5);
        
        // Remove loading indicator
        const loadingEl = this.podcastsList.querySelector('.explore-loading-inline');
        if (loadingEl) loadingEl.remove();
        
        // Update only if items changed
        if (this.hasItemsChanged(cached, items)) {
            this.renderExploreItems(this.podcastsList, items, hasMore, 'podcasts');
        }
    }
    
    // Render explore items horizontally
    renderExploreItems(container, items, hasMore, type) {
        if (!container) return;
        
        container.innerHTML = '';
        
        items.forEach(track => {
            const item = this.createExploreItem(track);
            container.appendChild(item);
        });
        
        // Add "View More" button
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
                this.openExploreDetail(type);
            });
            container.appendChild(viewMoreBtn);
        }
    }
    
    // Create explore item element - use same format as createTrackElement for consistency
    createExploreItem(track) {
        // Use createTrackElement for consistency - it will show play, heart, and plus buttons
        return this.createTrackElement(track, 'explore');
    }
    
    // Open explore detail page
    openExploreDetail(type) {
        this.currentExploreType = type;
        this.currentExplorePage = 1;
        this.navigateToPage('exploreDetail');
    }
    
    // Load explore detail page with infinite scroll
    async loadExploreDetail(type, page = 1, retryCount = 0, maxRetries = 3) {
        if (this.exploreLoading) return;
        
        this.exploreLoading = true;
        
        if (page === 1) {
            // Show loading indicator at the top (like search page)
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'flex';
            }
            // Clear container
            if (this.exploreDetailContainer) {
                this.exploreDetailContainer.innerHTML = '';
            }
        } else {
            if (this.exploreDetailInfiniteLoader) {
                this.exploreDetailInfiniteLoader.style.display = 'flex';
            }
        }
        
        let url = '';
        let title = '';
        
        switch(type) {
            case 'latest':
                url = 'https://mytehranmusic.com/';
                title = 'آهنگ‌های جدید';
                break;
            case 'topMonthly':
                url = 'https://mytehranmusic.com/top-month-tehranmusic/';
                title = 'برترین‌های ماه';
                break;
            case 'podcasts':
                url = 'https://mytehranmusic.com/podcasts/';
                title = 'پادکست‌ها';
                break;
        }
        
        if (this.exploreDetailTitle) {
            this.exploreDetailTitle.textContent = title;
        }
        
        // Handle pagination for different URL patterns
        if (page > 1) {
            if (type === 'latest') {
                url = `https://mytehranmusic.com/page/${page}/`;
            } else if (type === 'topMonthly') {
                url = `https://mytehranmusic.com/top-month-tehranmusic/page/${page}/`;
            } else if (type === 'podcasts') {
                url = `https://mytehranmusic.com/podcasts/page/${page}/`;
            }
        }
        
        try {
            // Fetch items (limit 20 per page for detail view)
            const { items, hasMore } = await this.fetchExploreItems(url, 20, 0, maxRetries);
            this.exploreHasMore = hasMore;
            this.currentExplorePage = page;
            
            // If no items and page > 1, we've reached the end
            if (items.length === 0 && page > 1) {
                this.exploreHasMore = false;
            }
            
            if (page === 1) {
                if (this.exploreDetailContainer) {
                    this.exploreDetailContainer.innerHTML = '';
                }
            }
            
            items.forEach(track => {
                const trackEl = this.createTrackElement(track, 'explore');
                if (this.exploreDetailContainer) {
                    this.exploreDetailContainer.appendChild(trackEl);
                }
            });
            
            // Hide loading indicators
            if (this.exploreDetailInfiniteLoader) {
                this.exploreDetailInfiniteLoader.style.display = 'none';
            }
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'none';
            }
            
            this.exploreLoading = false;
            
            // Setup infinite scroll for explore detail page
            if (this.exploreHasMore && page === 1) {
                this.setupExploreDetailInfiniteScroll();
            }
        } catch (error) {
            console.error(`Error loading explore detail (attempt ${retryCount + 1}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                this.exploreLoading = false;
                return this.loadExploreDetail(type, page, retryCount + 1, maxRetries);
            }
            
            // Hide loading indicator
            if (this.exploreDetailLoadingIndicator) {
                this.exploreDetailLoadingIndicator.style.display = 'none';
            }
            // Show error message if all retries failed
            if (this.exploreDetailContainer) {
                this.exploreDetailContainer.innerHTML = '<div class="explore-loading"><p>خطا در بارگذاری. لطفا دوباره تلاش کنید.</p></div>';
            }
            if (this.exploreDetailInfiniteLoader) {
                this.exploreDetailInfiniteLoader.style.display = 'none';
            }
            this.exploreLoading = false;
        }
    }
    
    // Setup infinite scroll for explore detail page
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
                if (this.currentPage === 'exploreDetail' && scrollTop > 300) {
                    this.exploreDetailScrollToTopBtn.style.display = 'flex';
                } else {
                    this.exploreDetailScrollToTopBtn.style.display = 'none';
                }
            }
            
            // Load more when user is near bottom (200px before end)
            if (!this.exploreLoading && this.exploreHasMore && scrollTop + windowHeight >= documentHeight - 200) {
                this.loadExploreDetail(this.currentExploreType, this.currentExplorePage + 1);
            }
        };
        
        window.addEventListener('scroll', this.exploreDetailScrollHandler);
    }
    
    // Cache explore items
    cacheExploreItems(url, items) {
        if (!items || items.length === 0) return;
        
        const cacheKey = this.getExploreCacheKey(url);
        this.exploreCache[cacheKey] = {
            items: items,
            timestamp: Date.now()
        };
        this.saveExploreCache();
    }
    
    // Get cached explore items
    getCachedExploreItems(url) {
        const cacheKey = this.getExploreCacheKey(url);
        const cached = this.exploreCache[cacheKey];
        
        if (cached && cached.items) {
            // Cache is valid for 1 hour
            const cacheAge = Date.now() - cached.timestamp;
            if (cacheAge < 3600000) { // 1 hour
                return cached.items;
            }
        }
        
        return null;
    }
    
    // Get cache key for explore URL
    getExploreCacheKey(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.origin + urlObj.pathname;
        } catch (e) {
            return url.split('?')[0].split('#')[0];
        }
    }
    
    // Check if items have changed
    hasItemsChanged(oldItems, newItems) {
        if (!oldItems || oldItems.length === 0) return true;
        if (!newItems || newItems.length === 0) return false;
        if (oldItems.length !== newItems.length) return true;
        
        // Compare first item's title and artist
        for (let i = 0; i < Math.min(oldItems.length, newItems.length); i++) {
            if (oldItems[i].title !== newItems[i].title || 
                oldItems[i].artist !== newItems[i].artist) {
                return true;
            }
        }
        
        return false;
    }
    
    // Save explore cache to localStorage
    saveExploreCache() {
        try {
            // Only save items, not timestamps (we'll regenerate them on load)
            const cacheToSave = {};
            Object.keys(this.exploreCache).forEach(key => {
                cacheToSave[key] = {
                    items: this.exploreCache[key].items,
                    timestamp: this.exploreCache[key].timestamp
                };
            });
            localStorage.setItem('mytehranExploreCache', JSON.stringify(cacheToSave));
        } catch (e) {
            console.warn('Could not save explore cache:', e);
        }
    }
    
    // Load explore cache from localStorage
    loadExploreCache() {
        try {
            const cached = localStorage.getItem('mytehranExploreCache');
            if (cached) {
                this.exploreCache = JSON.parse(cached);
            } else {
                this.exploreCache = {};
            }
        } catch (e) {
            console.warn('Could not load explore cache:', e);
            this.exploreCache = {};
        }
    }

    updateHomePage() {
        this.displayRecentTracks();
        this.displayRecentPlaylists();
    }

    displayRecentTracks() {
        if (!this.recentTracksContainer) {
            console.warn('recentTracksContainer not found');
            return;
        }
        
        this.recentTracksContainer.innerHTML = '';
        
        if (!this.recentTracks || this.recentTracks.length === 0) {
            this.recentTracksContainer.innerHTML = '<p class="empty-state">هیچ موزیکی پخش نشده است</p>';
            return;
        }
        
        // Show first 3 tracks (most recent, since we use unshift)
        const tracksToShow = this.recentTracks.slice(0, 3);
        tracksToShow.forEach(track => {
            const trackEl = this.createTrackElement(track, 'home');
            this.recentTracksContainer.appendChild(trackEl);
        });
    }

    displayRecentPlaylists() {
        this.recentPlaylistsContainer.innerHTML = '';
        
        if (this.recentPlaylists.length === 0) {
            this.recentPlaylistsContainer.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی پخش نشده است</p>';
            return;
        }
        
        // Show last 3 playlists
        const playlistsToShow = this.recentPlaylists.slice(-3).reverse();
        playlistsToShow.forEach(({ id, name, tracks }) => {
            // Ensure tracks is a number
            const tracksCount = typeof tracks === 'number' ? tracks : (Array.isArray(tracks) ? tracks.length : 0);
            
            const playlistEl = document.createElement('div');
            playlistEl.className = 'recent-playlist-item';
            playlistEl.innerHTML = `
                <div class="playlist-info">
                    <h4>${this.escapeHtml(name || 'بدون نام')}</h4>
                    <p>${tracksCount} موزیک</p>
                </div>
                <button class="btn btn-small btn-play-playlist" data-playlist-id="${id}">▶ پخش</button>
            `;
            
            playlistEl.querySelector('.btn-play-playlist').addEventListener('click', () => {
                this.selectCustomPlaylist(id);
            });
            
            this.recentPlaylistsContainer.appendChild(playlistEl);
        });
    }

    searchMain() {
        const query = this.searchInput.value.trim();
        if (!query) {
            this.showError('لطفا نام موزیک را وارد کنید');
            return;
        }

        // Add to search history
        this.addToSearchHistory(query);
        
        // Navigate to search page if not already there
        if (this.currentPage !== 'search') {
            this.navigateToPage('search');
        }
        
        // Show search loading indicator at the top
        if (this.searchLoadingIndicator) {
            this.searchLoadingIndicator.style.display = 'flex';
        }
        this.hideError();

        // Reset pagination for new search
        this.currentSearchQuery = query;
        this.currentSearchPage = 1;
        this.hasMoreResults = true;
        this.isLoadingMore = false;

        this.fetchSearchResults(query, 1).then(result => {
            console.log('Search results received:', result);
            console.log('Result type:', typeof result, 'Is array:', Array.isArray(result));
            
            // Handle both old format (array) and new format (object)
            let results = [];
            let hasMore = false;
            
            if (Array.isArray(result)) {
                // Old format - direct array (fallback)
                console.log('Received array format, converting...');
                results = result;
                hasMore = true; // Assume there might be more
            } else if (result && typeof result === 'object' && result.results) {
                // New format - object with results and hasMore
                results = result.results || [];
                hasMore = result.hasMore !== undefined ? result.hasMore : true;
            } else {
                console.error('Unexpected result format:', result);
                results = [];
                hasMore = false;
            }
            
            console.log(`Extracted ${results.length} results, hasMore: ${hasMore}`);
            console.log('First result:', results[0]);
            
            this.searchResults = results;
            this.hasMoreResults = hasMore;
            this.displaySearchResultsMain(this.searchResults, true);
            if (this.searchLoadingIndicator) {
                this.searchLoadingIndicator.style.display = 'none';
            }
        }).catch(error => {
            console.error('Search error:', error);
            this.showError('خطا در جستجو. لطفا دوباره تلاش کنید.');
            if (this.searchLoadingIndicator) {
                this.searchLoadingIndicator.style.display = 'none';
            }
        });
    }

    displaySearchResultsMain(results, clear = false) {
        console.log('displaySearchResultsMain called with:', results, 'clear:', clear);
        
        if (!this.resultsContainerMain) {
            console.error('resultsContainerMain not found');
            return;
        }
        
        if (!this.searchResultsMain) {
            console.error('searchResultsMain not found');
            return;
        }
        
        this.searchResultsMain.style.display = 'block';
        this.searchResultsMain.style.visibility = 'visible';

        if (clear) {
            this.resultsContainerMain.innerHTML = '';
        }

        if (!results || results.length === 0) {
            if (clear) {
                this.resultsContainerMain.innerHTML = '<p class="empty-state">چیزی پیدا نشد</p>';
            }
            return;
        }

        console.log(`Displaying ${results.length} results (clear=${clear})`);
        console.log('Sample result:', results[0]);
        
        results.forEach((track, index) => {
            try {
                if (!track || !track.id) {
                    console.warn('Invalid track at index', index, ':', track);
                    return;
                }
                
                console.log(`Creating track element ${index + 1}/${results.length}:`, track.title);
                
                const trackElement = this.createTrackElement(track, 'results');
                if (trackElement) {
                    this.resultsContainerMain.appendChild(trackElement);
                    console.log(`Track ${index + 1} added successfully`);
                } else {
                    console.warn('Failed to create track element for:', track);
                }
            } catch (error) {
                console.error('Error creating track element:', error, track);
            }
        });
        
        // Force display with multiple methods
        this.searchResultsMain.style.display = 'block';
        this.searchResultsMain.style.visibility = 'visible';
        this.searchResultsMain.style.opacity = '1';
        this.searchResultsMain.removeAttribute('hidden');
        
        // Also set via class if needed
        this.searchResultsMain.classList.remove('hidden');
        this.searchResultsMain.classList.add('visible');
        
        console.log('Results displayed. Container children:', this.resultsContainerMain.children.length);
        console.log('searchResultsMain display:', window.getComputedStyle(this.searchResultsMain).display);
        console.log('searchResultsMain visibility:', window.getComputedStyle(this.searchResultsMain).visibility);
        console.log('resultsContainerMain:', this.resultsContainerMain);
        console.log('resultsContainerMain.innerHTML length:', this.resultsContainerMain.innerHTML.length);
        
        // Scroll to results after a short delay to ensure rendering (only on first load)
        if (clear) {
            setTimeout(() => {
                if (this.resultsContainerMain.children.length > 0) {
                    this.searchResultsMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
        
        // Show/hide infinite scroll loader
        const loader = document.getElementById('infiniteScrollLoader');
        if (loader) {
            // Show loader if there are more results
            if (this.hasMoreResults) {
                loader.style.display = 'flex';
            } else {
                loader.style.display = 'none';
            }
        }
        
        // Re-setup observer after displaying results
        // Always setup observer, not just on clear, to handle append cases
        setTimeout(() => {
            this.setupInfiniteScroll();
        }, clear ? 500 : 100);
    }

    addToSearchHistory(query) {
        // Initialize if not exists or not an array
        if (!Array.isArray(this.searchHistory)) {
            this.searchHistory = [];
        }
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        // Add to beginning
        this.searchHistory.unshift(query);
        // Keep only last 10
        this.searchHistory = this.searchHistory.slice(0, 10);
        this.saveRecentData();
        this.displaySearchHistory();
    }

    // Remove one item from search history by index
    deleteSearchHistoryItem(index) {
        if (!Array.isArray(this.searchHistory)) return;
        if (index < 0 || index >= this.searchHistory.length) return;
        
        this.searchHistory.splice(index, 1);
        this.saveRecentData();
        this.displaySearchHistory();
    }

    displaySearchHistory() {
        if (!this.searchHistoryList) {
            console.warn('searchHistoryList not found');
            return;
        }
        
        if (!this.searchHistory) {
            this.searchHistory = [];
        }
        
        console.log('Displaying search history. searchHistory:', this.searchHistory, 'Length:', this.searchHistory.length);
        console.log('searchHistoryList element:', this.searchHistoryList);
        
        this.searchHistoryList.innerHTML = '';
        
        if (!Array.isArray(this.searchHistory) || this.searchHistory.length === 0) {
            this.searchHistoryList.innerHTML = '<p class="empty-state">هیچ جستجویی انجام نشده است</p>';
            console.log('No search history to display');
            return;
        }
        
        console.log('Rendering', this.searchHistory.length, 'search history items');
        this.searchHistory.forEach((query, index) => {
            console.log(`Rendering history item ${index + 1}:`, query);
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-text">${this.escapeHtml(query)}</div>
                <button class="btn-icon history-delete-btn" data-index="${index}" title="حذف از سابقه">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14H6L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4h6v2"></path>
                    </svg>
                </button>
            `;
            
            // کلیک روی کل سطر → انجام جستجو
            item.addEventListener('click', () => {
                this.searchInput.value = query;
                this.searchMain();
            });
            
            // کلیک روی آیکن سطل → حذف از تاریخچه، بدون اجرای جستجو
            const deleteBtn = item.querySelector('.history-delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(deleteBtn.dataset.index, 10);
                    this.deleteSearchHistoryItem(idx);
                });
            }
            
            this.searchHistoryList.appendChild(item);
        });
    }

    displayCustomPlaylistsMain() {
        if (!this.playlistsListMain) {
            console.error('playlistsListMain not found');
            return;
        }
        
        this.playlistsListMain.innerHTML = '';
        
        // Ensure customPlaylists is an object
        if (!this.customPlaylists || typeof this.customPlaylists !== 'object') {
            this.customPlaylists = {};
        }
        
        const playlists = Object.entries(this.customPlaylists);
        if (playlists.length === 0) {
            this.playlistsListMain.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی وجود ندارد</p>';
            return;
        }
        
        // Sort playlists: favorite first, then others
        const sortedPlaylists = playlists.sort(([id1, p1], [id2, p2]) => {
            if (id1 === this.FAVORITE_PLAYLIST_ID) return -1;
            if (id2 === this.FAVORITE_PLAYLIST_ID) return 1;
            return 0;
        });
        
        sortedPlaylists.forEach(([id, playlist]) => {
            const isFavorite = id === this.FAVORITE_PLAYLIST_ID;
            const playlistEl = document.createElement('div');
            playlistEl.className = 'custom-playlist-item-main';
            if (isFavorite) {
                playlistEl.classList.add('favorite-playlist');
            }
            
            // Check if this playlist is currently selected
            const isSelected = this.currentPlaylistId === id;
            
            playlistEl.innerHTML = `
                <div class="playlist-info-main">
                    <div class="playlist-header-main">
                        <h3>${this.escapeHtml(playlist.name)} ${isFavorite ? '<span class="favorite-icon">❤️</span>' : ''}</h3>
                        ${isSelected ? '<span class="playing-badge">در حال پخش</span>' : ''}
                    </div>
                    <p class="playlist-meta">${playlist.tracks.length} موزیک ${playlist.downloaded ? '• ✓ دانلود شده' : ''}</p>
                </div>
                <div class="playlist-actions-main">
                    <button class="btn btn-small btn-play-playlist-main ${isSelected ? 'active' : ''}" data-playlist-id="${id}" title="پخش">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button class="btn btn-small btn-download-playlist-main" data-playlist-id="${id}" title="دانلود">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                    </button>
                    <button class="btn btn-small btn-edit-playlist-main" data-playlist-id="${id}" title="ویرایش">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    ${!isFavorite ? `
                    <button class="btn btn-small btn-delete-playlist-main" data-playlist-id="${id}" title="حذف">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            `;
            
            // Make the whole playlist item clickable (except buttons)
            playlistEl.style.cursor = 'pointer';
            playlistEl.addEventListener('click', (e) => {
                // Only trigger if click is not on a button
                if (!e.target.closest('button')) {
                    this.selectCustomPlaylist(id);
                }
            });
            
            // Attach event listeners with error handling
            const playBtn = playlistEl.querySelector('.btn-play-playlist-main');
            const downloadBtn = playlistEl.querySelector('.btn-download-playlist-main');
            const editBtn = playlistEl.querySelector('.btn-edit-playlist-main');
            const deleteBtn = playlistEl.querySelector('.btn-delete-playlist-main');
            
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectCustomPlaylist(id);
                });
            }
            
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.downloadPlaylist(id);
                });
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editPlaylist(id);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deletePlaylist(id);
                });
            }
            
            this.playlistsListMain.appendChild(playlistEl);
        });
    }

    loadRecentData() {
        const saved = localStorage.getItem('mytehranRecentData');
        console.log('Loading recent data from localStorage:', saved);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.recentTracks = Array.isArray(data.tracks) ? data.tracks : [];
                this.recentPlaylists = Array.isArray(data.playlists) ? data.playlists : [];
                this.searchHistory = Array.isArray(data.searchHistory) ? data.searchHistory : [];
                console.log('Loaded searchHistory:', this.searchHistory, 'Length:', this.searchHistory.length);
            } catch (e) {
                console.error('Error loading recent data:', e);
                // Initialize as empty arrays on error
                this.recentTracks = [];
                this.recentPlaylists = [];
                this.searchHistory = [];
            }
        } else {
            // Initialize as empty arrays if no saved data
            this.recentTracks = [];
            this.recentPlaylists = [];
            this.searchHistory = [];
            console.log('No saved data, initializing empty arrays');
        }
        
        // Ensure searchHistory is always an array
        if (!Array.isArray(this.searchHistory)) {
            this.searchHistory = [];
        }
        
        console.log('Final searchHistory after load:', this.searchHistory);
        
        console.log('Final searchHistory after load:', this.searchHistory);
    }

    saveRecentData() {
        localStorage.setItem('mytehranRecentData', JSON.stringify({
            tracks: this.recentTracks,
            playlists: this.recentPlaylists,
            searchHistory: this.searchHistory
        }));
    }

    addToRecentTracks(track) {
        // Remove if already exists
        this.recentTracks = this.recentTracks.filter(t => t.id !== track.id);
        // Add to beginning
        this.recentTracks.unshift({...track});
        // Keep only last 50
        this.recentTracks = this.recentTracks.slice(0, 50);
        this.saveRecentData();
        
        if (this.currentPage === 'home') {
            this.displayRecentTracks();
        }
    }

    addToRecentPlaylists(playlistId, playlistName, tracks) {
        // Ensure tracks is an array
        const tracksArray = Array.isArray(tracks) ? tracks : [];
        const tracksCount = tracksArray.length;
        
        // Remove if already exists
        this.recentPlaylists = this.recentPlaylists.filter(p => p.id !== playlistId);
        // Add to beginning
        this.recentPlaylists.unshift({ id: playlistId, name: playlistName, tracks: tracksCount });
        // Keep only last 20
        this.recentPlaylists = this.recentPlaylists.slice(0, 20);
        this.saveRecentData();
        
        if (this.currentPage === 'home') {
            this.displayRecentPlaylists();
        }
    }

    setupInfiniteScroll() {
        const loader = document.getElementById('infiniteScrollLoader');
        if (!loader) {
            console.warn('infiniteScrollLoader not found');
            return;
        }

        // Disconnect existing observer if any
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.log('Loader intersection:', entry.isIntersecting, 'hasMore:', this.hasMoreResults, 'isLoading:', this.isLoadingMore, 'page:', this.currentPage);
                if (entry.isIntersecting && 
                    this.hasMoreResults && 
                    !this.isLoadingMore && 
                    this.currentSearchQuery &&
                    this.currentPage === 'search') {
                    console.log('Loading more results...');
                    this.loadMoreResults();
                }
            });
        }, {
            root: null,
            rootMargin: '200px', // Start loading earlier
            threshold: 0.1
        });

        this.scrollObserver.observe(loader);
        console.log('Infinite scroll observer setup complete');
    }

    async loadMoreResults() {
        if (this.isLoadingMore || !this.hasMoreResults || !this.currentSearchQuery) {
            console.log('Cannot load more:', {
                isLoading: this.isLoadingMore,
                hasMore: this.hasMoreResults,
                query: this.currentSearchQuery
            });
            return;
        }

        console.log('Loading more results for page:', this.currentSearchPage + 1);
        this.isLoadingMore = true;
        const loader = document.getElementById('infiniteScrollLoader');
        if (loader) {
            loader.style.display = 'flex';
        }

        try {
            const nextPage = this.currentSearchPage + 1;
            console.log(`Fetching page ${nextPage} for query: ${this.currentSearchQuery}`);
            const result = await this.fetchSearchResults(this.currentSearchQuery, nextPage);
            
            // Handle both formats
            let newResults = [];
            let hasMore = false;
            
            if (Array.isArray(result)) {
                newResults = result;
                hasMore = true;
            } else if (result && result.results) {
                newResults = result.results || [];
                hasMore = result.hasMore !== undefined ? result.hasMore : true;
            }
            
            console.log(`Received ${newResults.length} new results, hasMore: ${hasMore}`);
            
            if (newResults.length > 0) {
                // Append new results
                this.searchResults = [...this.searchResults, ...newResults];
                this.currentSearchPage = nextPage;
                this.hasMoreResults = hasMore;
                
                // Display new results (append mode)
                this.displaySearchResultsMain(newResults, false);
            } else {
                console.log('No more results, stopping infinite scroll');
                this.hasMoreResults = false;
            }
        } catch (error) {
            console.error('Error loading more results:', error);
            this.hasMoreResults = false;
        } finally {
            this.isLoadingMore = false;
            if (loader) {
                loader.style.display = this.hasMoreResults ? 'flex' : 'none';
            }
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async resetAllData() {
        // Confirm with user
        if (!confirm('آیا مطمئن هستید که می‌خواهید همه داده‌ها و کش را پاک کنید؟\n\nاین عمل غیرقابل بازگشت است و:\n- همه پلی‌لیست‌ها حذف می‌شوند\n- تاریخچه جستجو پاک می‌شود\n- موزیک‌های اخیر پاک می‌شوند\n- همه کش‌ها پاک می‌شوند')) {
            return;
        }
        
        // Show loading
        this.showLoading(true);
        this.showError('در حال پاک کردن داده‌ها و کش...');
        
        try {
            // Clear all localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mytehran')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Clear Service Worker cache
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.startsWith('mytehran')) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }
            
            // Unregister service worker
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => registration.unregister())
                );
            }
            
            this.showLoading(false);
            this.showError('همه داده‌ها و کش پاک شد. صفحه در حال بارگذاری مجدد...');
            
            // Reload page after a short delay
            setTimeout(() => {
                window.location.reload(true);
            }, 1500);
            
        } catch (error) {
            console.error('Error resetting data:', error);
            this.showLoading(false);
            this.showError('خطا در پاک کردن داده‌ها: ' + error.message);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});


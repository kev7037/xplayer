// MyTehran Music Player - Main Application Logic

class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentIndex = -1;
        this.isShuffle = false;
        this.repeatMode = 0; // 0 = no repeat, 1 = repeat one, 2 = repeat all
        this.shuffledIndices = [];
        this.searchResults = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadPlaylist();
    }

    initializeElements() {
        // Navigation
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = {
            home: document.getElementById('homePage'),
            search: document.getElementById('searchPage'),
            playlists: document.getElementById('playlistsPage')
        };
        
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
        this.playerBarPlayPause = document.getElementById('playerBarPlayPause');
        
        // Controls
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Home Page
        this.recentTracksContainer = document.getElementById('recentTracks');
        this.recentPlaylistsContainer = document.getElementById('recentPlaylists');
        
        // Search Page
        this.searchHistoryList = document.getElementById('searchHistoryList');
        this.searchResultsMain = document.getElementById('searchResultsMain');
        this.resultsContainerMain = document.getElementById('resultsContainerMain');
        
        // Playlists Page
        this.playlistsListMain = document.getElementById('playlistsListMain');
        this.createPlaylistBtnMain = document.getElementById('createPlaylistBtnMain');
        
        // UI
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
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

        // Player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

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
                    this.navigateToPage(page);
                }
            });
        });
        
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
        
        // Bottom Player Bar
        if (this.playerBarPlayPause) {
            this.playerBarPlayPause.addEventListener('click', () => this.togglePlayPause());
        }
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
            const results = await this.fetchSearchResults(query);
            
            this.searchResults = results;
            this.displayResults(results);
            this.showLoading(false);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('خطا در جستجو. لطفا دوباره تلاش کنید.');
            this.showLoading(false);
        }
    }

    async fetchSearchResults(query) {
        // Use the correct search URL format: https://mytehranmusic.com/?s=query
        const searchUrl = `https://mytehranmusic.com/?s=${encodeURIComponent(query)}`;
        
        // Use CORS proxy to bypass CORS restrictions
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const htmlContent = data.contents;
            
            return this.parseSearchResults(htmlContent, query);
        } catch (error) {
            console.warn('Error fetching search results:', error);
            // Try alternative proxy services
            return await this.fetchSearchResultsAlternative(query);
        }
    }

    async fetchSearchResultsAlternative(query) {
        const searchUrl = `https://mytehranmusic.com/?s=${encodeURIComponent(query)}`;
        
        // Try alternative CORS proxy
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(searchUrl)}`;
        
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const htmlContent = await response.text();
            return this.parseSearchResults(htmlContent, query);
        } catch (error) {
            console.warn('Alternative proxy also failed:', error);
            return this.fallbackSearchResults(query);
        }
    }

    parseSearchResults(html, query) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const results = [];

        // Parse based on the actual structure: div.grid-item contains each music track
        // Structure: div.grid-item > div.mcpplay (with data attributes) > div.title > div.artist
        const gridItems = doc.querySelectorAll('div.grid-item');
        
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
                    id: Date.now() + index,
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

        return results.length > 0 ? results : this.fallbackSearchResults(query);
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

    createTrackElement(track, source = 'playlist') {
        const div = document.createElement('div');
        div.className = 'track-item';
        div.dataset.trackId = track.id;

        if (source === 'playlist' && this.currentIndex === this.playlist.findIndex(t => t.id === track.id)) {
            div.classList.add('active');
        }

        const trackImage = track.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b3b3b3"%3E%3Cpath d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/%3E%3C/svg%3E';
        
        div.innerHTML = `
            <div class="track-image">
                <img src="${trackImage}" alt="${this.escapeHtml(track.title)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23b3b3b3\\'%3E%3Cpath d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/%3E%3C/svg%3E'">
            </div>
            <div class="track-info">
                <h4>${this.escapeHtml(track.title)}</h4>
                <p>${this.escapeHtml(track.artist)}</p>
            </div>
            <div class="track-actions">
                ${source === 'results' ? 
                    `<button class="btn btn-small btn-add-to-custom" data-action="add-to-custom" data-track-id="${track.id}" title="اضافه به پلی‌لیست سفارشی">📋</button>
                     <button class="btn btn-small btn-play" data-action="play" data-track-id="${track.id}" title="پخش">▶</button>` :
                    `<button class="btn btn-small btn-play" data-action="play" data-track-id="${track.id}" title="پخش">▶</button>
                     <button class="btn btn-small btn-remove" data-action="remove" data-track-id="${track.id}" title="حذف">🗑</button>`
                }
            </div>
        `;

        // Attach event listeners
        div.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const trackId = parseInt(btn.dataset.trackId);
                
                if (action === 'add-to-custom') {
                    this.showAddToPlaylistDialog(trackId);
                } else if (action === 'play') {
                    this.playTrack(trackId, source);
                } else if (action === 'remove') {
                    this.removeFromPlaylist(trackId);
                }
            });
        });

        return div;
    }

    showAddToPlaylistDialog(trackId) {
        const track = this.searchResults.find(t => t.id === trackId);
        if (!track) return;
        
        const playlists = Object.entries(this.customPlaylists);
        if (playlists.length === 0) {
            if (confirm('هیچ پلی‌لیست سفارشی وجود ندارد. می‌خواهید یک پلی‌لیست جدید بسازید؟')) {
                this.createNewPlaylist();
            }
            return;
        }
        
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
            document.body.removeChild(dialog);
            this.createNewPlaylist();
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
                this.playerSection.style.display = 'none';
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
        } else {
            // Playing from current playlist
            track = this.playlist.find(t => t.id === trackId);
        }
        
        if (!track) return;

        this.currentIndex = this.playlist.findIndex(t => t.id === trackId);
        this.loadAndPlay(track);
        this.updatePlaylistDisplay();
        this.savePlaylist();
    }

    loadAndPlay(track) {
        this.currentTrackEl.textContent = track.title;
        this.currentArtistEl.textContent = track.artist;
        
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
                this.playerSection.style.display = 'block';
                this.updatePlayButton();
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
                this.audioPlayer.play().catch(err => {
                    console.error('Play error:', err);
                    this.showError('خطا در پخش موزیک. لطفا موزیک دیگری انتخاب کنید.');
                });
                this.playerSection.style.display = 'block';
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
        if (this.isShuffle) {
            this.shuffleBtn.classList.add('active');
            this.shuffleBtn.title = 'Shuffle: فعال';
        } else {
            this.shuffleBtn.classList.remove('active');
            this.shuffleBtn.title = 'Shuffle: غیرفعال';
        }
    }

    toggleRepeat() {
        // Cycle through: 0 (no repeat) -> 1 (repeat one) -> 2 (repeat all) -> 0
        this.repeatMode = (this.repeatMode + 1) % 3;
        this.updateRepeatButton();
        this.savePlaylist();
    }

    updateRepeatButton() {
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
            if (this.playerBarPlayPause) this.playerBarPlayPause.textContent = '▶';
        } else {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            if (this.playerBarPlayPause) this.playerBarPlayPause.textContent = '⏸';
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
            this.playerSection.style.display = 'none';
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
        const saved = localStorage.getItem('mytehranCustomPlaylists');
        if (saved) {
            try {
                this.customPlaylists = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading custom playlists:', e);
                this.customPlaylists = {};
            }
        }
        
        const savedNextId = localStorage.getItem('mytehranNextPlaylistId');
        if (savedNextId) {
            this.nextPlaylistId = parseInt(savedNextId);
        }
        
        this.displayCustomPlaylists();
    }

    createNewPlaylist() {
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
        
        this.saveCustomPlaylists();
        this.displayCustomPlaylists();
    }

    displayCustomPlaylists() {
        this.playlistsList.innerHTML = '';
        
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

    selectCustomPlaylist(playlistId) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) return;
        
        this.currentPlaylistId = playlistId;
        this.playlist = [...playlist.tracks];
        this.currentIndex = -1;
        this.updatePlaylistDisplay();
        this.displayCustomPlaylists();
        this.displayCustomPlaylistsMain();
        this.savePlaylist();
        
        // Add to recent playlists
        this.addToRecentPlaylists(playlistId, playlist.name, playlist.tracks);
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
            this.displayCustomPlaylists();
            
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
                this.displayCustomPlaylists();
            });
        });
    }

    deletePlaylist(playlistId) {
        if (confirm('آیا مطمئن هستید که می‌خواهید این پلی‌لیست را حذف کنید؟')) {
            delete this.customPlaylists[playlistId];
            if (this.currentPlaylistId === playlistId) {
                this.currentPlaylistId = null;
                this.playlist = [];
                this.currentIndex = -1;
            }
            this.saveCustomPlaylists();
            this.displayCustomPlaylists();
            this.updatePlaylistDisplay();
        }
    }

    addTrackToCustomPlaylist(playlistId, track) {
        const playlist = this.customPlaylists[playlistId];
        if (!playlist) return;
        
        // Check if track already exists
        if (playlist.tracks.find(t => t.id === track.id)) {
            this.showError('این موزیک قبلا در پلی‌لیست است');
            return;
        }
        
        playlist.tracks.push({...track});
        playlist.downloaded = false; // Reset download status
        this.saveCustomPlaylists();
        this.displayCustomPlaylists();
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
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setupNavigation() {
        // Set initial page
        this.navigateToPage('home');
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        
        // Hide all pages
        Object.values(this.pages).forEach(p => {
            if (p) {
                p.classList.remove('active');
                p.style.display = 'none';
            }
        });
        
        // Remove active from all nav items
        this.navItems.forEach(item => item.classList.remove('active'));
        
        // Show selected page
        if (this.pages[page]) {
            this.pages[page].classList.add('active');
            this.pages[page].style.display = 'block';
            console.log('Page', page, 'displayed');
        } else {
            console.error('Page not found:', page);
        }
        
        // Activate nav item
        const navItem = Array.from(this.navItems).find(item => item.dataset.page === page);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentPage = page;
        
        // Update page content
        if (page === 'home') {
            this.updateHomePage();
        } else if (page === 'playlists') {
            this.displayCustomPlaylistsMain();
        } else if (page === 'search') {
            // Ensure search history is displayed
            this.displaySearchHistory();
        }
    }

    updateHomePage() {
        this.displayRecentTracks();
        this.displayRecentPlaylists();
    }

    displayRecentTracks() {
        this.recentTracksContainer.innerHTML = '';
        
        if (this.recentTracks.length === 0) {
            this.recentTracksContainer.innerHTML = '<p class="empty-state">هیچ موزیکی پخش نشده است</p>';
            return;
        }
        
        // Show last 20 tracks
        const tracksToShow = this.recentTracks.slice(-20).reverse();
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
        
        // Show last 10 playlists
        const playlistsToShow = this.recentPlaylists.slice(-10).reverse();
        playlistsToShow.forEach(({ id, name, tracks }) => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'recent-playlist-item';
            playlistEl.innerHTML = `
                <div class="playlist-info">
                    <h4>${this.escapeHtml(name)}</h4>
                    <p>${tracks.length} موزیک</p>
                </div>
                <button class="btn btn-small btn-play-playlist" data-playlist-id="${id}">▶ پخش</button>
            `;
            
            playlistEl.querySelector('.btn-play-playlist').addEventListener('click', () => {
                this.selectCustomPlaylist(id);
                this.navigateToPage('playlists');
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
        
        this.showLoading(true);
        this.hideError();

        this.fetchSearchResults(query).then(results => {
            console.log('Search results received:', results);
            this.searchResults = results || [];
            this.displaySearchResultsMain(this.searchResults);
            this.showLoading(false);
        }).catch(error => {
            console.error('Search error:', error);
            this.showError('خطا در جستجو. لطفا دوباره تلاش کنید.');
            this.showLoading(false);
        });
    }

    displaySearchResultsMain(results) {
        console.log('displaySearchResultsMain called with:', results);
        
        if (!this.resultsContainerMain) {
            console.error('resultsContainerMain not found');
            return;
        }
        
        if (!this.searchResultsMain) {
            console.error('searchResultsMain not found');
            return;
        }
        
        console.log('Containers found, clearing and displaying...');
        
        this.resultsContainerMain.innerHTML = '';
        this.searchResultsMain.style.display = 'block';
        this.searchResultsMain.style.visibility = 'visible';

        if (!results || results.length === 0) {
            console.log('No results to display');
            this.resultsContainerMain.innerHTML = '<p class="empty-state">نتیجه‌ای یافت نشد</p>';
            return;
        }

        console.log(`Displaying ${results.length} results`);
        console.log('First result sample:', results[0]);
        
        // Limit to first 50 results for performance
        const resultsToShow = results.slice(0, 50);
        
        // Clear container first
        this.resultsContainerMain.innerHTML = '';
        
        // Create a simple test div first to verify display works
        const testDiv = document.createElement('div');
        testDiv.style.padding = '20px';
        testDiv.style.background = 'var(--bg-card)';
        testDiv.style.borderRadius = '8px';
        testDiv.style.marginBottom = '16px';
        testDiv.innerHTML = `<strong style="color: var(--spotify-green);">${results.length} نتیجه یافت شد</strong>`;
        this.resultsContainerMain.appendChild(testDiv);
        
        resultsToShow.forEach((track, index) => {
            try {
                if (!track || !track.id) {
                    console.warn('Invalid track at index', index, ':', track);
                    return;
                }
                
                console.log(`Creating track element ${index + 1}/${resultsToShow.length}:`, track.title);
                
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
        
        // Scroll to results after a short delay to ensure rendering
        setTimeout(() => {
            if (this.resultsContainerMain.children.length > 0) {
                this.searchResultsMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
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

    displaySearchHistory() {
        if (!this.searchHistoryList) {
            console.warn('searchHistoryList not found');
            return;
        }
        
        if (!this.searchHistory) {
            this.searchHistory = [];
        }
        
        this.searchHistoryList.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            this.searchHistoryList.innerHTML = '<p class="empty-state">هیچ جستجویی انجام نشده است</p>';
            return;
        }
        
        this.searchHistory.forEach(query => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <span>${this.escapeHtml(query)}</span>
                <button class="btn btn-small btn-search-history" data-query="${this.escapeHtml(query)}">جستجو</button>
            `;
            
            item.querySelector('.btn-search-history').addEventListener('click', () => {
                this.searchInput.value = query;
                this.searchMain();
            });
            
            this.searchHistoryList.appendChild(item);
        });
    }

    displayCustomPlaylistsMain() {
        this.playlistsListMain.innerHTML = '';
        
        const playlists = Object.entries(this.customPlaylists);
        if (playlists.length === 0) {
            this.playlistsListMain.innerHTML = '<p class="empty-state">هیچ پلی‌لیستی وجود ندارد</p>';
            return;
        }
        
        playlists.forEach(([id, playlist]) => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'custom-playlist-item-main';
            
            playlistEl.innerHTML = `
                <div class="playlist-info-main">
                    <h3>${this.escapeHtml(playlist.name)}</h3>
                    <p>${playlist.tracks.length} موزیک</p>
                    ${playlist.downloaded ? '<span class="downloaded-badge">✓ دانلود شده</span>' : ''}
                </div>
                <div class="playlist-actions-main">
                    <button class="btn btn-small btn-play-playlist-main" data-playlist-id="${id}" title="پخش">▶</button>
                    <button class="btn btn-small btn-download-playlist-main" data-playlist-id="${id}" title="دانلود">⬇</button>
                    <button class="btn btn-small btn-delete-playlist-main" data-playlist-id="${id}" title="حذف">🗑</button>
                </div>
            `;
            
            playlistEl.querySelector('.btn-play-playlist-main').addEventListener('click', () => {
                this.selectCustomPlaylist(id);
            });
            
            playlistEl.querySelector('.btn-download-playlist-main').addEventListener('click', () => {
                this.downloadPlaylist(id);
            });
            
            playlistEl.querySelector('.btn-delete-playlist-main').addEventListener('click', () => {
                this.deletePlaylist(id);
            });
            
            this.playlistsListMain.appendChild(playlistEl);
        });
    }

    loadRecentData() {
        const saved = localStorage.getItem('mytehranRecentData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.recentTracks = Array.isArray(data.tracks) ? data.tracks : [];
                this.recentPlaylists = Array.isArray(data.playlists) ? data.playlists : [];
                this.searchHistory = Array.isArray(data.searchHistory) ? data.searchHistory : [];
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
        }
        
        // Ensure searchHistory is always an array
        if (!Array.isArray(this.searchHistory)) {
            this.searchHistory = [];
        }
        
        this.displaySearchHistory();
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
        // Remove if already exists
        this.recentPlaylists = this.recentPlaylists.filter(p => p.id !== playlistId);
        // Add to beginning
        this.recentPlaylists.unshift({ id: playlistId, name: playlistName, tracks: tracks.length });
        // Keep only last 20
        this.recentPlaylists = this.recentPlaylists.slice(0, 20);
        this.saveRecentData();
        
        if (this.currentPage === 'home') {
            this.displayRecentPlaylists();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});


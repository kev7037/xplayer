/**
 * Constants used throughout the application
 */
export const REPEAT_MODES = {
    OFF: 0,
    ONE: 1,
    ALL: 2
};

export const STORAGE_KEYS = {
    PLAYLIST: 'mytehranPlaylist',
    CURRENT_INDEX: 'mytehranCurrentIndex',
    CURRENT_PLAYLIST_ID: 'mytehranCurrentPlaylistId',
    REPEAT_MODE: 'mytehranRepeatMode',
    SHUFFLE: 'mytehranShuffle',
    CUSTOM_PLAYLISTS: 'mytehranCustomPlaylists',
    NEXT_PLAYLIST_ID: 'mytehranNextPlaylistId',
    RECENT_DATA: 'mytehranRecentData',
    LYRICS_CACHE: 'mytehranLyricsCache',
    EXPLORE_CACHE: 'mytehranExploreCache'
};

export const FAVORITE_PLAYLIST_ID = 'favorite';

export const API_ENDPOINTS = {
    BASE_URL: 'https://mytehranmusic.com',
    SEARCH: '/?s=',
    PROXIES: {
        ALLORIGINS: 'https://api.allorigins.win/get?url=',
        CODETABS: 'https://api.codetabs.com/v1/proxy?quest='
    }
};

export const REQUEST_TIMEOUT = 3000; // 3 seconds

export const CACHE_NAMES = {
    AUDIO: 'mytehran-audio-v1'
};

export const LIMITS = {
    RECENT_TRACKS: 50,
    RECENT_PLAYLISTS: 20
};


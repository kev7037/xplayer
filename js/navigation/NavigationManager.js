/**
 * Navigation Manager - Handles page navigation and routing
 */
export class NavigationManager {
    constructor(pages, navItems) {
        this.pages = pages;
        this.navItems = navItems;
        this.currentPage = null;
        this.previousPage = null;
    }

    /**
     * Navigate to a page
     */
    navigateToPage(page, options = {}) {
        // Prevent navigation to the same page (except for special cases)
        if (this.currentPage === page && page !== 'player' && !options.force) {
            return;
        }

        // Save current page as previous (except for player page)
        if (this.currentPage && this.currentPage !== 'player' && page !== 'player') {
            this.previousPage = this.currentPage;
        }

        // Hide all pages
        Object.values(this.pages).forEach(p => {
            if (p) {
                p.classList.remove('active');
                p.style.display = 'none';
                p.style.visibility = 'hidden';
            }
        });

        // Show selected page
        if (this.pages[page]) {
            this.pages[page].classList.add('active');
            this.pages[page].style.display = 'block';
            this.pages[page].style.visibility = 'visible';
        } else {
            console.error('Page not found:', page);
            // Fallback to home
            if (this.pages.home) {
                this.pages.home.classList.add('active');
                this.pages.home.style.display = 'block';
                this.pages.home.style.visibility = 'visible';
                page = 'home';
            }
        }

        // Update nav items (only for main pages)
        if (this.navItems && page !== 'player' && page !== 'lyrics' && page !== 'exploreDetail') {
            this.navItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Save to localStorage
        try {
            localStorage.setItem('mytehranCurrentPage', page);
        } catch (e) {
            console.warn('Could not save current page:', e);
        }

        this.currentPage = page;
        return page;
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get previous page
     */
    getPreviousPage() {
        return this.previousPage;
    }

    /**
     * Go back to previous page
     */
    goBack() {
        const targetPage = this.previousPage || 'home';
        this.previousPage = null;
        return this.navigateToPage(targetPage);
    }

    /**
     * Setup initial navigation
     */
    setupInitialNavigation() {
        let savedPage = 'home';
        try {
            const saved = localStorage.getItem('mytehranCurrentPage');
            if (saved && (saved === 'home' || saved === 'search' || saved === 'playlists' || saved === 'explore')) {
                savedPage = saved;
            }
        } catch (e) {
            console.warn('Could not load saved page:', e);
        }

        this.navigateToPage(savedPage);
    }

    /**
     * Hide page
     */
    hidePage(pageId) {
        const page = this.pages[pageId];
        if (page) {
            page.classList.remove('active');
            page.style.display = 'none';
            page.style.visibility = 'hidden';
        }
    }

    /**
     * Show page
     */
    showPage(pageId) {
        const page = this.pages[pageId];
        if (page) {
            page.classList.add('active');
            page.style.display = 'block';
            page.style.visibility = 'visible';
        }
    }
}



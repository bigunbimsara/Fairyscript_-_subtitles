// ═══════════════════════════════════════════════════════════════════
// ULTRA MODERN UI FEATURES
// ═══════════════════════════════════════════════════════════════════

// Dark/Light Mode Toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        // Moon icon (dark mode)
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
        // Sun icon (light mode)
        themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
}

// User Profile Display
function updateUserProfileDisplay() {
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');
    
    if (currentUser) {
        // Show profile
        userProfile.style.display = 'flex';
        loginBtn.style.display = 'none';
        
        // Set avatar
        if (currentUser.photoURL) {
            userAvatar.src = currentUser.photoURL;
        } else {
            // Generate avatar from initials
            userAvatar.src = generateAvatar(currentUser.displayName || currentUser.email);
        }
        
        // Set name
        userName.textContent = currentUser.displayName || currentUser.email.split('@')[0];
    } else {
        // Show login button
        userProfile.style.display = 'none';
        loginBtn.style.display = 'block';
    }
}

function generateAvatar(name) {
    // Generate simple avatar with initials
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, '#ff4655');
    gradient.addColorStop(1, '#ff8a00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    // Initials
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = name.substring(0, 2).toUpperCase();
    ctx.fillText(initials, 50, 50);
    
    return canvas.toDataURL();
}

// Sidebar Filters
function setupSidebarFilters() {
    // Country filters
    document.querySelectorAll('[data-country]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-country]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterSubtitles();
        });
    });
    
    // Year filters
    document.querySelectorAll('[data-year]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-year]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterSubtitles();
        });
    });
    
    // Genre filters
    document.querySelectorAll('[data-genre]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-genre]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterSubtitles();
        });
    });
    
    // Year search input
    const yearSearch = document.getElementById('yearSearch');
    if (yearSearch) {
        yearSearch.addEventListener('input', (e) => {
            const year = e.target.value;
            if (year.length === 4) {
                // Find and activate year button
                const yearBtn = document.querySelector(`[data-year="${year}"]`);
                if (yearBtn) {
                    document.querySelectorAll('[data-year]').forEach(b => b.classList.remove('active'));
                    yearBtn.classList.add('active');
                    yearBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    filterSubtitles();
                }
            }
        });
    }
}

function filterSubtitles() {
    const activeCountry = document.querySelector('[data-country].active')?.getAttribute('data-country');
    const activeYear = document.querySelector('[data-year].active')?.getAttribute('data-year');
    const activeGenre = document.querySelector('[data-genre].active')?.getAttribute('data-genre');
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    
    const filtered = subtitles.filter(sub => {
        const matchesCountry = !activeCountry || sub.country === activeCountry;
        const matchesYear = !activeYear || sub.year === activeYear;
        const matchesGenre = !activeGenre || sub.genre === activeGenre;
        const matchesSearch = !searchTerm || 
            sub.title.toLowerCase().includes(searchTerm) ||
            (sub.description && sub.description.toLowerCase().includes(searchTerm));
        
        return matchesCountry && matchesYear && matchesGenre && matchesSearch;
    });
    
    renderSubtitles(filtered);
}

// Update createSubtitleCard to add NEW badge and progress bar
function createSubtitleCardModern(subtitle) {
    // ... existing code ...
    
    // Add NEW badge if uploaded within 7 days
    const isNew = subtitle.uploadDate?.toDate && 
                  (new Date() - subtitle.uploadDate.toDate()) < 7 * 24 * 60 * 60 * 1000;
    
    const newBadge = isNew ? '<div class="new-badge">NEW</div>' : '';
    const progressBar = '<div class="progress-bar"></div>';
    
    return `
        <div class="subtitle-card" data-id="${subtitle.id}">
            <div class="subtitle-thumbnail">
                ${newBadge}
                <img src="${imageUrl}" alt="${subtitle.title}">
                ${progressBar}
                ${canDelete ? deleteBtn : ''}
            </div>
            <!-- rest of card ... -->
        </div>
    `;
}

// Initialize new features
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupSidebarFilters();
});

// Update user profile when auth state changes
auth.onAuthStateChanged((user) => {
    // ... existing code ...
    updateUserProfileDisplay();
});

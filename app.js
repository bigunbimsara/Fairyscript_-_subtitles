// Configuration
const CONFIG = {
    // Replace with your GitHub OAuth App credentials
    CLIENT_ID: 'YOUR_GITHUB_CLIENT_ID', // Get from https://github.com/settings/developers
    REDIRECT_URI: window.location.origin,
    STORAGE_KEY: 'subtitles_data',
    USER_KEY: 'github_user'
};

// State
let currentUser = null;
let subtitles = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadSubtitles();
    renderSubtitles();
    setupEventListeners();
    handleOAuthCallback();
});

// GitHub OAuth
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // In production, exchange code for token on backend
        // For demo, we'll simulate login
        simulateLogin();
        window.history.replaceState({}, document.title, '/');
    }
}

function loginWithGitHub() {
    // For demo purposes - in production use real OAuth
    if (CONFIG.CLIENT_ID === 'YOUR_GITHUB_CLIENT_ID') {
        // Demo mode - simulate login
        simulateLogin();
    } else {
        // Real OAuth flow
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${CONFIG.CLIENT_ID}&redirect_uri=${CONFIG.REDIRECT_URI}&scope=user`;
        window.location.href = authUrl;
    }
}

function simulateLogin() {
    const user = {
        login: 'demo_user',
        name: 'Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        id: Date.now()
    };
    
    currentUser = user;
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    updateUIForUser();
    closeModal('loginModal');
    alert('Login successful! You can now upload subtitles.');
}

function loadUser() {
    const userData = localStorage.getItem(CONFIG.USER_KEY);
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUIForUser();
    }
}

function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const uploadFab = document.getElementById('uploadFab');
    
    if (currentUser) {
        loginBtn.textContent = currentUser.login;
        loginBtn.onclick = logout;
        uploadFab.style.display = 'flex';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem(CONFIG.USER_KEY);
        location.reload();
    }
}

// Subtitle Management
function loadSubtitles() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
        subtitles = JSON.parse(stored);
    } else {
        // Demo data
        subtitles = [
            {
                id: 1,
                title: "THE DRAGON'S BLADE - SEASON 1",
                uploader: 'Auter / Uploader',
                country: 'korea',
                year: '2024',
                genre: 'action',
                image: null,
                file: null,
                uploadDate: new Date().toISOString(),
                downloads: 247
            },
            {
                id: 2,
                title: "MYSTIC ROMANCE - EP 1-16",
                uploader: 'SubTeam LK',
                country: 'korea',
                year: '2024',
                genre: 'romance',
                image: null,
                file: null,
                uploadDate: new Date().toISOString(),
                downloads: 182
            }
        ];
        saveSubtitles();
    }
}

function saveSubtitles() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(subtitles));
}

function renderSubtitles(filtered = null) {
    const grid = document.getElementById('subtitlesGrid');
    const items = filtered || subtitles;
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <p>No subtitles found</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(sub => createSubtitleCard(sub)).join('');
}

function createSubtitleCard(subtitle) {
    const imageUrl = subtitle.image || 'data:image/svg+xml,%3Csvg width="110" height="110" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="110" height="110" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="14" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    
    return `
        <div class="subtitle-card" data-id="${subtitle.id}">
            <div class="subtitle-thumbnail">
                <img src="${imageUrl}" alt="${subtitle.title}">
            </div>
            <div class="subtitle-info">
                <div class="subtitle-title">${subtitle.title}</div>
                <div class="subtitle-meta">${subtitle.uploader}</div>
                ${subtitle.country || subtitle.year || subtitle.genre ? `
                    <div class="subtitle-tags">
                        ${subtitle.country ? `<span class="tag">${subtitle.country}</span>` : ''}
                        ${subtitle.year ? `<span class="tag">${subtitle.year}</span>` : ''}
                        ${subtitle.genre ? `<span class="tag">${subtitle.genre}</span>` : ''}
                    </div>
                ` : ''}
                <div class="subtitle-progress">
                    <div class="progress-bar" style="width: ${Math.min(subtitle.downloads / 5, 100)}%"></div>
                </div>
            </div>
            <button class="download-btn" onclick="downloadSubtitle(${subtitle.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    `;
}

function downloadSubtitle(id) {
    const subtitle = subtitles.find(s => s.id === id);
    if (!subtitle) return;
    
    // Increment download count
    subtitle.downloads = (subtitle.downloads || 0) + 1;
    saveSubtitles();
    renderSubtitles();
    
    if (subtitle.file) {
        // Download the actual file
        const link = document.createElement('a');
        link.href = subtitle.file;
        link.download = `${subtitle.title}.srt`;
        link.click();
    } else {
        // Demo: Create a sample subtitle file
        const sampleContent = `1
00:00:00,000 --> 00:00:03,000
${subtitle.title}

2
00:00:03,000 --> 00:00:06,000
Subtitles by ${subtitle.uploader}
`;
        const blob = new Blob([sampleContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${subtitle.title}.srt`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    // Visual feedback
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    }
}

// Upload Functionality
function handleUploadSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    const title = document.getElementById('titleInput').value;
    const subtitleFile = document.getElementById('subtitleFile').files[0];
    const imageFile = document.getElementById('imageFile').files[0];
    const country = document.getElementById('uploadCountry').value;
    const year = document.getElementById('uploadYear').value;
    const genre = document.getElementById('uploadGenre').value;
    
    if (!title || !subtitleFile) {
        alert('Please provide title and subtitle file!');
        return;
    }
    
    // Read files
    const fileReader = new FileReader();
    const imageReader = new FileReader();
    
    fileReader.onload = (e) => {
        const subtitleData = e.target.result;
        
        const processImage = imageFile ? 
            new Promise((resolve) => {
                imageReader.onload = (e) => resolve(e.target.result);
                imageReader.readAsDataURL(imageFile);
            }) : 
            Promise.resolve(null);
        
        processImage.then(imageData => {
            const newSubtitle = {
                id: Date.now(),
                title: title,
                uploader: currentUser.login,
                country: country,
                year: year,
                genre: genre,
                image: imageData,
                file: subtitleData,
                uploadDate: new Date().toISOString(),
                downloads: 0
            };
            
            subtitles.unshift(newSubtitle);
            saveSubtitles();
            renderSubtitles();
            closeModal('uploadModal');
            document.getElementById('uploadForm').reset();
            
            alert('Subtitle uploaded successfully!');
        });
    };
    
    fileReader.readAsDataURL(subtitleFile);
}

// Search and Filter
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const nameInput = document.querySelector('.name-input');
    const countryFilter = document.getElementById('countryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    
    const performFilter = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const nameTerm = nameInput.value.toLowerCase();
        const country = countryFilter.value;
        const year = yearFilter.value;
        const genre = genreFilter.value;
        
        const filtered = subtitles.filter(sub => {
            const matchesSearch = !searchTerm || sub.title.toLowerCase().includes(searchTerm);
            const matchesName = !nameTerm || sub.title.toLowerCase().includes(nameTerm);
            const matchesCountry = !country || sub.country === country;
            const matchesYear = !year || sub.year === year;
            const matchesGenre = !genre || sub.genre === genre;
            
            return matchesSearch && matchesName && matchesCountry && matchesYear && matchesGenre;
        });
        
        renderSubtitles(filtered);
    };
    
    searchInput.addEventListener('input', performFilter);
    nameInput.addEventListener('input', performFilter);
    countryFilter.addEventListener('change', performFilter);
    yearFilter.addEventListener('change', performFilter);
    genreFilter.addEventListener('change', performFilter);
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Event Listeners
function setupEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => {
        if (!currentUser) {
            openModal('loginModal');
        }
    });
    
    document.getElementById('githubLoginBtn').addEventListener('click', loginWithGitHub);
    document.getElementById('closeModal').addEventListener('click', () => closeModal('loginModal'));
    
    // Upload
    document.getElementById('uploadFab').addEventListener('click', () => {
        if (currentUser) {
            openModal('uploadModal');
        } else {
            openModal('loginModal');
        }
    });
    
    document.getElementById('closeUploadModal').addEventListener('click', () => closeModal('uploadModal'));
    document.getElementById('uploadForm').addEventListener('submit', handleUploadSubmit);
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Search and filter
    setupSearchAndFilter();
    
    // Search button
    document.querySelector('.search-btn').addEventListener('click', () => {
        document.getElementById('searchInput').focus();
    });
}

// Make downloadSubtitle available globally
window.downloadSubtitle = downloadSubtitle;

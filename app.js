// APPEND THIS TO YOUR EXISTING app.js FILE (at the END)

// ═══════════════════════════════════════════════════════════════════
// DROPDOWN FILTERS + TAGS + RESPONSIVE UI
// ═══════════════════════════════════════════════════════════════════

// Current filters
let currentFilters = {
    country: '',
    year: '',
    genre: '',
    quality: ''
};

// Dropdown toggle
function toggleDropdown(btnId, menuId) {
    const btn = document.getElementById(btnId);
    const menu = document.getElementById(menuId);
    const allMenus = document.querySelectorAll('.dropdown-menu');
    const allBtns = document.querySelectorAll('.filter-btn');
    
    // Close other dropdowns
    allMenus.forEach(m => {
        if (m.id !== menuId) m.classList.remove('show');
    });
    allBtns.forEach(b => {
        if (b.id !== btnId) b.classList.remove('open');
    });
    
    // Toggle current
    menu.classList.toggle('show');
    btn.classList.toggle('open');
}

// Update filter button text
function updateFilterButton(btnId, text) {
    const btn = document.getElementById(btnId);
    const span = btn.querySelector('span');
    if (span) span.textContent = text;
    btn.classList.add('active');
}

// Reset filter button
function resetFilterButton(btnId, defaultText) {
    const btn = document.getElementById(btnId);
    const span = btn.querySelector('span');
    if (span) span.textContent = defaultText;
    btn.classList.remove('active');
}

// Apply filters
function applyFilters() {
    const filtered = subtitles.filter(sub => {
        const matchCountry = !currentFilters.country || sub.country === currentFilters.country;
        const matchYear = !currentFilters.year || sub.year === currentFilters.year;
        const matchGenre = !currentFilters.genre || sub.genre === currentFilters.genre;
        const matchQuality = !currentFilters.quality || 
            (sub.tags && sub.tags.includes(currentFilters.quality));
        
        return matchCountry && matchYear && matchGenre && matchQuality;
    });
    
    renderSubtitles(filtered);
}

// Clear login state
function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const uploadFab = document.getElementById('uploadFab');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        
        if (currentUser.photoURL) {
            avatar.src = currentUser.photoURL;
        } else {
            const initial = (currentUser.displayName || 'U')[0].toUpperCase();
            avatar.src = `data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23e50914"/%3E%3Ctext x="20" y="27" font-size="18" fill="white" text-anchor="middle"%3E${initial}%3C/text%3E%3C/svg%3E`;
        }
        
        name.textContent = (currentUser.displayName || currentUser.email?.split('@')[0] || 'User').substring(0, 12);
        
        if (uploadFab) uploadFab.style.display = 'flex';
    }
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const uploadFab = document.getElementById('uploadFab');
    
    loginBtn.style.display = 'block';
    userInfo.style.display = 'none';
    
    if (uploadFab) uploadFab.style.display = 'none';
}

// Render with tags
function renderSubtitles(filtered = null) {
    const list = document.getElementById('subtitlesList');
    const loading = document.getElementById('loading');
    
    if (!list) return;
    
    loading.style.display = 'none';
    const items = filtered || subtitles;
    
    if (items.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:80px 20px;color:var(--text-muted);font-size:1.1rem">No subtitles found</div>';
        return;
    }
    
    list.innerHTML = items.map(sub => {
        let img = 'data:image/svg+xml,%3Csvg width="120" height="120" xmlns="http://www.w3.org/2000/svg"%3E%3Crect fill="%23333" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="14" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        
        if (sub.imageData) img = sub.imageData;
        else if (sub.imageUrl) img = sub.imageUrl;
        
        let tagsHTML = '';
        if (sub.tags && sub.tags.length > 0) {
            tagsHTML = '<div class="tags">' + 
                sub.tags.map(t => `<span class="tag">${t}</span>`).join('') +
                '</div>';
        }
        
        return `
            <div class="card" data-id="${sub.id}">
                <div class="thumb">
                    <img src="${img}" alt="${sub.title}">
                </div>
                <div class="content">
                    <div class="title">${sub.title}</div>
                    <div class="meta">${sub.uploaderName || 'Uploader'} • ${sub.country || ''} ${sub.year || ''}</div>
                    ${tagsHTML}
                </div>
                <button class="download" onclick="downloadSubtitle('${sub.id}')">
                    <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

// Upload with tags
async function handleUploadSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return openModal('loginModal');
    }
    
    const title = document.getElementById('titleInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const tagsInput = document.getElementById('tagsInput').value.trim();
    const subtitleFile = document.getElementById('subtitleFile').files[0];
    const imageFile = document.getElementById('imageFile').files[0];
    const country = document.getElementById('uploadCountry').value;
    const year = document.getElementById('uploadYear').value;
    const genre = document.getElementById('uploadGenre').value;
    
    if (!title || !subtitleFile) {
        return showNotification('Title and file required', 'error');
    }
    
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    
    try {
        setUploadingState(true);
        
        let subtitleStorage;
        if (subtitleFile.size > 200 * 1024) {
            subtitleStorage = await uploadFileInChunks(subtitleFile, 'subtitle');
        } else {
            const base64 = await fileToBase64(subtitleFile);
            subtitleStorage = {
                fileData: base64,
                fileName: subtitleFile.name,
                fileSize: subtitleFile.size,
                fileMimeType: subtitleFile.type
            };
        }
        
        let imageStorage = null;
        if (imageFile) {
            if (imageFile.size > 200 * 1024) {
                imageStorage = await uploadFileInChunks(imageFile, 'image');
            } else {
                const base64 = await fileToBase64(imageFile);
                imageStorage = { imageData: base64 };
            }
        }
        
        await db.collection('subtitles').add({
            title,
            description,
            tags,
            country,
            year,
            genre,
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName || currentUser.email,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0,
            ...subtitleStorage,
            ...imageStorage
        });
        
        showNotification('Uploaded successfully! 🎉');
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed', 'error');
    } finally {
        setUploadingState(false);
    }
}

// Initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
    // Country dropdown
    const countryBtn = document.getElementById('countryBtn');
    const countryMenu = document.getElementById('countryMenu');
    
    if (countryBtn && countryMenu) {
        countryBtn.addEventListener('click', () => toggleDropdown('countryBtn', 'countryMenu'));
        
        countryMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const country = btn.getAttribute('data-country');
                currentFilters.country = country;
                
                if (country) {
                    updateFilterButton('countryBtn', btn.textContent);
                } else {
                    resetFilterButton('countryBtn', 'All Countries');
                }
                
                countryMenu.classList.remove('show');
                countryBtn.classList.remove('open');
                applyFilters();
            });
        });
    }
    
    // Year dropdown
    const yearBtn = document.getElementById('yearBtn');
    const yearMenu = document.getElementById('yearMenu');
    
    if (yearBtn && yearMenu) {
        yearBtn.addEventListener('click', () => toggleDropdown('yearBtn', 'yearMenu'));
        
        yearMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const year = btn.getAttribute('data-year');
                currentFilters.year = year;
                
                if (year) {
                    updateFilterButton('yearBtn', btn.textContent);
                } else {
                    resetFilterButton('yearBtn', 'All Years');
                }
                
                yearMenu.classList.remove('show');
                yearBtn.classList.remove('open');
                applyFilters();
            });
        });
    }
    
    // Genre dropdown
    const genreBtn = document.getElementById('genreBtn');
    const genreMenu = document.getElementById('genreMenu');
    
    if (genreBtn && genreMenu) {
        genreBtn.addEventListener('click', () => toggleDropdown('genreBtn', 'genreMenu'));
        
        genreMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const genre = btn.getAttribute('data-genre');
                currentFilters.genre = genre;
                
                if (genre) {
                    updateFilterButton('genreBtn', btn.textContent);
                } else {
                    resetFilterButton('genreBtn', 'All Genres');
                }
                
                genreMenu.classList.remove('show');
                genreBtn.classList.remove('open');
                applyFilters();
            });
        });
    }
    
    // Quality dropdown
    const qualityBtn = document.getElementById('qualityBtn');
    const qualityMenu = document.getElementById('qualityMenu');
    
    if (qualityBtn && qualityMenu) {
        qualityBtn.addEventListener('click', () => toggleDropdown('qualityBtn', 'qualityMenu'));
        
        qualityMenu.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = btn.getAttribute('data-quality');
                currentFilters.quality = quality;
                
                if (quality) {
                    updateFilterButton('qualityBtn', btn.textContent);
                } else {
                    resetFilterButton('qualityBtn', 'All Quality');
                }
                
                qualityMenu.classList.remove('show');
                qualityBtn.classList.remove('open');
                applyFilters();
            });
        });
    }
    
    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('open'));
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                showNotification('Logged out successfully');
            });
        });
    }
});

console.log('✅ Dropdown filters + Tags + Responsive UI loaded');

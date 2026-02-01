// State
let currentUser = null;
let subtitles = [];
let unsubscribeSubtitles = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupAuthListener();
    setupEventListeners();
});

// ========== AUTHENTICATION ==========

function setupAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = {
                uid: user.uid,
                displayName: user.displayName || user.email,
                email: user.email,
                photoURL: user.photoURL,
                provider: user.providerData[0]?.providerId
            };
            
            console.log('User logged in:', currentUser);
            updateUIForUser();
            loadSubtitles();
        } else {
            currentUser = null;
            console.log('User logged out');
            updateUIForLoggedOut();
            loadSubtitles(); // Still load subtitles for viewing
        }
    });
}

function loginWithGitHub() {
    auth.signInWithPopup(githubProvider)
        .then((result) => {
            console.log('Login successful:', result.user);
            closeModal('loginModal');
            showNotification('Login successful! Welcome ' + result.user.displayName);
        })
        .catch((error) => {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                showNotification('Login cancelled', 'error');
            } else {
                showNotification('Login failed. Please try again.', 'error');
            }
        });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut()
            .then(() => {
                showNotification('Logged out successfully');
            })
            .catch((error) => {
                console.error('Logout error:', error);
                showNotification('Logout failed', 'error');
            });
    }
}

function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const uploadFab = document.getElementById('uploadFab');
    
    if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        loginBtn.textContent = displayName;
        loginBtn.onclick = logout;
        loginBtn.classList.add('logged-in');
        uploadFab.style.display = 'flex';
    }
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const uploadFab = document.getElementById('uploadFab');
    
    loginBtn.textContent = 'login';
    loginBtn.onclick = () => openModal('loginModal');
    loginBtn.classList.remove('logged-in');
    uploadFab.style.display = 'none';
}

// ========== SUBTITLE MANAGEMENT ==========

function loadSubtitles() {
    showLoading(true);
    
    // Unsubscribe from previous listener if exists
    if (unsubscribeSubtitles) {
        unsubscribeSubtitles();
    }
    
    // Real-time listener for subtitles
    unsubscribeSubtitles = db.collection('subtitles')
        .orderBy('uploadDate', 'desc')
        .onSnapshot((snapshot) => {
            subtitles = [];
            snapshot.forEach((doc) => {
                subtitles.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Loaded subtitles:', subtitles.length);
            renderSubtitles();
            showLoading(false);
        }, (error) => {
            console.error('Error loading subtitles:', error);
            showNotification('Failed to load subtitles', 'error');
            showLoading(false);
        });
}

function renderSubtitles(filtered = null) {
    const grid = document.getElementById('subtitlesGrid');
    const items = filtered || subtitles;
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <p>No subtitles found</p>
                ${!currentUser ? '<p class="hint">Login to upload subtitles!</p>' : '<p class="hint">Be the first to upload!</p>'}
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(sub => createSubtitleCard(sub)).join('');
}

function createSubtitleCard(subtitle) {
    const imageUrl = subtitle.imageUrl || 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%23222"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="16" text-anchor="middle" dy=".3em"%3E' + encodeURIComponent(subtitle.title.substring(0, 20)) + '%3C/text%3E%3C/svg%3E';
    
    const uploadDate = subtitle.uploadDate?.toDate ? 
        subtitle.uploadDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
        'Recently';
    
    const canDelete = currentUser && currentUser.uid === subtitle.uploaderId;
    
    return `
        <div class="subtitle-card" data-id="${subtitle.id}">
            <div class="subtitle-thumbnail">
                <img src="${imageUrl}" alt="${subtitle.title}" loading="lazy">
                ${canDelete ? `<button class="delete-btn" onclick="deleteSubtitle('${subtitle.id}')" title="Delete">🗑️</button>` : ''}
            </div>
            <div class="subtitle-info">
                <div class="subtitle-title">${subtitle.title}</div>
                <div class="subtitle-meta">
                    <span>📤 ${subtitle.uploaderName || 'Anonymous'}</span>
                    <span>📅 ${uploadDate}</span>
                </div>
                ${subtitle.description ? `<div class="subtitle-description">${subtitle.description}</div>` : ''}
                ${subtitle.country || subtitle.year || subtitle.genre ? `
                    <div class="subtitle-tags">
                        ${subtitle.country ? `<span class="tag">🌍 ${subtitle.country}</span>` : ''}
                        ${subtitle.year ? `<span class="tag">📆 ${subtitle.year}</span>` : ''}
                        ${subtitle.genre ? `<span class="tag">🎬 ${subtitle.genre}</span>` : ''}
                    </div>
                ` : ''}
                <div class="subtitle-stats">
                    <span>⬇️ ${subtitle.downloads || 0} downloads</span>
                </div>
            </div>
            <button class="download-btn" onclick="downloadSubtitle('${subtitle.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    `;
}

async function downloadSubtitle(id) {
    const subtitle = subtitles.find(s => s.id === id);
    if (!subtitle || !subtitle.fileUrl) {
        showNotification('Subtitle file not found', 'error');
        return;
    }
    
    try {
        // Increment download count
        await db.collection('subtitles').doc(id).update({
            downloads: firebase.firestore.FieldValue.increment(1)
        });
        
        // Download the file
        const link = document.createElement('a');
        link.href = subtitle.fileUrl;
        link.download = subtitle.fileName || `${subtitle.title}.srt`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Download started!');
        
        // Visual feedback
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        }
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed', 'error');
    }
}

async function deleteSubtitle(id) {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const subtitle = subtitles.find(s => s.id === id);
    if (!subtitle) return;
    
    // Check ownership
    if (subtitle.uploaderId !== currentUser.uid) {
        showNotification('You can only delete your own subtitles', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this subtitle?')) {
        return;
    }
    
    try {
        showNotification('Deleting...');
        
        // Delete file from storage
        if (subtitle.filePath) {
            await storage.ref(subtitle.filePath).delete().catch(err => {
                console.warn('File deletion warning:', err);
            });
        }
        
        // Delete image from storage
        if (subtitle.imagePath) {
            await storage.ref(subtitle.imagePath).delete().catch(err => {
                console.warn('Image deletion warning:', err);
            });
        }
        
        // Delete from Firestore
        await db.collection('subtitles').doc(id).delete();
        
        showNotification('Subtitle deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete subtitle', 'error');
    }
}

// ========== UPLOAD FUNCTIONALITY ==========

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login first', 'error');
        openModal('loginModal');
        return;
    }
    
    const title = document.getElementById('titleInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const subtitleFile = document.getElementById('subtitleFile').files[0];
    const imageFile = document.getElementById('imageFile').files[0];
    const country = document.getElementById('uploadCountry').value;
    const year = document.getElementById('uploadYear').value;
    const genre = document.getElementById('uploadGenre').value;
    
    if (!title || !subtitleFile) {
        showNotification('Please provide title and subtitle file', 'error');
        return;
    }
    
    // Validate file size (5MB for subtitle, 2MB for image)
    if (subtitleFile.size > 5 * 1024 * 1024) {
        showNotification('Subtitle file is too large (max 5MB)', 'error');
        return;
    }
    
    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
        showNotification('Image file is too large (max 2MB)', 'error');
        return;
    }
    
    try {
        setUploadingState(true);
        
        // Upload subtitle file to Storage
        const subtitlePath = `subtitles/${currentUser.uid}/${Date.now()}_${subtitleFile.name}`;
        const subtitleRef = storage.ref(subtitlePath);
        await subtitleRef.put(subtitleFile);
        const subtitleUrl = await subtitleRef.getDownloadURL();
        
        // Upload image if provided
        let imageUrl = null;
        let imagePath = null;
        if (imageFile) {
            imagePath = `images/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
            const imageRef = storage.ref(imagePath);
            await imageRef.put(imageFile);
            imageUrl = await imageRef.getDownloadURL();
        }
        
        // Create subtitle document in Firestore
        const subtitleData = {
            title,
            description,
            fileUrl: subtitleUrl,
            filePath: subtitlePath,
            fileName: subtitleFile.name,
            imageUrl,
            imagePath,
            country,
            year,
            genre,
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName || currentUser.email,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0
        };
        
        await db.collection('subtitles').add(subtitleData);
        
        showNotification('Subtitle uploaded successfully! 🎉');
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
    } finally {
        setUploadingState(false);
    }
}

function setUploadingState(uploading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    submitBtn.disabled = uploading;
    btnText.style.display = uploading ? 'none' : 'inline';
    btnLoader.style.display = uploading ? 'inline' : 'none';
}

// ========== SEARCH AND FILTER ==========

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const countryFilter = document.getElementById('countryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    
    const performFilter = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const country = countryFilter.value;
        const year = yearFilter.value;
        const genre = genreFilter.value;
        
        const filtered = subtitles.filter(sub => {
            const matchesSearch = !searchTerm || 
                sub.title.toLowerCase().includes(searchTerm) ||
                (sub.description && sub.description.toLowerCase().includes(searchTerm)) ||
                (sub.uploaderName && sub.uploaderName.toLowerCase().includes(searchTerm));
            
            const matchesCountry = !country || sub.country === country;
            const matchesYear = !year || sub.year === year;
            const matchesGenre = !genre || sub.genre === genre;
            
            return matchesSearch && matchesCountry && matchesYear && matchesGenre;
        });
        
        renderSubtitles(filtered);
    };
    
    searchInput.addEventListener('input', performFilter);
    countryFilter.addEventListener('change', performFilter);
    yearFilter.addEventListener('change', performFilter);
    genreFilter.addEventListener('change', performFilter);
}

// ========== UI HELPERS ==========

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    const grid = document.getElementById('subtitlesGrid');
    loader.style.display = show ? 'flex' : 'none';
    grid.style.display = show ? 'none' : 'grid';
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== EVENT LISTENERS ==========

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

// Make functions available globally
window.downloadSubtitle = downloadSubtitle;
window.deleteSubtitle = deleteSubtitle;

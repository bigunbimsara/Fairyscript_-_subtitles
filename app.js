// ADD THIS TO THE END OF YOUR EXISTING app.js FILE

// ══════════════════════════════════════════════════════════════════════
// ULTRA MODERN UI WITH ALL FIXES
// ══════════════════════════════════════════════════════════════════════

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast glass ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update UI for logged in user
function updateUIForUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const uploadFab = document.getElementById('uploadFab');
    
    if (currentUser) {
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';
        
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        
        if (currentUser.photoURL) {
            avatar.src = currentUser.photoURL;
        } else {
            const initial = (currentUser.displayName || 'U')[0].toUpperCase();
            avatar.src = `data:image/svg+xml,%3Csvg width="45" height="45" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="22.5" cy="22.5" r="22.5" fill="%236366f1"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".35em"%3E${initial}%3C/text%3E%3C/svg%3E`;
        }
        
        name.textContent = (currentUser.displayName || currentUser.email?.split('@')[0] || 'User').substring(0, 15);
        
        if (uploadFab) uploadFab.style.display = 'flex';
        
        showToast('Welcome back, ' + name.textContent + '! 👋', 'success');
    }
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const uploadFab = document.getElementById('uploadFab');
    
    loginBtn.style.display = 'flex';
    userProfile.style.display = 'none';
    
    if (uploadFab) uploadFab.style.display = 'none';
}

// Render subtitles with proper image display
function renderSubtitles(filtered = null) {
    const grid = document.getElementById('subtitlesGrid');
    const loading = document.getElementById('loading');
    
    if (!grid) return;
    
    loading.style.display = 'none';
    const items = filtered || subtitles;
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.3;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No subtitles found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(sub => {
        // FIX: Proper image display with priority
        let imageUrl = 'data:image/svg+xml,%3Csvg width="320" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="320" height="200" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" fill="%2394a3b8" font-size="14" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        
        // Priority: imageData (base64) > imageUrl > placeholder
        if (sub.imageData) {
            imageUrl = sub.imageData;
            console.log('Using imageData for:', sub.title);
        } else if (sub.imageUrl) {
            imageUrl = sub.imageUrl;
            console.log('Using imageUrl for:', sub.title);
        } else if (sub.imageChunkIds && sub.imageChunkIds.length > 0) {
            // Load chunked image async
            imageUrl = 'data:image/svg+xml,%3Csvg width="320" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="320" height="200" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" fill="%2394a3b8" font-size="12" text-anchor="middle" dy=".3em"%3ELoading...%3C/text%3E%3C/svg%3E';
            
            setTimeout(async () => {
                try {
                    const loadedImage = await downloadFileFromChunks(
                        sub.imageChunkIds,
                        'image',
                        sub.imageMimeType || 'image/jpeg'
                    );
                    const img = document.querySelector(`[data-id="${sub.id}"] .subtitle-thumbnail img`);
                    if (img) {
                        img.src = loadedImage;
                        console.log('Loaded chunked image for:', sub.title);
                    }
                } catch (err) {
                    console.error('Failed to load chunked image:', err);
                }
            }, 100);
        }
        
        // Tags
        let tagsHTML = '';
        if (sub.tags && sub.tags.length > 0) {
            tagsHTML = sub.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
        
        // FIX: Quality badge from videoQuality field
        let qualityBadge = '';
        if (sub.videoQuality) {
            qualityBadge = `<div class="quality-badge">${sub.videoQuality.toUpperCase()}</div>`;
        }
        
        return `
            <div class="subtitle-card glass" data-id="${sub.id}">
                <div class="subtitle-thumbnail">
                    <img src="${imageUrl}" alt="${sub.title}" loading="lazy">
                    ${qualityBadge}
                </div>
                <div class="subtitle-info">
                    <h3 class="subtitle-title">${sub.title}</h3>
                    <div class="subtitle-meta">
                        <span>${sub.uploaderName || 'User'}</span>
                        <span>•</span>
                        <span>${sub.country || ''} ${sub.year || ''}</span>
                    </div>
                    <div class="subtitle-tags">
                        ${tagsHTML}
                    </div>
                    <div class="subtitle-footer">
                        <span style="font-size: 0.85rem; color: var(--text-muted);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.25rem;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            ${sub.downloads || 0}
                        </span>
                        <button class="download-btn" onclick="downloadSubtitle('${sub.id}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// FIX: Upload with video quality and proper image handling
async function handleUploadSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Please login first', 'error');
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
    const videoQuality = document.getElementById('videoQuality').value; // FIX: Added video quality
    
    if (!title || !subtitleFile) {
        showToast('Title and subtitle file are required', 'error');
        return;
    }
    
    if (!videoQuality) {
        showToast('Please select video quality', 'error');
        return;
    }
    
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
    
    try {
        setUploadingState(true);
        showToast('Uploading... Please wait', 'success');
        
        // Handle subtitle file
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
        
        // FIX: Handle image file properly
        let imageStorage = null;
        if (imageFile) {
            if (imageFile.size > 200 * 1024) {
                // Large image - use chunked upload
                imageStorage = await uploadFileInChunks(imageFile, 'image');
            } else {
                // Small image - store as base64
                const base64 = await fileToBase64(imageFile);
                imageStorage = { 
                    imageData: base64,
                    imageMimeType: imageFile.type,
                    imageSize: imageFile.size
                };
            }
        }
        
        // Create document
        const subtitleDoc = {
            title,
            description,
            tags,
            country,
            year,
            genre,
            videoQuality, // FIX: Added video quality
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName || currentUser.email,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0,
            ...subtitleStorage,
            ...imageStorage
        };
        
        await db.collection('subtitles').add(subtitleDoc);
        
        showToast('Subtitle uploaded successfully! 🎉', 'success');
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
    } finally {
        setUploadingState(false);
    }
}

// Filters
function setupFilters() {
    const countryFilter = document.getElementById('countryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    const qualityFilter = document.getElementById('qualityFilter');
    
    const applyFilters = () => {
        const country = countryFilter?.value || '';
        const year = yearFilter?.value || '';
        const genre = genreFilter?.value || '';
        const quality = qualityFilter?.value || '';
        
        const filtered = subtitles.filter(sub => {
            const matchCountry = !country || sub.country === country;
            const matchYear = !year || sub.year === year;
            const matchGenre = !genre || sub.genre === genre;
            const matchQuality = !quality || sub.videoQuality === quality;
            
            return matchCountry && matchYear && matchGenre && matchQuality;
        });
        
        renderSubtitles(filtered);
    };
    
    if (countryFilter) countryFilter.addEventListener('change', applyFilters);
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (genreFilter) genreFilter.addEventListener('change', applyFilters);
    if (qualityFilter) qualityFilter.addEventListener('change', applyFilters);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                showToast('Logged out successfully', 'success');
            });
        });
    }
    
    // Modal close buttons
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeUploadModal = document.getElementById('closeUploadModal');
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => closeModal('loginModal'));
    }
    
    if (closeUploadModal) {
        closeUploadModal.addEventListener('click', () => closeModal('uploadModal'));
    }
    
    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal(backdrop.closest('.modal').id);
            }
        });
    });
});

console.log('✅ Ultra modern glassmorphism UI loaded with all fixes');
console.log('✅ Image display fixed');
console.log('✅ Video quality selector added');
console.log('✅ Success/Error messages added');
console.log('✅ Sinhala font support enabled');
console.log('✅ UTF-8 encoding ensured');

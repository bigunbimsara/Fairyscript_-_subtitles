// ═══════════════════════════════════════════════════════════════════
// FAIRYSCRIPT - SINHALA SUBTITLES PLATFORM
// With Chunked Upload Support (5MB files)
// ═══════════════════════════════════════════════════════════════════

// State Management
let currentUser = null;
let subtitles = [];
let unsubscribeSubtitles = null;

// File size limits (in bytes)
const MAX_SUBTITLE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const CHUNK_SIZE = 200 * 1024; // 200KB per chunk

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    console.log('═══════════════════════════════════════════');
    console.log('🚀 Fairyscript Application Starting...');
    console.log('═══════════════════════════════════════════');
    
    if (typeof firebase === 'undefined') {
        console.error('❌ CRITICAL: Firebase SDK not loaded!');
        showNotification('Configuration error. Please contact admin.', 'error');
        return;
    }
    
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('❌ CRITICAL: Firebase not initialized!');
        showNotification('Configuration error. Please refresh page.', 'error');
        return;
    }
    
    console.log('✅ Firebase SDK loaded');
    console.log('✅ Firebase initialized');
    
    setupAuthListener();
    setupEventListeners();
    
    console.log('✅ Application initialized successfully');
});

// ═══════════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════

function setupAuthListener() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = {
                uid: user.uid,
                displayName: user.displayName || user.email,
                email: user.email,
                photoURL: user.photoURL,
                provider: user.providerData[0]?.providerId
            };
            
            console.log('✅ USER LOGGED IN:', currentUser.email);
            updateUIForUser();
            loadSubtitles();
        } else {
            currentUser = null;
            console.log('❌ User logged out');
            updateUIForLoggedOut();
            loadSubtitles();
        }
    });
}

function loginWithGitHub() {
    const githubProvider = new firebase.auth.GithubAuthProvider();
    auth.signInWithPopup(githubProvider)
        .then((result) => {
            console.log('✅ GitHub login successful');
            closeModal('loginModal');
            showNotification('Welcome ' + result.user.displayName + '! 🎉');
        })
        .catch((error) => handleLoginError(error));
}

function loginWithGoogle() {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            console.log('✅ Google login successful');
            closeModal('loginModal');
            showNotification('Welcome ' + result.user.displayName + '! 🎉');
        })
        .catch((error) => handleLoginError(error));
}

function handleLoginError(error) {
    console.error('Login error:', error.code, error.message);
    let userMessage = 'Login failed. ';
    
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            userMessage = 'Login cancelled.';
            break;
        case 'auth/unauthorized-domain':
            userMessage = 'Domain not authorized. Add ' + window.location.hostname + ' to Firebase.';
            break;
        case 'auth/popup-blocked':
            userMessage = 'Popup blocked. Please allow popups.';
            break;
        default:
            userMessage = 'Login failed: ' + error.message;
    }
    
    showNotification(userMessage, 'error');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut()
            .then(() => showNotification('Logged out successfully'))
            .catch((error) => showNotification('Logout failed', 'error'));
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
        if (uploadFab) uploadFab.style.display = 'flex';
    }
}

function updateUIForLoggedOut() {
    const loginBtn = document.getElementById('loginBtn');
    const uploadFab = document.getElementById('uploadFab');
    
    loginBtn.textContent = 'login';
    loginBtn.onclick = () => openModal('loginModal');
    loginBtn.classList.remove('logged-in');
    if (uploadFab) uploadFab.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════
// CHUNKED FILE OPERATIONS
// ═══════════════════════════════════════════════════════════════════

async function uploadFileInChunks(file, type) {
    console.log(`📦 Uploading ${type} in chunks...`);
    console.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    const base64 = await fileToBase64(file);
    const base64Data = base64.split(',')[1]; // Remove data URL prefix
    
    const totalChunks = Math.ceil(base64Data.length / CHUNK_SIZE);
    console.log(`Total chunks: ${totalChunks}`);
    
    const chunkIds = [];
    
    // Upload each chunk
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, base64Data.length);
        const chunkData = base64Data.substring(start, end);
        
        const chunkDoc = {
            data: chunkData,
            index: i,
            uploaderId: currentUser.uid,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const chunkRef = await db.collection('fileChunks').add(chunkDoc);
        chunkIds.push(chunkRef.id);
        
        console.log(`✅ Chunk ${i + 1}/${totalChunks} uploaded`);
    }
    
    return {
        chunkIds: chunkIds,
        totalChunks: totalChunks,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
    };
}

async function downloadFileFromChunks(chunkIds, fileName, mimeType) {
    console.log(`📦 Downloading ${chunkIds.length} chunks...`);
    
    const chunks = [];
    
    // Download all chunks
    for (let i = 0; i < chunkIds.length; i++) {
        const chunkDoc = await db.collection('fileChunks').doc(chunkIds[i]).get();
        if (!chunkDoc.exists) {
            throw new Error(`Chunk ${i} not found`);
        }
        chunks.push(chunkDoc.data().data);
        console.log(`✅ Chunk ${i + 1}/${chunkIds.length} downloaded`);
    }
    
    // Reassemble
    const completeBase64 = chunks.join('');
    const base64WithPrefix = `data:${mimeType};base64,${completeBase64}`;
    
    return base64WithPrefix;
}

async function deleteFileChunks(chunkIds) {
    console.log(`🗑️ Deleting ${chunkIds.length} chunks...`);
    
    const batch = db.batch();
    
    chunkIds.forEach(chunkId => {
        const chunkRef = db.collection('fileChunks').doc(chunkId);
        batch.delete(chunkRef);
    });
    
    await batch.commit();
    console.log('✅ Chunks deleted');
}

// ═══════════════════════════════════════════════════════════════════
// SUBTITLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function loadSubtitles() {
    console.log('Loading subtitles from Firestore...');
    showLoading(true);
    
    if (unsubscribeSubtitles) {
        unsubscribeSubtitles();
    }
    
    unsubscribeSubtitles = db.collection('subtitles')
        .orderBy('uploadDate', 'desc')
        .onSnapshot(
            (snapshot) => {
                subtitles = [];
                snapshot.forEach((doc) => {
                    subtitles.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log('✅ Loaded', subtitles.length, 'subtitles');
                renderSubtitles();
                showLoading(false);
            },
            (error) => {
                console.error('❌ Error loading subtitles:', error);
                showNotification('Failed to load subtitles: ' + error.message, 'error');
                showLoading(false);
            }
        );
}

function renderSubtitles(filtered = null) {
    const grid = document.getElementById('subtitlesGrid');
    if (!grid) return;
    
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
                ${!currentUser ? 
                    '<p class="hint">Login to upload subtitles!</p>' : 
                    '<p class="hint">Be the first to upload!</p>'}
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(sub => createSubtitleCard(sub)).join('');
}

function createSubtitleCard(subtitle) {
    // Handle both chunked and direct image storage
    let imageUrl = 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%23222"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="16" text-anchor="middle" dy=".3em"%3E' + 
        encodeURIComponent(subtitle.title.substring(0, 20)) + '%3C/text%3E%3C/svg%3E';
    
    if (subtitle.imageData) {
        imageUrl = subtitle.imageData;
    } else if (subtitle.imageChunkIds && subtitle.imageChunkIds.length > 0) {
        // Image is chunked - will load on demand
        imageUrl = 'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" font-size="14" text-anchor="middle" dy=".3em"%3ELoading...%3C/text%3E%3C/svg%3E';
    }
    
    const uploadDate = subtitle.uploadDate?.toDate ? 
        subtitle.uploadDate.toDate().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }) : 'Recently';
    
    const canDelete = currentUser && currentUser.uid === subtitle.uploaderId;
    
    const fileSizeMB = subtitle.fileSize ? (subtitle.fileSize / 1024 / 1024).toFixed(2) : '?';
    
    return `
        <div class="subtitle-card" data-id="${subtitle.id}">
            <div class="subtitle-thumbnail">
                <img src="${imageUrl}" 
                     alt="${subtitle.title}" 
                     loading="lazy" 
                     onerror="this.src='data:image/svg+xml,%3Csvg width=\\'300\\' height=\\'200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23222\\'/%3E%3C/svg%3E'">
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
                    <span>📦 ${fileSizeMB} MB</span>
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
    console.log('Downloading subtitle:', id);
    
    const subtitle = subtitles.find(s => s.id === id);
    if (!subtitle) {
        showNotification('Subtitle not found', 'error');
        return;
    }
    
    try {
        showNotification('Preparing download...');
        
        let base64Data;
        
        // Check if subtitle is chunked or direct
        if (subtitle.fileChunkIds && subtitle.fileChunkIds.length > 0) {
            console.log('Downloading chunked file...');
            base64Data = await downloadFileFromChunks(
                subtitle.fileChunkIds, 
                subtitle.fileName, 
                subtitle.fileMimeType || 'text/plain'
            );
        } else if (subtitle.fileData) {
            console.log('Downloading direct file...');
            base64Data = subtitle.fileData;
        } else {
            throw new Error('Subtitle file not found');
        }
        
        // Increment download count
        await db.collection('subtitles').doc(id).update({
            downloads: firebase.firestore.FieldValue.increment(1)
        });
        
        // Create download
        const blob = base64ToBlob(base64Data, subtitle.fileMimeType || 'text/plain');
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = subtitle.fileName || `${subtitle.title}.srt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showNotification('Download started!');
        
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = '', 200);
        }
    } catch (error) {
        console.error('❌ Download error:', error);
        showNotification('Download failed: ' + error.message, 'error');
    }
}

async function deleteSubtitle(id) {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const subtitle = subtitles.find(s => s.id === id);
    if (!subtitle) return;
    
    if (subtitle.uploaderId !== currentUser.uid) {
        showNotification('You can only delete your own subtitles', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this subtitle?')) {
        return;
    }
    
    try {
        console.log('Deleting subtitle:', id);
        showNotification('Deleting...');
        
        // Delete file chunks if exists
        if (subtitle.fileChunkIds && subtitle.fileChunkIds.length > 0) {
            await deleteFileChunks(subtitle.fileChunkIds);
        }
        
        // Delete image chunks if exists
        if (subtitle.imageChunkIds && subtitle.imageChunkIds.length > 0) {
            await deleteFileChunks(subtitle.imageChunkIds);
        }
        
        // Delete main document
        await db.collection('subtitles').doc(id).delete();
        
        console.log('✅ Subtitle deleted');
        showNotification('Subtitle deleted successfully');
    } catch (error) {
        console.error('❌ Delete error:', error);
        showNotification('Failed to delete: ' + error.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════
// UPLOAD FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════

async function handleUploadSubmit(e) {
    e.preventDefault();
    
    console.log('═══════════════════════════════════════════');
    console.log('📤 UPLOAD PROCESS STARTED');
    console.log('═══════════════════════════════════════════');
    
    if (!currentUser) {
        console.error('❌ User not authenticated');
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
    
    console.log('📋 Form Data:');
    console.log('  Title:', title);
    console.log('  Subtitle size:', subtitleFile ? (subtitleFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A');
    console.log('  Image size:', imageFile ? (imageFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A');
    
    if (!title || !subtitleFile) {
        showNotification('Please provide title and subtitle file', 'error');
        return;
    }
    
    if (subtitleFile.size > MAX_SUBTITLE_SIZE) {
        const sizeMB = (subtitleFile.size / 1024 / 1024).toFixed(2);
        showNotification(`Subtitle file too large! Size: ${sizeMB}MB, Max: 5MB`, 'error');
        return;
    }
    
    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
        const sizeMB = (imageFile.size / 1024 / 1024).toFixed(2);
        showNotification(`Image too large! Size: ${sizeMB}MB, Max: 2MB`, 'error');
        return;
    }
    
    try {
        setUploadingState(true);
        
        // Upload subtitle file (chunked if > 200KB)
        let subtitleStorage;
        if (subtitleFile.size > CHUNK_SIZE) {
            console.log('📦 Uploading subtitle in chunks...');
            subtitleStorage = await uploadFileInChunks(subtitleFile, 'subtitle');
        } else {
            console.log('📄 Uploading subtitle directly...');
            const base64 = await fileToBase64(subtitleFile);
            subtitleStorage = {
                fileData: base64,
                fileName: subtitleFile.name,
                fileSize: subtitleFile.size,
                fileMimeType: subtitleFile.type
            };
        }
        
        // Upload image file (chunked if > 200KB)
        let imageStorage = null;
        if (imageFile) {
            if (imageFile.size > CHUNK_SIZE) {
                console.log('📦 Uploading image in chunks...');
                imageStorage = await uploadFileInChunks(imageFile, 'image');
            } else {
                console.log('🖼️ Uploading image directly...');
                const base64 = await fileToBase64(imageFile);
                imageStorage = {
                    imageData: base64
                };
            }
        }
        
        // Create main document
        const subtitleDoc = {
            title,
            description,
            country,
            year,
            genre,
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName || currentUser.email,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0,
            ...subtitleStorage,
            ...imageStorage
        };
        
        console.log('☁️ Saving to Firestore...');
        const docRef = await db.collection('subtitles').add(subtitleDoc);
        
        console.log('═══════════════════════════════════════════');
        console.log('✅ UPLOAD SUCCESS!');
        console.log('Document ID:', docRef.id);
        console.log('═══════════════════════════════════════════');
        
        showNotification('Subtitle uploaded successfully! 🎉');
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.log('═══════════════════════════════════════════');
        console.error('❌ UPLOAD FAILED');
        console.error('Error:', error);
        console.log('═══════════════════════════════════════════');
        
        let userMessage = 'Upload failed: ' + error.message;
        
        if (error.code === 'permission-denied') {
            userMessage = 'Permission denied! Check Firestore rules.';
        } else if (error.code === 'unauthenticated') {
            userMessage = 'Session expired. Please logout and login again.';
        }
        
        showNotification(userMessage, 'error');
        
    } finally {
        setUploadingState(false);
    }
}

// Helper functions
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
}

function setUploadingState(uploading) {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    submitBtn.disabled = uploading;
    if (btnText) btnText.style.display = uploading ? 'none' : 'inline';
    if (btnLoader) btnLoader.style.display = uploading ? 'inline' : 'none';
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH AND FILTER
// ═══════════════════════════════════════════════════════════════════

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const countryFilter = document.getElementById('countryFilter');
    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    
    if (!searchInput || !countryFilter || !yearFilter || !genreFilter) return;
    
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

// ═══════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    const grid = document.getElementById('subtitlesGrid');
    if (loader) loader.style.display = show ? 'flex' : 'none';
    if (grid) grid.style.display = show ? 'none' : 'grid';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════

function setupEventListeners() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (!currentUser) openModal('loginModal');
        });
    }
    
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const closeModalBtn = document.getElementById('closeModal');
    
    if (githubLoginBtn) githubLoginBtn.addEventListener('click', loginWithGitHub);
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', loginWithGoogle);
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => closeModal('loginModal'));
    
    const uploadFab = document.getElementById('uploadFab');
    if (uploadFab) {
        uploadFab.addEventListener('click', () => {
            if (currentUser) {
                openModal('uploadModal');
            } else {
                openModal('loginModal');
            }
        });
    }
    
    const closeUploadModalBtn = document.getElementById('closeUploadModal');
    const uploadForm = document.getElementById('uploadForm');
    
    if (closeUploadModalBtn) closeUploadModalBtn.addEventListener('click', () => closeModal('uploadModal'));
    if (uploadForm) uploadForm.addEventListener('submit', handleUploadSubmit);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    });
    
    setupSearchAndFilter();
    
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.focus();
        });
    }
    
    // Quick search tags
    document.querySelectorAll('.quick-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const searchTerm = tag.getAttribute('data-search');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = searchTerm;
                searchInput.dispatchEvent(new Event('input'));
                
                // Visual feedback
                document.querySelectorAll('.quick-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            }
        });
    });
}

window.downloadSubtitle = downloadSubtitle;
window.deleteSubtitle = deleteSubtitle;

console.log('✅ app.js loaded successfully (5MB chunked upload support + Modern UI)');

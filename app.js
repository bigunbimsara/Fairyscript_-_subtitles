// State
let currentUser = null;
let subtitles = [];
let unsubscribeSubtitles = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
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
            
            console.log('✅ User logged in:', currentUser.email);
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
            console.log('GitHub login successful');
            closeModal('loginModal');
            showNotification('Login successful! Welcome ' + result.user.displayName);
        })
        .catch((error) => {
            console.error('GitHub login error:', error);
            handleLoginError(error);
        });
}

function loginWithGoogle() {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            console.log('Google login successful');
            closeModal('loginModal');
            showNotification('Login successful! Welcome ' + result.user.displayName);
        })
        .catch((error) => {
            console.error('Google login error:', error);
            handleLoginError(error);
        });
}

function handleLoginError(error) {
    console.error('Login error details:', error.code, error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
        showNotification('Login cancelled', 'error');
    } else if (error.code === 'auth/unauthorized-domain') {
        showNotification('Domain not authorized. Add to Firebase: ' + window.location.hostname, 'error');
    } else if (error.code === 'auth/popup-blocked') {
        showNotification('Popup blocked. Please allow popups.', 'error');
    } else {
        showNotification('Login failed: ' + error.message, 'error');
    }
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
    console.log('Loading subtitles from Firestore...');
    
    if (unsubscribeSubtitles) {
        unsubscribeSubtitles();
    }
    
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
            
            console.log('✅ Loaded subtitles:', subtitles.length);
            renderSubtitles();
            showLoading(false);
        }, (error) => {
            console.error('❌ Error loading subtitles:', error);
            showNotification('Failed to load subtitles: ' + error.message, 'error');
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
    const imageUrl = subtitle.imageData || subtitle.imageUrl || 
        'data:image/svg+xml,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="200" fill="%23222"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-size="16" text-anchor="middle" dy=".3em"%3E' + 
        encodeURIComponent(subtitle.title.substring(0, 20)) + '%3C/text%3E%3C/svg%3E';
    
    const uploadDate = subtitle.uploadDate?.toDate ? 
        subtitle.uploadDate.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) :
        'Recently';
    
    const canDelete = currentUser && currentUser.uid === subtitle.uploaderId;
    
    return `
        <div class="subtitle-card" data-id="${subtitle.id}">
            <div class="subtitle-thumbnail">
                <img src="${imageUrl}" alt="${subtitle.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg width=\\'300\\' height=\\'200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Crect width=\\'300\\' height=\\'200\\' fill=\\'%23222\\'/%3E%3C/svg%3E'">
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
    if (!subtitle) {
        showNotification('Subtitle not found', 'error');
        return;
    }
    
    try {
        await db.collection('subtitles').doc(id).update({
            downloads: firebase.firestore.FieldValue.increment(1)
        });
        
        if (subtitle.fileData) {
            const blob = base64ToBlob(subtitle.fileData, 'text/plain');
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = subtitle.fileName || `${subtitle.title}.srt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            showNotification('Subtitle file not found', 'error');
            return;
        }
        
        showNotification('Download started!');
        
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = '', 200);
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
    
    if (subtitle.uploaderId !== currentUser.uid) {
        showNotification('You can only delete your own subtitles', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this subtitle?')) {
        return;
    }
    
    try {
        showNotification('Deleting...');
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
    
    console.log('═══════════════════════════════');
    console.log('🚀 UPLOAD STARTED');
    console.log('═══════════════════════════════');
    
    if (!currentUser) {
        console.error('❌ Not logged in!');
        showNotification('Please login first', 'error');
        openModal('loginModal');
        return;
    }
    
    console.log('✅ User:', currentUser.email, '(', currentUser.uid, ')');
    
    const title = document.getElementById('titleInput').value.trim();
    const description = document.getElementById('descriptionInput').value.trim();
    const subtitleFile = document.getElementById('subtitleFile').files[0];
    const imageFile = document.getElementById('imageFile').files[0];
    const country = document.getElementById('uploadCountry').value;
    const year = document.getElementById('uploadYear').value;
    const genre = document.getElementById('uploadGenre').value;
    
    console.log('📝 Form Data:');
    console.log('  - Title:', title);
    console.log('  - Description:', description || '(none)');
    console.log('  - Subtitle file:', subtitleFile ? subtitleFile.name : '(none)');
    console.log('  - Subtitle size:', subtitleFile ? (subtitleFile.size / 1024).toFixed(2) + ' KB' : 'N/A');
    console.log('  - Image file:', imageFile ? imageFile.name : '(none)');
    console.log('  - Image size:', imageFile ? (imageFile.size / 1024).toFixed(2) + ' KB' : 'N/A');
    
    if (!title || !subtitleFile) {
        console.error('❌ Missing required fields');
        showNotification('Please provide title and subtitle file', 'error');
        return;
    }
    
    // File size validation
    const maxSubtitleSize = 300 * 1024; // 300KB
    const maxImageSize = 200 * 1024; // 200KB
    
    if (subtitleFile.size > maxSubtitleSize) {
        const sizeMB = (subtitleFile.size / 1024).toFixed(2);
        console.error('❌ Subtitle file too large:', sizeMB, 'KB (max: 300KB)');
        showNotification(`Subtitle file too large! Current: ${sizeMB}KB, Max: 300KB. Please use a smaller file.`, 'error');
        return;
    }
    
    if (imageFile && imageFile.size > maxImageSize) {
        const sizeMB = (imageFile.size / 1024).toFixed(2);
        console.error('❌ Image file too large:', sizeMB, 'KB (max: 200KB)');
        showNotification(`Image too large! Current: ${sizeMB}KB, Max: 200KB. Please compress it.`, 'error');
        return;
    }
    
    try {
        setUploadingState(true);
        
        console.log('📖 Reading subtitle file...');
        const subtitleData = await fileToBase64(subtitleFile);
        console.log('✅ Subtitle read successfully, length:', subtitleData.length, 'chars');
        
        let imageData = null;
        if (imageFile) {
            console.log('📖 Reading image file...');
            imageData = await fileToBase64(imageFile);
            console.log('✅ Image read successfully, length:', imageData.length, 'chars');
        }
        
        const subtitleDoc = {
            title,
            description,
            fileData: subtitleData,
            fileName: subtitleFile.name,
            imageData: imageData,
            country,
            year,
            genre,
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName || currentUser.email,
            uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
            downloads: 0
        };
        
        // Check document size
        const docString = JSON.stringify(subtitleDoc);
        const docSize = docString.length;
        const docSizeKB = (docSize / 1024).toFixed(2);
        const maxSize = 1048576; // 1MB in bytes
        
        console.log('📦 Document size:', docSizeKB, 'KB (max: 1024KB)');
        
        if (docSize > maxSize) {
            throw new Error(`Document too large: ${docSizeKB}KB. Maximum is 1024KB. Please use smaller files.`);
        }
        
        console.log('☁️ Uploading to Firestore...');
        const docRef = await db.collection('subtitles').add(subtitleDoc);
        
        console.log('═══════════════════════════════');
        console.log('✅ SUCCESS!');
        console.log('Document ID:', docRef.id);
        console.log('═══════════════════════════════');
        
        showNotification('Subtitle uploaded successfully! 🎉');
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.log('═══════════════════════════════');
        console.error('❌ UPLOAD FAILED');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);
        console.log('═══════════════════════════════');
        
        // User-friendly error messages
        if (error.code === 'permission-denied') {
            showNotification('Permission denied! Please check Firestore rules in Firebase Console.', 'error');
            console.error('💡 Fix: Go to Firebase Console → Firestore → Rules');
        } else if (error.message.includes('too large') || error.message.includes('Document')) {
            showNotification(error.message, 'error');
            console.error('💡 Fix: Use smaller files (subtitle < 300KB, image < 200KB)');
        } else if (error.code === 'unauthenticated') {
            showNotification('Session expired. Please logout and login again.', 'error');
            console.error('💡 Fix: Logout → Login again');
        } else if (error.code === 'unavailable') {
            showNotification('Network error. Please check your internet connection.', 'error');
        } else {
            showNotification('Upload failed: ' + error.message, 'error');
        }
    } finally {
        setUploadingState(false);
    }
}

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

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', () => {
        if (!currentUser) {
            openModal('loginModal');
        }
    });
    
    document.getElementById('githubLoginBtn').addEventListener('click', loginWithGitHub);
    document.getElementById('googleLoginBtn').addEventListener('click', loginWithGoogle);
    document.getElementById('closeModal').addEventListener('click', () => closeModal('loginModal'));
    
    document.getElementById('uploadFab').addEventListener('click', () => {
        if (currentUser) {
            openModal('uploadModal');
        } else {
            openModal('loginModal');
        }
    });
    
    document.getElementById('closeUploadModal').addEventListener('click', () => closeModal('uploadModal'));
    document.getElementById('uploadForm').addEventListener('submit', handleUploadSubmit);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    setupSearchAndFilter();
    
    document.querySelector('.search-btn').addEventListener('click', () => {
        document.getElementById('searchInput').focus();
    });
}

window.downloadSubtitle = downloadSubtitle;
window.deleteSubtitle = deleteSubtitle;

console.log('✅ App.js loaded successfully');

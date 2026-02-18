/* ==========================================
   FAIRYSCRIPT - app.js
   Complete rewrite with all features
   ========================================== */

'use strict';

// ---- Wait for Firebase to load ----
window.addEventListener('DOMContentLoaded', () => {

  // Safety check: firebase-config.js must init Firebase
  if (typeof firebase === 'undefined') {
    showToast('Firebase config missing! Please add firebase-config.js', 'error');
    return;
  }

  let auth, db, storage, githubProvider;
  try {
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    githubProvider = new firebase.auth.GithubAuthProvider();
  } catch (e) {
    showToast('Firebase init error. Check firebase-config.js', 'error');
    console.error(e);
    return;
  }

  // ==========================================
  // STATE
  // ==========================================
  let currentUser = null;
  let allSubtitles = [];
  let filteredSubtitles = [];
  let searchQuery = '';
  let filterCountry = '';
  let filterYear = '';
  let filterGenre = '';
  let filterSort = 'newest';
  let showMyUploads = false;
  let unsubscribe = null;

  // ==========================================
  // DOM REFS
  // ==========================================
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const navLoginBtn = $('nav-login-btn');
  const navUploadBtn = $('nav-upload-btn');
  const userMenu = $('user-menu');
  const userAvatar = $('user-avatar');
  const dropdownName = $('dropdown-name');
  const dropdownEmail = $('dropdown-email');
  const heroSection = $('hero-section');
  const heroLoginBtn = $('hero-login-btn');
  const heroBrowseBtn = $('hero-browse-btn');
  const filterSection = $('filter-section');
  const subtitleGrid = $('subtitle-grid');
  const loadingState = $('loading-state');
  const emptyState = $('empty-state');
  const searchInput = $('search-input');
  const searchClear = $('search-clear');
  const totalCount = $('total-count');
  const resultsCount = $('results-count');
  const fabUpload = $('fab-upload');
  const myUploadsBtn = $('my-uploads-btn');
  const logoutBtn = $('logout-btn');
  const themeToggle = $('theme-toggle');
  const filterCountryEl = $('filter-country');
  const filterYearEl = $('filter-year');
  const filterGenreEl = $('filter-genre');
  const filterSortEl = $('filter-sort');
  const filterClearBtn = $('filter-clear-btn');

  // Upload form elements
  const uploadForm = $('upload-form');
  const upTitle = $('up-title');
  const upDesc = $('up-desc');
  const upSubtitle = $('up-subtitle');
  const upImage = $('up-image');
  const upCountry = $('up-country');
  const upYear = $('up-year');
  const upGenre = $('up-genre');
  const subtitleDrop = $('subtitle-drop');
  const subtitleSelected = $('subtitle-selected');
  const subtitleFilename = $('subtitle-filename');
  const removeSubtitle = $('remove-subtitle');
  const imageDrop = $('image-drop');
  const imagePreviewWrap = $('image-preview-wrap');
  const imagePreviewThumb = $('image-preview-thumb');
  const removeImage = $('remove-image');
  const submitBtn = $('submit-btn');
  const uploadProgress = $('upload-progress');
  const progressFill = $('progress-fill');
  const progressText = $('progress-text');

  // ==========================================
  // THEME TOGGLE
  // ==========================================
  const savedTheme = localStorage.getItem('fs-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fs-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    const moon = themeToggle.querySelector('.icon-moon');
    const sun = themeToggle.querySelector('.icon-sun');
    if (theme === 'dark') {
      moon.style.display = 'block';
      sun.style.display = 'none';
    } else {
      moon.style.display = 'none';
      sun.style.display = 'block';
    }
  }

  // ==========================================
  // MODAL HELPERS
  // ==========================================
  function openModal(id) {
    $(id).classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    $(id).classList.remove('active');
    document.body.style.overflow = '';
  }

  // Close buttons
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Click outside to close
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  // ==========================================
  // AUTH
  // ==========================================
  function login() {
    auth.signInWithPopup(githubProvider)
      .then(() => {
        closeModal('login-modal');
        showToast('✅ SucceSSfully logged in!', 'success');
      })
      .catch(err => {
        console.error(err);
        if (err.code === 'auth/popup-closed-by-user') return;
        showToast('Login failed: ' + err.message, 'error');
      });
  }

  navLoginBtn.addEventListener('click', () => openModal('login-modal'));
  heroLoginBtn.addEventListener('click', () => openModal('login-modal'));
  $('github-login-btn').addEventListener('click', login);

  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      showToast('Logged out successfully', 'info');
    });
  });

  heroBrowseBtn.addEventListener('click', () => {
    filterSection.scrollIntoView({ behavior: 'smooth' });
  });

  // Upload buttons
  [navUploadBtn, fabUpload].forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentUser) { openModal('login-modal'); return; }
      resetUploadForm();
      openModal('upload-modal');
    });
  });

  myUploadsBtn.addEventListener('click', () => {
    showMyUploads = !showMyUploads;
    myUploadsBtn.textContent = showMyUploads ? '📁 ඔක්කොම Subtitles' : '📁 මගේ Uploads';
    applyFilters();
  });

  // Auth state change
  auth.onAuthStateChanged(user => {
    currentUser = user;
    updateUIForAuth(user);
  });

  function updateUIForAuth(user) {
    if (user) {
      // Logged in state
      navLoginBtn.style.display = 'none';
      navUploadBtn.style.display = 'flex';
      userMenu.style.display = 'flex';
      fabUpload.style.display = 'flex';

      // Update avatar
      if (user.photoURL) {
        userAvatar.src = user.photoURL;
        userAvatar.style.display = 'block';
      }
      dropdownName.textContent = user.displayName || 'GitHub User';
      dropdownEmail.textContent = user.email || '';

      // Hide hero if user logged in, show filter/content prominently
      heroSection.style.display = 'none';
    } else {
      navLoginBtn.style.display = 'flex';
      navUploadBtn.style.display = 'none';
      userMenu.style.display = 'none';
      fabUpload.style.display = 'none';
      heroSection.style.display = 'flex';
      showMyUploads = false;
    }

    // Re-render cards to show/hide delete buttons
    renderCards(filteredSubtitles);
  }

  // ==========================================
  // FIRESTORE: LOAD SUBTITLES
  // ==========================================
  function startListening() {
    if (unsubscribe) unsubscribe();

    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    subtitleGrid.innerHTML = '';

    unsubscribe = db.collection('subtitles')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        allSubtitles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Update total count stat
        totalCount.textContent = allSubtitles.length;

        loadingState.style.display = 'none';
        applyFilters();
      }, err => {
        console.error(err);
        loadingState.style.display = 'none';
        showToast('Failed to load subtitles: ' + err.message, 'error');
      });
  }

  // Start loading on page init
  startListening();

  // ==========================================
  // FILTERING & SEARCH
  // ==========================================
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClear.style.display = searchQuery ? 'block' : 'none';
    applyFilters();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.style.display = 'none';
    applyFilters();
  });

  filterCountryEl.addEventListener('change', e => { filterCountry = e.target.value; applyFilters(); });
  filterYearEl.addEventListener('change', e => { filterYear = e.target.value; applyFilters(); });
  filterGenreEl.addEventListener('change', e => { filterGenre = e.target.value; applyFilters(); });
  filterSortEl.addEventListener('change', e => { filterSort = e.target.value; applyFilters(); });

  filterClearBtn.addEventListener('click', () => {
    filterCountryEl.value = '';
    filterYearEl.value = '';
    filterGenreEl.value = '';
    filterSortEl.value = 'newest';
    filterCountry = filterYear = filterGenre = '';
    filterSort = 'newest';
    searchInput.value = '';
    searchQuery = '';
    searchClear.style.display = 'none';
    applyFilters();
  });

  function applyFilters() {
    let result = [...allSubtitles];

    if (searchQuery) {
      result = result.filter(s =>
        (s.title || '').toLowerCase().includes(searchQuery) ||
        (s.description || '').toLowerCase().includes(searchQuery)
      );
    }

    if (filterCountry) result = result.filter(s => s.country === filterCountry);
    if (filterYear) result = result.filter(s => String(s.year) === String(filterYear));
    if (filterGenre) result = result.filter(s => s.genre === filterGenre);
    if (showMyUploads && currentUser) {
      result = result.filter(s => s.uploaderId === currentUser.uid);
    }

    // Sort
    switch (filterSort) {
      case 'newest': result.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)); break;
      case 'oldest': result.sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0)); break;
      case 'downloads': result.sort((a,b) => (b.downloadCount||0) - (a.downloadCount||0)); break;
      case 'az': result.sort((a,b) => (a.title||'').localeCompare(b.title||'')); break;
    }

    filteredSubtitles = result;
    resultsCount.textContent = result.length > 0 ? `${result.length} result${result.length !== 1 ? 's' : ''}` : '';
    renderCards(result);
  }

  // ==========================================
  // RENDER CARDS
  // ==========================================
  function renderCards(subs) {
    subtitleGrid.innerHTML = '';

    if (subs.length === 0) {
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';

    subs.forEach((sub, i) => {
      const card = createCard(sub, i);
      subtitleGrid.appendChild(card);
    });
  }

  function createCard(sub, delay) {
    const card = document.createElement('div');
    card.className = 'sub-card';
    if (currentUser && sub.uploaderId === currentUser.uid) card.classList.add('owned');
    card.style.animationDelay = `${Math.min(delay * 50, 400)}ms`;

    const isOwner = currentUser && sub.uploaderId === currentUser.uid;
    const countryFlag = getFlag(sub.country);

    card.innerHTML = `
      <div class="card-thumb">
        ${sub.imageUrl
          ? `<img src="${escapeHtml(sub.imageUrl)}" alt="${escapeHtml(sub.title)}" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
          : ''}
        <div class="card-thumb-placeholder" style="${sub.imageUrl ? 'display:none' : ''}">🎬</div>
        ${sub.videoFormat ? `<div class="card-format-badge">${escapeHtml(sub.videoFormat)}</div>` : ''}
      </div>
      <div class="card-body">
        ${sub.uploaderAvatar ? `
        <div class="card-uploader">
          <img src="${escapeHtml(sub.uploaderAvatar)}" alt="uploader" onerror="this.style.display='none'" />
          <span>${escapeHtml(sub.uploaderName || 'Anonymous')}</span>
        </div>` : ''}
        <div class="card-title">${escapeHtml(sub.title)}</div>
        <div class="card-meta">
          ${sub.country ? `<span class="meta-tag country-tag">${countryFlag} ${escapeHtml(sub.country)}</span>` : ''}
          ${sub.year ? `<span class="meta-tag">${escapeHtml(String(sub.year))}</span>` : ''}
          ${sub.genre ? `<span class="meta-tag">${escapeHtml(sub.genre)}</span>` : ''}
        </div>
        <div class="card-footer">
          <span class="card-downloads">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${sub.downloadCount || 0}
          </span>
          <div class="card-actions">
            <button class="btn-download" data-id="${sub.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            ${isOwner ? `<button class="btn-delete" data-id="${sub.id}" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>` : ''}
          </div>
        </div>
      </div>
    `;

    // Card click => detail modal
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-download') || e.target.closest('.btn-delete')) return;
      showDetail(sub);
    });

    // Download button
    const dlBtn = card.querySelector('.btn-download');
    if (dlBtn) {
      dlBtn.addEventListener('click', e => {
        e.stopPropagation();
        downloadSubtitle(sub);
      });
    }

    // Delete button
    const delBtn = card.querySelector('.btn-delete');
    if (delBtn) {
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        deleteSubtitle(sub);
      });
    }

    return card;
  }

  // ==========================================
  // DETAIL MODAL
  // ==========================================
  function showDetail(sub) {
    const countryFlag = getFlag(sub.country);
    const dateStr = sub.createdAt?.toDate
      ? sub.createdAt.toDate().toLocaleDateString('si-LK')
      : 'Unknown';

    $('detail-content').innerHTML = `
      <div class="detail-thumb">
        ${sub.imageUrl
          ? `<img src="${escapeHtml(sub.imageUrl)}" alt="${escapeHtml(sub.title)}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
             <div class="detail-placeholder" style="display:none">🎬</div>`
          : `<div class="detail-placeholder">🎬</div>`}
      </div>
      <h2 class="detail-title">${escapeHtml(sub.title)}</h2>
      <div class="detail-meta-row">
        ${sub.country ? `<span class="meta-tag country-tag">${countryFlag} ${escapeHtml(sub.country)}</span>` : ''}
        ${sub.year ? `<span class="meta-tag">${escapeHtml(String(sub.year))}</span>` : ''}
        ${sub.genre ? `<span class="meta-tag">${escapeHtml(sub.genre)}</span>` : ''}
        ${sub.videoFormat ? `<span class="meta-tag">${escapeHtml(sub.videoFormat)}</span>` : ''}
      </div>
      ${sub.description ? `<p class="detail-description">${escapeHtml(sub.description)}</p>` : ''}
      <div class="detail-info-grid">
        <div class="detail-info-item">
          <div class="detail-info-label">Downloads</div>
          <div class="detail-info-value">📥 ${sub.downloadCount || 0}</div>
        </div>
        <div class="detail-info-item">
          <div class="detail-info-label">Uploaded</div>
          <div class="detail-info-value">📅 ${dateStr}</div>
        </div>
        <div class="detail-info-item">
          <div class="detail-info-label">Uploaded by</div>
          <div class="detail-info-value">👤 ${escapeHtml(sub.uploaderName || 'Anonymous')}</div>
        </div>
        <div class="detail-info-item">
          <div class="detail-info-label">Format</div>
          <div class="detail-info-value">📁 ${escapeHtml(sub.fileType || 'Subtitle')}</div>
        </div>
      </div>
      <div class="detail-btn-row">
        <button class="btn-detail-download" onclick="window.downloadSubtitleById('${sub.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Subtitle
        </button>
      </div>
    `;

    // Store for global access
    window._detailSubCache = window._detailSubCache || {};
    window._detailSubCache[sub.id] = sub;

    openModal('detail-modal');
  }

  // Global accessor for inline onclick in detail modal
  window.downloadSubtitleById = function(id) {
    const sub = (window._detailSubCache || {})[id];
    if (sub) downloadSubtitle(sub);
  };

  // ==========================================
  // DOWNLOAD
  // ==========================================
  function downloadSubtitle(sub) {
    if (!sub.subtitleUrl) {
      showToast('Download URL not found!', 'error');
      return;
    }

    // Open download in new tab
    window.open(sub.subtitleUrl, '_blank');

    // Increment download count
    db.collection('subtitles').doc(sub.id).update({
      downloadCount: firebase.firestore.FieldValue.increment(1)
    }).catch(e => console.warn('Count update failed:', e));

    showToast('⬇️ Download started!', 'success');
  }

  // ==========================================
  // DELETE
  // ==========================================
  async function deleteSubtitle(sub) {
    if (!currentUser || sub.uploaderId !== currentUser.uid) {
      showToast('You can only delete your own subtitles', 'error');
      return;
    }

    if (!confirm(`Delete "${sub.title}"? This cannot be undone.`)) return;

    try {
      // Delete files from storage
      if (sub.subtitleUrl) {
        try {
          const ref = storage.refFromURL(sub.subtitleUrl);
          await ref.delete();
        } catch (e) { console.warn('Subtitle file delete failed:', e); }
      }

      if (sub.imageUrl) {
        try {
          const ref = storage.refFromURL(sub.imageUrl);
          await ref.delete();
        } catch (e) { console.warn('Image file delete failed:', e); }
      }

      // Delete Firestore doc
      await db.collection('subtitles').doc(sub.id).delete();
      showToast('✅ Subtitle deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  // ==========================================
  // UPLOAD FORM
  // ==========================================

  // File drop zone - subtitle
  subtitleDrop.addEventListener('dragover', e => {
    e.preventDefault();
    subtitleDrop.classList.add('drag-over');
  });
  subtitleDrop.addEventListener('dragleave', () => subtitleDrop.classList.remove('drag-over'));
  subtitleDrop.addEventListener('drop', e => {
    e.preventDefault();
    subtitleDrop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleSubtitleFile(file);
  });

  upSubtitle.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleSubtitleFile(file);
  });

  function handleSubtitleFile(file) {
    const allowed = ['.srt','.ass','.ssa','.sub','.vtt'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      showToast(`❌ Invalid file type! Allowed: ${allowed.join(', ')}`, 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Subtitle file too large! Max 5MB', 'error');
      return;
    }
    subtitleDrop.style.display = 'none';
    subtitleSelected.style.display = 'flex';
    subtitleFilename.textContent = file.name;
    // Attach file to input
    const dt = new DataTransfer();
    dt.items.add(file);
    upSubtitle.files = dt.files;
  }

  removeSubtitle.addEventListener('click', () => {
    upSubtitle.value = '';
    subtitleDrop.style.display = 'flex';
    subtitleSelected.style.display = 'none';
  });

  // File drop zone - image
  imageDrop.addEventListener('dragover', e => { e.preventDefault(); imageDrop.classList.add('drag-over'); });
  imageDrop.addEventListener('dragleave', () => imageDrop.classList.remove('drag-over'));
  imageDrop.addEventListener('drop', e => {
    e.preventDefault();
    imageDrop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  upImage.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('❌ Please select a valid image file', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('❌ Image too large! Max 2MB', 'error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = e => {
      imagePreviewThumb.src = e.target.result;
      imagePreviewWrap.style.display = 'block';
      imageDrop.style.display = 'none';
    };
    reader.readAsDataURL(file);

    const dt = new DataTransfer();
    dt.items.add(file);
    upImage.files = dt.files;
  }

  removeImage.addEventListener('click', () => {
    upImage.value = '';
    imagePreviewWrap.style.display = 'none';
    imageDrop.style.display = 'flex';
    imagePreviewThumb.src = '';
  });

  // Submit upload
  uploadForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!currentUser) {
      showToast('Please login first!', 'error');
      return;
    }

    const title = upTitle.value.trim();
    if (!title) { showToast('Title required!', 'error'); upTitle.focus(); return; }

    const subtitleFile = upSubtitle.files[0];
    if (!subtitleFile) { showToast('Please select a subtitle file!', 'error'); return; }

    // Get video format
    const formatRadio = document.querySelector('input[name="video-format"]:checked');
    const videoFormat = formatRadio ? formatRadio.value : 'All';

    submitBtn.disabled = true;
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading... 0%';

    try {
      const uid = currentUser.uid;
      const timestamp = Date.now();

      let subtitleUrl = null;
      let imageUrl = null;

      // Upload subtitle file
      const subtitleRef = storage.ref(`subtitles/${uid}/${timestamp}_${subtitleFile.name}`);
      const subtitleUpload = subtitleRef.put(subtitleFile);

      subtitleUpload.on('state_changed', snapshot => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 70);
        progressFill.style.width = pct + '%';
        progressText.textContent = `Uploading subtitle... ${pct}%`;
      });

      await subtitleUpload;
      subtitleUrl = await subtitleRef.getDownloadURL();
      progressFill.style.width = '75%';

      // Upload image if provided
      const imageFile = upImage.files[0];
      if (imageFile) {
        const imgRef = storage.ref(`images/${uid}/${timestamp}_${imageFile.name}`);
        await imgRef.put(imageFile);
        imageUrl = await imgRef.getDownloadURL();
        progressFill.style.width = '90%';
        progressText.textContent = 'Saving metadata...';
      }

      // Save to Firestore
      const docData = {
        title,
        description: upDesc.value.trim() || null,
        subtitleUrl,
        imageUrl: imageUrl || null,
        videoFormat,
        country: upCountry.value || null,
        year: upYear.value ? parseInt(upYear.value) : null,
        genre: upGenre.value || null,
        fileType: subtitleFile.name.split('.').pop().toUpperCase(),
        uploaderId: uid,
        uploaderName: currentUser.displayName || 'Anonymous',
        uploaderAvatar: currentUser.photoURL || null,
        downloadCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Remove null values
      Object.keys(docData).forEach(k => docData[k] === null && delete docData[k]);

      await db.collection('subtitles').add(docData);

      progressFill.style.width = '100%';
      progressText.textContent = 'Done!';

      showToast('✅ Subtitle uploaded successfully!', 'success');

      setTimeout(() => {
        closeModal('upload-modal');
        resetUploadForm();
      }, 800);

    } catch (err) {
      console.error(err);
      showToast('Upload failed: ' + err.message, 'error');
      submitBtn.disabled = false;
      uploadProgress.style.display = 'none';
    }
  });

  function resetUploadForm() {
    uploadForm.reset();
    upSubtitle.value = '';
    upImage.value = '';
    subtitleDrop.style.display = 'flex';
    subtitleSelected.style.display = 'none';
    imageDrop.style.display = 'flex';
    imagePreviewWrap.style.display = 'none';
    imagePreviewThumb.src = '';
    submitBtn.disabled = false;
    uploadProgress.style.display = 'none';
    progressFill.style.width = '0%';
    // Reset format radio to "All"
    const allRadio = document.querySelector('input[name="video-format"][value="All"]');
    if (allRadio) allRadio.checked = true;
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  window.showToast = showToast;

  function showToast(message, type = 'info') {
    const container = $('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Auto dismiss after 3.5s
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ==========================================
  // HELPERS
  // ==========================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getFlag(country) {
    const flags = {
      Korea: '🇰🇷', Japan: '🇯🇵', China: '🇨🇳',
      Thailand: '🇹🇭', USA: '🇺🇸', UK: '🇬🇧',
      India: '🇮🇳'
    };
    return flags[country] || '🌍';
  }

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  document.addEventListener('keydown', e => {
    // Escape closes topmost modal
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal-overlay.active');
      if (open) closeModal(open.id);
    }

    // / focuses search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // ==========================================
  // SEARCH IN NAV for mobile (after load)
  // ==========================================
  // Show search in filter section on mobile
  const mobileSearchHTML = `
    <div class="search-bar" style="margin-bottom:10px; display:none" id="mobile-search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="සබ්ටයිටල් හොයන්න..." id="mobile-search-input" />
    </div>
  `;
  filterSection.insertAdjacentHTML('afterbegin', mobileSearchHTML);

  const mobileSearchInput = $('mobile-search-input');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      // sync with desktop search
      searchInput.value = e.target.value;
      applyFilters();
    });
  }

  function checkMobileSearch() {
    const mobileBar = $('mobile-search-bar');
    if (!mobileBar) return;
    if (window.innerWidth <= 900) {
      mobileBar.style.display = 'flex';
    } else {
      mobileBar.style.display = 'none';
    }
  }

  checkMobileSearch();
  window.addEventListener('resize', checkMobileSearch);

}); // end DOMContentLoaded

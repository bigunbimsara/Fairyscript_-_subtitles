# ⚡ QUICK START - ඉක්මන් ආරම්භය

5 Minutes එකට ඔයාගේ Subtitle Site එක Live කරන්න!

## 🎯 What You Need (අවශ්‍ය දේවල්)

1. ✅ GitHub account එකක්
2. ✅ Google account එකක් (Firebase වලට)
3. ✅ මේ files ඔක්කොම

## 🚀 5-Minute Setup

### 1️⃣ Firebase Setup (2 minutes)

**A) Create Project:**
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: `fairyscript-subs`
4. Click "Continue" → "Continue" → "Create project"

**B) Authentication:**
1. Click "Authentication" → "Get started"
2. Click "GitHub" → Toggle "Enable" → **SAVE FIRST!**

**C) GitHub OAuth:**
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill:
   - Name: `Fairyscript`
   - URL: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
   - Callback: (Copy from Firebase GitHub settings)
4. Copy Client ID & Secret
5. Paste in Firebase GitHub settings → Save

**D) Firestore:**
1. Click "Firestore Database" → "Create database"
2. Choose "Test mode" → Pick location → "Enable"
3. Click "Rules" → Paste from `firestore.rules` file → "Publish"

**E) Storage:**
1. Click "Storage" → "Get started"
2. Choose "Test mode" → Same location → "Done"
3. Click "Rules" → Paste from `storage.rules` file → "Publish"

**F) Get Config:**
1. Click Settings ⚙️ → "Project settings"
2. Scroll to "Your apps" → Click Web icon `</>`
3. Register app
4. Copy the `firebaseConfig` object

### 2️⃣ Update Config (30 seconds)

Open `firebase-config.js` and replace:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_COPIED_API_KEY",
    authDomain: "YOUR_COPIED_AUTH_DOMAIN",
    projectId: "YOUR_COPIED_PROJECT_ID",
    storageBucket: "YOUR_COPIED_STORAGE_BUCKET",
    messagingSenderId: "YOUR_COPIED_SENDER_ID",
    appId: "YOUR_COPIED_APP_ID"
};
```

### 3️⃣ Deploy to GitHub (2 minutes)

**A) Create Repository:**
1. Go to: https://github.com/new
2. Name: `Fairyscript_-_subtitles`
3. **Public** ✓
4. Create repository

**B) Upload Files:**
1. Click "uploading an existing file"
2. Drag all these files:
   - index.html
   - styles.css
   - app.js
   - firebase-config.js
   - README.md
   - logo.jpg (your logo)
3. Commit changes

**C) Enable Pages:**
1. Settings → Pages
2. Source: `main` branch, `/ (root)` folder
3. Save

### 4️⃣ Wait & Test (30 seconds)

1. Wait 2-3 minutes
2. Visit: `https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/`
3. Click "Login" → Test GitHub login
4. Try uploading a subtitle!

## ✅ Done! 🎉

Your site is now **LIVE**!

## 📝 Quick Test Checklist

- [ ] Site loads
- [ ] Can login with GitHub
- [ ] Upload button appears after login
- [ ] Can upload a test subtitle
- [ ] Subtitle appears in list
- [ ] Can download the subtitle
- [ ] Search works
- [ ] Filters work

## 🆘 Problems?

### Can't login?
→ Check GitHub OAuth callback URL
→ Check Firebase authorized domains

### Can't upload?
→ Check browser console (F12)
→ Check Firebase rules
→ Check file size (Subtitle: 5MB, Image: 2MB)

### Subtitles don't show?
→ Check Firestore rules
→ Check browser console
→ Refresh page

## 📚 Full Documentation

For detailed guides:
- `README.md` - Complete documentation
- `SETUP-CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT.md` - Deployment guide

## 🎬 Usage

### To Upload:
1. Login with GitHub
2. Click the red "+" button (bottom right)
3. Fill in title and select subtitle file
4. Optional: Add image, country, year, genre
5. Click "Upload Subtitle"

### To Download:
1. Browse or search for subtitle
2. Click the download button
3. File downloads automatically!

### To Manage:
- Hover over your uploaded subtitles
- Click 🗑️ to delete

## 🔧 Customize

### Change Colors:
Edit `styles.css`:
```css
:root {
    --accent-red: #ff4444;    /* Your color */
    --accent-orange: #FFA500; /* Your color */
}
```

### Change Logo:
Replace `logo.jpg` with your image (400x400px recommended)

### Change Title:
Edit `index.html`:
```html
<title>Your Title</title>
<h1>Your Site Name</h1>
```

## 🎯 What's Next?

1. Share your site with friends!
2. Upload some subtitles
3. Customize the design
4. Add more features (see README.md for ideas)

---

**Enjoy your subtitle platform! 🎬🚀**

Need help? Check the full `README.md` or open a GitHub issue!

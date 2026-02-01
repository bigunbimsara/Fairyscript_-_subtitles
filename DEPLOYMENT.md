# Deployment Guide - GitHub Pages

මේ guide එකෙන් ඔයාගේ Fairyscript site එක GitHub Pages එකට deploy කරන හැටි බලාගන්න.

## Method 1: GitHub Web Interface (ලේසිම ක්‍රමය)

### Step 1: Repository එකක් හදන්න
1. GitHub.com එකට log in වෙන්න
2. "+" button → "New repository"
3. Repository name: `Fairyscript_-_subtitles` (හෝ ඔයාට කැමති නමක්)
4. **Public** එක select කරන්න (very important!)
5. "Create repository" click කරන්න

### Step 2: Files Upload කරන්න
1. "uploading an existing file" link එක click කරන්න
2. මේ files drag කරන්න:
   - index.html
   - styles.css
   - app.js
   - firebase-config.js
   - README.md
   - logo.jpg
   - firestore.rules
   - storage.rules
   - SETUP-CHECKLIST.md
   - .gitignore

3. "Commit changes" click කරන්න

### Step 3: GitHub Pages Enable කරන්න
1. Repository එකේ "Settings" tab එකට යන්න
2. වම් පසින් "Pages" click කරන්න
3. "Source" section එකේ:
   - Branch: `main` (හෝ `master`) select කරන්න
   - Folder: `/ (root)` select කරන්න
4. "Save" button එක click කරන්න

### Step 4: Wait & Visit
1. මිනිත්තු 2-5ක් wait කරන්න
2. Page එක refresh කරන්න
3. ඉහළින් green box එකක් එයි link එකක් එක්ක:
   `Your site is live at https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/`
4. ඒ link එක click කරන්න!

## Method 2: Git Command Line (Advanced)

### Prerequisites:
- Git installed
- GitHub account එක setup කරලා
- SSH key හෝ Personal Access Token setup කරලා

### Commands:

```bash
# 1. Initialize Git
cd /path/to/your/project
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit - Fairyscript subtitle platform"

# 4. Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/Fairyscript_-_subtitles.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

### Enable GitHub Pages:
Settings → Pages → Source: main branch → Save

## Post-Deployment Checklist

Deploy කරලා ඉවර වෙලා පස්සේ:

### 1. Test කරන්න
- [ ] Site එක load වෙනවද
- [ ] Login button එක work කරනවද
- [ ] Firebase එක connect වෙනවද

### 2. GitHub OAuth Update කරන්න
- [ ] GitHub Developer Settings එකට යන්න
- [ ] ඔයාගේ OAuth App එක open කරන්න
- [ ] Homepage URL update කරන්න:
  ```
  https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/
  ```
- [ ] Save changes

### 3. Firebase එකත් Update කරන්න
- [ ] Firebase Console → Authentication → Sign-in method → GitHub
- [ ] Authorized domains එකේ ඔයාගේ GitHub Pages domain එක තියෙනවද බලන්න:
  ```
  YOUR-USERNAME.github.io
  ```
- [ ] නැත්නම් add කරන්න

### 4. Final Testing
- [ ] Login try කරන්න
- [ ] Upload try කරන්න
- [ ] Download try කරන්න
- [ ] Search & filter try කරන්න
- [ ] Mobile එකෙන් test කරන්න

## Updating Your Site (Site එක Update කරන්නේ කොහොමද)

### Using GitHub Web Interface:
1. Repository එකට යන්න
2. Edit කරන්න ඕන file එක click කරන්න
3. Pencil icon (Edit) click කරන්න
4. Changes කරන්න
5. "Commit changes" click කරන්න
6. පස්සේ මිනිත්තුවක් ඉන්න, live site එකත් update වෙයි

### Using Git:
```bash
# Edit your files locally
# Then:
git add .
git commit -m "Description of changes"
git push
```

## Custom Domain (Optional)

ඔයාගේම domain එකක් use කරන්න ඕන නම්:

### 1. Domain Provider Settings:
Add CNAME record:
```
www  →  YOUR-USERNAME.github.io
```

### 2. GitHub Settings:
1. Settings → Pages
2. "Custom domain" field එකේ ඔයාගේ domain එක type කරන්න
3. "Save" click කරන්න
4. "Enforce HTTPS" enable කරන්න

## Troubleshooting

### Issue: 404 Error
**Cause:** Pages enable කරලා නැහැ හෝ වැඩිම time යයි
**Solution:** 
- Settings → Pages check කරන්න
- මිනිත්තු 5-10ක් ඉන්න
- Repository public කරලා තියෙනවද බලන්න

### Issue: Styles Load වෙන්නේ නැහැ
**Cause:** File paths වැරදියි
**Solution:**
- index.html එකේ file paths relative paths ද බලන්න
- `styles.css` not `/styles.css` or `./styles.css`

### Issue: Firebase Connect වෙන්නේ නැහැ
**Cause:** firebase-config.js නිවැරදි නැහැ
**Solution:**
- firebase-config.js file එකේ config එක නිවැරදි ද බලන්න
- Browser console එකේ errors බලන්න

### Issue: Login Redirect වෙන්නේ නැහැ
**Cause:** OAuth callback URL වැරදියි
**Solution:**
- GitHub OAuth App settings එකේ callback URL එක:
  `https://YOUR-PROJECT.firebaseapp.com/__/auth/handler`
- Firebase එකේ authorized domains එකේ ඔයාගේ GitHub Pages domain එක add කරලා තියෙනවද බලන්න

## Performance Tips

### Optimize Images:
```bash
# Use online tools or ImageMagick:
convert logo.jpg -quality 85 -resize 400x400 logo_optimized.jpg
```

### Enable Caching:
GitHub Pages automatically caches files, but ඔයාට manual control ඕන නම් `_headers` file එකක් use කරන්න පුළුවන්.

### Monitor Performance:
- Chrome DevTools → Lighthouse
- Check load times
- Optimize based on suggestions

## Security Best Practices

1. **කවදාවත්** API keys commit නොකරන්න public repository එකට
2. Firebase rules properly configure කරලා තියෙනවද regular check කරන්න
3. Regular dependency updates
4. Enable GitHub security alerts

## Backup Strategy

Regular backups:
1. Firebase Console → Firestore → Export data
2. Storage → Download important files
3. Git repository already backs up code

## Going Live! 🚀

Everything test කරලා okay නම්:

1. ✅ Share ඔයාගේ site link එක social media එකේ
2. ✅ README එකේ link එක update කරන්න
3. ✅ Friends ට share කරන්න
4. ✅ Subtitle community එකට announce කරන්න

---

**Congratulations! 🎉**

ඔයාගේ Fairyscript subtitle platform එක දැන් live!

Site URL:
```
https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/
```

---

**Happy Deployment! 🚀**

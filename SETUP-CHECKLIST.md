# Setup Checklist - ඉක්මන් Setup Guide

මේ checklist එක follow කරලා ඔයාගේ site එක setup කරගන්න!

## ✅ Step-by-Step Checklist

### 1. Firebase Project Setup
- [ ] Firebase Console එකට login වෙලා
- [ ] New project එකක් create කරලා
- [ ] Project නම තීරණය කරලා (උදා: fairyscript-subtitles)

### 2. Authentication Setup
- [ ] Firebase Console → Authentication → Get Started
- [ ] Sign-in method → GitHub → Enable කරලා
- [ ] **පලමුවෙන්ම Save කරන්න!** (important!)
- [ ] GitHub.com → Settings → Developer settings → OAuth Apps
- [ ] New OAuth App create කරලා
- [ ] Application name: "Fairyscript Subtitles"
- [ ] Homepage URL: `https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/`
- [ ] Callback URL: Firebase එකෙන් copy කරගත්ත එක paste කරන්න
- [ ] Client ID සහ Client Secret copy කරගන්න
- [ ] Firebase එකට ආපහු ගිහින් GitHub settings එකට paste කරන්න
- [ ] Save කරන්න

### 3. Firestore Database Setup
- [ ] Firebase Console → Firestore Database → Create database
- [ ] Test mode තෝරන්න
- [ ] Location: asia-south1 (හෝ ඔයාට කැමති එකක්)
- [ ] Enable click කරන්න
- [ ] Rules tab එකට යන්න
- [ ] `firestore.rules` file එකේ තියෙන rules copy කරලා paste කරන්න
- [ ] Publish කරන්න

### 4. Storage Setup
- [ ] Firebase Console → Storage → Get Started
- [ ] Test mode තෝරන්න
- [ ] Same location තෝරන්න (Firestore එකේ use කරපු එක)
- [ ] Done click කරන්න
- [ ] Rules tab එකට යන්න
- [ ] `storage.rules` file එකේ තියෙන rules copy කරලා paste කරන්න
- [ ] Publish කරන්න

### 5. Firebase Config
- [ ] Firebase Console → Project Settings (⚙️)
- [ ] Scroll down to "Your apps"
- [ ] Web app එකක් add කරන්න (`</>` icon)
- [ ] App nickname දෙන්න
- [ ] firebaseConfig object එක copy කරන්න
- [ ] `firebase-config.js` file එක open කරන්න
- [ ] YOUR_API_KEY, YOUR_PROJECT_ID වගේ placeholders replace කරන්න

### 6. Files Organize කරන්න
- [ ] මේ files ඔක්කොම එකම folder එකක තියන්න:
  - index.html
  - styles.css
  - app.js
  - firebase-config.js
  - README.md
  - logo.jpg (ඔයාගේ logo එක)

### 7. GitHub Repository Setup
- [ ] GitHub එකේ new repository එකක් හදන්න
- [ ] Name: "Fairyscript_-_subtitles" (හෝ ඔයාට කැමති නමක්)
- [ ] Public repository එකක් හදන්න
- [ ] ඔයාගේ files upload කරන්න

### 8. GitHub Pages Enable කරන්න
- [ ] Repository Settings එකට යන්න
- [ ] Pages section එක හොයාගන්න
- [ ] Source: "Deploy from a branch"
- [ ] Branch: main (හෝ master)
- [ ] Folder: / (root)
- [ ] Save click කරන්න
- [ ] මිනිත්තු 2-5ක් wait කරන්න

### 9. Testing කරන්න
- [ ] ඔයාගේ GitHub Pages URL එකට යන්න
- [ ] Site එක load වෙනවද බලන්න
- [ ] Login button එක click කරලා GitHub login try කරන්න
- [ ] Login successful වෙනවද බලන්න
- [ ] Upload button එක පෙන්නන්නද බලන්න
- [ ] Test subtitle එකක් upload කරලා බලන්න
- [ ] Upload successful වෙනවද බලන්න
- [ ] Subtitle එක පෙන්නන්නද බලන්න
- [ ] Download button එක work කරනවද බලන්න

### 10. Final Checks
- [ ] Browser console එකේ errors නැද්ද බලන්න (F12)
- [ ] Mobile එකෙන් test කරලා බලන්න
- [ ] Different browsers වලින් test කරලා බලන්න
- [ ] Search function එක work කරනවද බලන්න
- [ ] Filters work කරනවද බලන්න

## 🎉 Setup Complete!

ඔයාගේ site එක live! දැන් ඔයාට:
- GitHub එකෙන් login වෙන්න පුළුවන්
- Subtitles upload කරන්න පුළුවන්
- අනිත් අයටත් login වෙලා upload කරන්න පුළුවන්
- කවුරු හරි කවදා හරි upload කරපු subtitles download කරන්න පුළුවන්

## 🔧 Common Issues and Solutions

### Issue: Login වෙන්න බැහැ
**Solution:**
1. GitHub OAuth callback URL එක නිවැරදි ද බලන්න
2. Firebase GitHub provider enable කරලා තියෙනවද බලන්න
3. Client ID & Secret නිවැරදි ද බලන්න
4. Browser console එකේ error messages බලන්න

### Issue: Upload වෙන්නේ නැහැ
**Solution:**
1. Firebase Storage rules නිවැරදි ද බලන්න
2. Firestore rules නිවැරදි ද බලන්න
3. File size limits exceed වෙලා නැද්ද බලන්න
4. Browser console එකේ errors බලන්න

### Issue: Subtitles පෙන්නන්නේ නැහැ
**Solution:**
1. Firestore database එකේ data තියෙනවද බලන්න
2. Firestore rules read permission දීලා තියෙනවද බලන්න
3. Browser console එකේ errors බලන්න
4. Page එක refresh කරලා බලන්න

### Issue: GitHub Pages site එක 404 error එකක් දෙනවා
**Solution:**
1. Repository public කරලා තියෙනවද බලන්න
2. GitHub Pages enable කරලා තියෙනවද බලන්න
3. Branch name නිවැරදි ද බලන්න (main/master)
4. මිනිත්තු 5-10ක් ඉන්න deploy වෙන්න

## 📞 Need Help?

ගැටළු තියෙනවනම්:
1. README.md file එකේ Troubleshooting section එක බලන්න
2. Browser console errors copy කරලා Google කරන්න
3. Firebase documentation බලන්න
4. GitHub Issues create කරන්න

---

**Good luck! 🚀**

ඔයාගේ Fairyscript subtitle platform එක setup කරගන්න සාර්ථක වේවා! 🎬

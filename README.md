# Fairyscript - සිංහල Subtitles Platform

සිංහල උපසිරැසි අප්ලෝඩ් කරන්න සහ බාගන්න පුළුවන් වෙබ් සයිට් එකක්!

A modern web platform for uploading and downloading Sinhala subtitles with real-time updates and user authentication.

## 🌟 Features | විශේෂාංග

- ✅ **GitHub Authentication** - GitHub හරහා login වෙන්න
- ✅ **Real-time Updates** - නව subtitles එකවගට පෙන්වනවා
- ✅ **File Upload** - Subtitles සහ images upload කරන්න
- ✅ **Search & Filter** - නම, country, year, genre අනුව හොයන්න
- ✅ **Download Tracking** - කීයක් download කරලද කියල track කරනවා
- ✅ **Responsive Design** - Mobile, tablet, desktop හැමෙන්ම work කරනවා
- ✅ **User Management** - ඔයාම upload කරපු subtitles delete කරන්න පුළුවන්

## 🚀 Quick Start | ඉක්මන් Setup

### 1️⃣ Firebase Project එකක් හදාගන්න

1. [Firebase Console](https://console.firebase.google.com/) එකට යන්න
2. "Add project" click කරන්න
3. Project නමක් දෙන්න (උදා: fairyscript-subtitles)
4. Google Analytics අවශ්‍ය නැත්නම් disable කරන්න
5. "Create project" click කරන්න

### 2️⃣ Firebase Authentication Setup කරන්න

1. Firebase Console එකේ **Authentication** යන්න
2. **"Get started"** click කරන්න
3. **"Sign-in method"** tab එක යන්න
4. **GitHub** provider එක enable කරන්න:
   - GitHub click කරන්න
   - "Enable" toggle එක on කරන්න
   - **Save** කරන්න (මුලින්ම save කරන්න!)
   
5. දැන් **GitHub OAuth App** එකක් හදන්න:
   - [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) යන්න
   - "New OAuth App" click කරන්න
   - Fill කරන්න:
     - **Application name:** Fairyscript Subtitles
     - **Homepage URL:** `https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/`
     - **Authorization callback URL:** `https://YOUR-PROJECT-ID.firebaseapp.com/__/auth/handler`
       (මේ URL එක Firebase Console එකේ GitHub provider settings එකේ තියෙනවා)
   - "Register application" click කරන්න
   - **Client ID** සහ **Client Secret** copy කරගන්න

6. Firebase එකේ GitHub provider settings එකට Client ID සහ Client Secret paste කරන්න
7. **Save** කරන්න

### 3️⃣ Firestore Database Setup කරන්න

1. Firebase Console එකේ **Firestore Database** යන්න
2. **"Create database"** click කරන්න
3. **Test mode** තෝරන්න (පලමුවට)
4. Location එකක් තෝරන්න (asia-south1 හොඳයි Sri Lanka වලට)
5. **Enable** click කරන්න

6. **Rules** tab එකට යන්න සහ මේ rules paste කරන්න:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Subtitles collection
    match /subtitles/{subtitleId} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null 
                    && request.resource.data.uploaderId == request.auth.uid;
      
      // Only the uploader can update or delete
      allow update, delete: if request.auth != null 
                            && resource.data.uploaderId == request.auth.uid;
    }
  }
}
```

7. **Publish** click කරන්න

### 4️⃣ Firebase Storage Setup කරන්න

1. Firebase Console එකේ **Storage** යන්න
2. **"Get started"** click කරන්න
3. **Test mode** තෝරන්න
4. Location එකම තෝරන්න (Firestore එකේ use කරපු එක)
5. **Done** click කරන්න

6. **Rules** tab එකට යන්න සහ මේ rules paste කරන්න:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Subtitles and images
    match /subtitles/{userId}/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can write to their own folder
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /images/{userId}/{fileName} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can write to their own folder
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

7. **Publish** click කරන්න

### 5️⃣ Firebase Config එක හොයාගන්න

1. Firebase Console home page එකට යන්න
2. Project settings (⚙️ gear icon) click කරන්න
3. "Your apps" section එකේ Web app එකක් add කරන්න (`</>` icon)
4. App නමක් දෙන්න සහ **"Register app"** click කරන්න
5. **firebaseConfig** object එක copy කරගන්න (මෙන්න මේ වගේ එකක්):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

### 6️⃣ Code Update කරන්න

`firebase-config.js` file එක open කරලා ඔයාගේ Firebase config එක paste කරන්න:

```javascript
// firebase-config.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const githubProvider = new firebase.auth.GithubAuthProvider();
```

### 7️⃣ GitHub Pages එකට Deploy කරන්න

1. ඔයාගේ GitHub repository එකට යන්න
2. මේ files upload කරන්න:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `firebase-config.js`
   - `README.md`
   - `logo.jpg` (ඔයාගේ logo එක)

3. Repository Settings → Pages යන්න
4. Source එක "Deploy from a branch" තෝරන්න
5. Branch එක "main" සහ folder එක "/ (root)" තෝරන්න
6. **Save** කරන්න

7. පස්සේ මිනිත්තු 2-3ක් ඉන්න, ඔයාගේ site එක live වෙයි:
   `https://YOUR-USERNAME.github.io/Fairyscript_-_subtitles/`

## 📁 File Structure | ගොනු ව්‍යුහය

```
Fairyscript_-_subtitles/
├── index.html           # Main HTML file
├── styles.css           # All styles
├── app.js              # Main JavaScript with Firebase integration
├── firebase-config.js   # Firebase configuration
├── logo.jpg            # Your logo
└── README.md           # This file
```

## 🎯 How to Use | භාවිතා කරන්නේ කොහොමද

### ප්‍රථම වාරය (First Time Setup):
1. ඔයාගේ GitHub account එකෙන් login වෙන්න
2. "+ Upload" button එක click කරන්න (screen එකේ දකුණු පැත්තේ)

### Subtitle එකක් Upload කරන්න:
1. Title එක type කරන්න (උදා: "AVATAR - SEASON 1")
2. Subtitle file එක select කරන්න (.srt, .ass, etc.)
3. Cover image එකක් select කරන්න (optional)
4. Country, Year, Genre select කරන්න (optional)
5. "Upload Subtitle" click කරන්න

### Subtitle එකක් Download කරන්න:
- ඕනම subtitle card එකක් එහි "Download" button එක click කරන්න

### Search කරන්න:
- Top එකේ search box එකේ type කරන්න
- හෝ filters use කරන්න (Country, Year, Genre)

### ඔයාගේම Subtitle එකක් Delete කරන්න:
- ඔයා upload කරපු subtitle card එකේ mouse hover කරන්න
- 🗑️ (delete) icon එක click කරන්න

## 🔧 Customization | වෙනස් කරගන්න

### Logo එක වෙනස් කරගන්න:
`logo.jpg` file එක replace කරන්න ඔයාගේ logo එකෙන්

### Colors වෙනස් කරගන්න:
`styles.css` file එකේ ඉහළම තියෙන `:root` section එක edit කරන්න:

```css
:root {
    --bg-dark: #1a1a1a;        /* Background color */
    --accent-red: #ff4444;     /* Primary accent color */
    --accent-orange: #FFA500;  /* Secondary accent */
    /* ... */
}
```

### Title එක වෙනස් කරගන්න:
`index.html` file එකේ:
```html
<title>Fairyscript - සිංහල සබ්ටයිටල්ස්</title>
<h1>fairyscript සිංහල සබ්ටයිටල්ස්</h1>
```

## ⚠️ Troubleshooting | ගැටළු විසඳීම

### Login වෙන්න බැහැ:
- GitHub OAuth App එකේ callback URL එක නිවැරදි ද බලන්න
- Firebase Console එකේ GitHub provider එක properly enabled ද බලන්න
- Client ID සහ Secret නිවැරදි ද බලන්න

### Upload වෙන්නේ නැහැ:
- Browser console එක open කරලා errors බලන්න (F12)
- Firebase Storage rules නිවැරදි ද බලන්න
- File size limit exceed වෙලා නැද්ද බලන්න (Subtitle: 5MB, Image: 2MB)

### Subtitles පෙන්නන්නේ නැහැ:
- Firestore rules නිවැරදි ද බලන්න
- Browser console එකේ errors බලන්න
- Firebase Console එකේ Firestore database එකේ data තියෙනවද බලන්න

### GitHub Pages එකේ site එක load වෙන්නේ නැහැ:
- Repository public කරලා තියෙනවද බලන්න
- GitHub Pages settings නිවැරදි ද බලන්න
- පස්සේ මිනිත්තු 5-10ක් ඉන්න (deploy වෙන්න time යයි)

## 🔒 Security | ආරක්ෂාව

මේ setup එකෙන්:
- ✅ Users authenticate කරනවා GitHub OAuth හරහා
- ✅ Firestore rules වලින් කවුරු read/write කරන්න පුළුවන්ද control කරනවා
- ✅ Storage rules වලින් files protect කරනවා
- ✅ Users upload කරපු files විතරක් delete කරන්න පුළුවන්

**Production use කරන්න කලින්:**
1. Firestore සහ Storage rules හොඳට review කරන්න
2. Rate limiting add කරන්න
3. File type validation improve කරන්න
4. Backup strategy එකක් හදාගන්න

## 📝 Supported File Types | Support කරන File වර්ග

### Subtitle Files:
- .srt (SubRip)
- .ass (Advanced SubStation Alpha)
- .ssa (SubStation Alpha)
- .sub (MicroDVD)
- .vtt (WebVTT)

### Image Files:
- .jpg / .jpeg
- .png
- .gif
- .webp

## 🌐 Browser Support | Browser සහාය

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 📞 Support | සහාය

ගැටළු තියෙනවනම් හෝ අදහස් තියෙනවනම්:
- GitHub Issues use කරන්න
- Pull requests welcome!

## 📄 License

MIT License - Free to use and modify!

---

**Created with ❤️ for Sinhala subtitle community**

සිංහල උපසිරැසි ප්‍රජාවට ආදරයෙන් ❤️

---

## 🎓 Additional Notes

### Performance Tips:
- Images අඩු කරන්න optimize කරගන්න (max 500KB recommended)
- Large subtitle files split කරන්න බලන්න
- Regular cleanup කරන්න unused uploads

### Future Enhancements:
- User profiles
- Comments/ratings system
- Categories and collections
- Advanced search with tags
- Subtitle preview
- Batch upload
- Admin dashboard

---

**Happy subtitling! 🎬**

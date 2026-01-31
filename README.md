# Subtitle Lanka - උපසිරැසි බෙදාගැනීමේ වෙබ්සයිට්

ලස්සන, නවීන subtitle sharing වෙබ්සයිට් එකක්. GitHub Pages එකේ host කරන්න පුළුවන්.

![Subtitle Lanka Preview](preview.png)

## ✨ විශේෂාංග / Features

- 🎨 **ලස්සන UI** - Dark theme එකක් සමග modern design
- 🔐 **GitHub Login** - GitHub OAuth භාවිතා කරලා login වෙන්න
- 📤 **Subtitle Upload** - SRT, ASS, SSA, SUB, VTT files upload කරන්න
- 🔍 **සෙවීම් සහ Filter** - Country, Year, Genre අනුව filter කරන්න
- 💾 **Local Storage** - Browser එකේ data save වෙනවා
- ⬇️ **One-Click Download** - Single click එකකින් subtitle download කරන්න
- 📱 **Responsive** - Mobile සහ Desktop යන දෙකටම ගැලපෙනවා

## 🚀 GitHub Pages එකේ Deploy කරන්නේ කෙසේද

### Step 1: Repository එකක් හදන්න

1. GitHub.com එකට යන්න
2. "New Repository" click කරන්න
3. Repository name එකක් දෙන්න (උදා: `subtitle-lanka`)
4. Public එක select කරන්න
5. "Create repository" click කරන්න

### Step 2: Files Upload කරන්න

මේ folder එකේ තියෙන හැම file එකක්ම repository එකට upload කරන්න:
- `index.html`
- `styles.css`
- `app.js`
- `README.md`

**උපදෙස්:**
1. Repository page එකේ "Add file" > "Upload files" click කරන්න
2. හැම file එකක්ම drag කරන්න හෝ select කරන්න
3. "Commit changes" click කරන්න

### Step 3: GitHub Pages Enable කරන්න

1. Repository Settings වලට යන්න
2. වම් පස "Pages" click කරන්න
3. "Source" යටතේ "main" branch එක select කරන්න
4. "Save" click කරන්න
5. මිනිත්තු 1-2 ක් වගේ wait කරන්න
6. ඔබේ site එක මෙහි available වේ: `https://username.github.io/subtitle-lanka/`

## 🔑 GitHub OAuth Setup (Optional)

Real GitHub login එක enable කරන්න නම්:

1. GitHub Settings > Developer settings > OAuth Apps එකට යන්න
2. "New OAuth App" click කරන්න
3. විස්තර fill කරන්න:
   - **Application name**: Subtitle Lanka
   - **Homepage URL**: `https://username.github.io/subtitle-lanka/`
   - **Authorization callback URL**: `https://username.github.io/subtitle-lanka/`
4. "Register application" click කරන්න
5. ලැබෙන **Client ID** එක copy කරන්න
6. `app.js` file එකේ මේ line එක update කරන්න:
   ```javascript
   CLIENT_ID: 'YOUR_GITHUB_CLIENT_ID', // මෙහි ඔබේ Client ID එක paste කරන්න
   ```

## 📝 භාවිතා කරන්නේ කෙසේද

### Login වෙන්න:
1. "login" button එක click කරන්න
2. "Continue with GitHub" click කරන්න (demo mode එකේ automatic වෙනවා)

### Subtitle Upload කරන්න:
1. Login වෙලා ඉන්න ඕනි
2. දකුණු පහළ කෙළවරේ තියෙන "+" button එක click කරන්න
3. විස්තර fill කරන්න:
   - Title (අනිවාර්යයි)
   - Subtitle file (අනිවාර්යයි)
   - Country, Year, Genre (optional)
   - Image (optional)
4. "Upload Subtitle" click කරන්න

### Subtitle Download කරන්න:
1. ඕනි subtitle card එකේ download button (⭕) click කරන්න
2. File එක automatic download වෙනවා

### සෙවීම සහ Filter:
- Top search bar එකෙන් search කරන්න
- "name" input එකෙන් title search කරන්න
- Country, Years, Genre dropdowns එකෙන් filter කරන්න

## 🎨 Customization

### Colors වෙනස් කරන්න:
`styles.css` file එකේ මේ variables වෙනස් කරන්න:
```css
:root {
    --bg-dark: #1a1a1a;        /* Background color */
    --bg-card: #2a2a2a;        /* Card background */
    --accent-red: #ff4444;     /* Accent color */
    --text-primary: #fff;      /* Text color */
}
```

### Site Name වෙනස් කරන්න:
`index.html` file එකේ:
```html
<h1>subtitle lanka.</h1>  <!-- මෙහි ඔබේ site name එක දාන්න -->
<title>Subtitle Lanka - උපසිරැසි බාගන්න</title>
```

## 📂 File Structure

```
subtitle-sharing-site/
│
├── index.html          # Main HTML file
├── styles.css          # Styling
├── app.js             # JavaScript logic
└── README.md          # Documentation
```

## 🛠️ තාක්ෂණික විස්තර

- **Frontend**: Pure HTML, CSS, JavaScript (No frameworks!)
- **Storage**: Browser LocalStorage
- **Authentication**: GitHub OAuth (Optional)
- **Hosting**: GitHub Pages
- **Responsive**: Mobile-first design

## 📱 Supported File Types

Upload කරන්න පුළුවන් subtitle formats:
- `.srt` - SubRip
- `.ass` - Advanced SubStation Alpha
- `.ssa` - SubStation Alpha
- `.sub` - MicroDVD
- `.vtt` - WebVTT

## 🔒 Privacy & Data

- හැම data එකක්ම browser එකේ LocalStorage එකේ save වෙනවා
- Server එකකට data යන්නේ නැහැ
- GitHub login optional එකක්
- Data share වෙන්නේ නැහැ

## ⚡ Performance

- Super fast loading (< 1MB total)
- No external dependencies
- Optimized for mobile
- Works offline (after first load)

## 🤝 Contributing

Pull requests welcome! Issues report කරන්න නම්:
1. Repository එකේ "Issues" tab එකට යන්න
2. "New Issue" click කරන්න
3. Problem එක විස්තර කරන්න

## 📄 License

MIT License - Free to use and modify!

## 🆘 Common Issues

### Subtitles load වෙන්නේ නැහැ
- Browser cache එක clear කරන්න
- LocalStorage enable කරලා තියෙනවද බලන්න

### Upload වැඩ කරන්නේ නැහැ
- Login වෙලා තියෙනවද check කරන්න
- File size limit (5MB) එක check කරන්න

### GitHub Pages load වෙන්නේ නැහැ
- Repository public එකක්ද check කරන්න
- Settings > Pages enable කරලා තියෙනවද බලන්න
- මිනිත්තු 5-10 wait කරන්න

## 💡 Tips

1. **Demo Data**: පළමු වතාවට load කරද්දී demo subtitles 2ක් තියෙනවා
2. **Clear Data**: Browser Console එකේ `localStorage.clear()` type කරලා clear කරන්න පුළුවන්
3. **Backup**: Browser data වලින් backup එකක් export කරන්න:
   ```javascript
   // Console එකේ run කරන්න
   const data = localStorage.getItem('subtitles_data');
   console.log(data);
   ```

## 🌟 Future Features

- [ ] Advanced search with tags
- [ ] User profiles
- [ ] Comments and ratings
- [ ] Categories system
- [ ] Multi-language support
- [ ] Subtitle preview
- [ ] Batch download

## 📞 Support

Problems තියෙනවා නම්:
1. README එක කියවන්න
2. GitHub Issues එකේ search කරන්න
3. New issue එකක් create කරන්න

---

Made with ❤️ by Claude for Sinhala Subtitle Community

**Star ⭐ the repo if you like it!**

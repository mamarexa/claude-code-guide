# Setup Guide - Claude Code Community Guide

Complete walkthrough to get your guide live with all features enabled.

---

## 🚀 Part 1: Deploy to GitHub Pages (5 minutes)

### Step 1: Extract and Initialize

```bash
# Extract the zip file
unzip claude-code-guide-final.zip
cd claude-code-guide-final

# Install dependencies
npm install

# Initialize git
git init
git add .
git commit -m "Initial commit: Claude Code Community Guide"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `claude-code-guide`
3. Make it **Public**
4. **Don't** initialize with README
5. Click **Create repository**

### Step 3: Push to GitHub

```bash
# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/claude-code-guide.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select: **GitHub Actions**
4. Wait 2 minutes for first deployment
5. Your site will be live at: `https://YOUR-USERNAME.github.io/claude-code-guide/`

✅ **You now have a working guide online!** But comments are disabled. Continue to Part 2.

---

## 🔥 Part 2: Enable Firebase (Comments & Voting) - 10 minutes

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **Add project**
3. Name it: `claude-code-guide`
4. Disable Google Analytics (not needed)
5. Click **Create project**

### Step 2: Add Web App

1. In your Firebase project, click the **</>** (web) icon
2. App nickname: `claude-code-guide`
3. **Don't** check "Firebase Hosting"
4. Click **Register app**
5. **Copy the config object** - it looks like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. Click **Continue to console**

### Step 3: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll secure it next)
4. Location: Choose closest to your users (e.g., `us-central` or `europe-west`)
5. Click **Enable**

### Step 4: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /comments/{comment} {
         // Anyone can read comments
         allow read: if true;
         
         // Anyone can create comments (anonymous allowed)
         allow create: if request.resource.data.keys().hasAll(['sectionId', 'author', 'text', 'votes', 'createdAt'])
                       && request.resource.data.votes == 0;
         
         // Anyone can update votes only
         allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['votes']);
       }
     }
   }
   ```
3. Click **Publish**

### Step 5: Add Config to Your Project

1. In your project, copy the example config:
   ```bash
   cp src/firebase.config.example.js src/firebase.config.js
   ```

2. Open `src/firebase.config.js` and paste your Firebase config:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY_HERE",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Important:** This file is in `.gitignore` - it won't be committed to Git

### Step 6: Update GitHub Repo URL

1. Open `src/App.jsx`
2. Find this line (around line 347):
   ```javascript
   const repoUrl = "https://github.com/YOUR-USERNAME/claude-code-guide";
   ```
3. Replace `YOUR-USERNAME` with your actual GitHub username

### Step 7: Deploy

```bash
git add src/App.jsx
git commit -m "Add Firebase config and update repo URL"
git push
```

Wait 2 minutes. Comments are now enabled! 🎉

---

## ⚙️ Part 3: Enable Admin Panel (Optional) - 5 minutes

The admin panel lets you review GitHub Issues and approve contributions.

### Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Note: `Claude Code Guide Admin`
4. Expiration: Choose how long (90 days recommended)
5. Select scopes:
   - ✅ `repo` (full control of private repositories)
6. Click **Generate token**
7. **Copy the token** (starts with `ghp_...`)
   - ⚠️ You won't be able to see it again!

### Step 2: Add Admin Config

1. Copy the example:
   ```bash
   cp src/admin.config.example.js src/admin.config.js
   ```

2. Edit `src/admin.config.js`:
   ```javascript
   export const adminConfig = {
     githubToken: 'ghp_YOUR_TOKEN_HERE',
     owner: 'YOUR_GITHUB_USERNAME',
     repo: 'claude-code-guide'
   };
   ```

3. This file is in `.gitignore` - never commit it!

### Step 3: Test Locally

```bash
npm run dev
```

Open http://localhost:5173/admin - you should see pending contributions.

**Note:** The admin panel works locally but GitHub Actions can't access your local config file. For production admin access, you'll need to configure it as a GitHub secret (advanced).

---

## 📝 Part 4: Managing Content

### Adding New Entries

Edit `src/data.json` directly:

```json
{
  "title": "New tip title",
  "type": "code",
  "mac": "command for macOS",
  "win": "command for Windows/Linux",
  "note": "Description and usage tips"
}
```

**Available types:** `code`, `shortcut`, `command`, `tip`, `model`

### Adding New Sections

Add to the `sections` array in `data.json`:

```json
{
  "id": "new-section",
  "icon": "✨",
  "label": "New Section",
  "color": "#e87c4e",
  "items": [
    // ... your items
  ]
}
```

### Deploying Updates

```bash
git add src/data.json
git commit -m "Add new tips"
git push
```

GitHub Actions auto-deploys in ~2 minutes.

---

## 🎨 Customization

### Change Colors

Edit the `LIGHT` and `DARK` objects in `src/App.jsx` (lines 15-55).

### Change Repository URL

Update the `repoUrl` variable in `src/App.jsx` (line 347).

### Modify Issue Templates

Edit files in `.github/ISSUE_TEMPLATE/` to customize the contribution and feedback forms.

---

## 🔒 Security Best Practices

### Firebase Config

- ✅ Already in `.gitignore`
- ✅ API key is safe to expose (restricted by Firebase rules)
- ✅ Firestore rules prevent abuse

### Admin Config

- ⚠️ **Never commit `src/admin.config.js`**
- ⚠️ Token gives full access to your repo
- ✅ Rotate token every 90 days
- ✅ Use minimum required permissions

### Firestore Rules

After testing, tighten your rules:

```javascript
// Limit comment length
allow create: if request.resource.data.text.size() < 1000;

// Prevent vote spam
allow update: if request.resource.data.votes <= resource.data.votes + 1
                 && request.resource.data.votes >= resource.data.votes - 1;
```

---

## 📊 Usage Limits (Free Tier)

### Firebase

- **Firestore reads:** 50,000/day
- **Firestore writes:** 20,000/day
- **Storage:** 1 GB
- **Bandwidth:** 10 GB/month

Typical usage: ~100-500 reads/day for a small community guide.

### GitHub Pages

- **Bandwidth:** 100 GB/month
- **Build time:** 10 min per build
- **Storage:** 1 GB

### GitHub API

- **Rate limit:** 5,000 requests/hour (authenticated)
- Admin panel uses minimal API calls

---

## 🐛 Troubleshooting

### Comments Not Showing

**Problem:** "Comments disabled" message appears

**Solutions:**
1. Verify `src/firebase.config.js` exists and has correct values
2. Check browser console for errors (F12 → Console)
3. Verify Firestore is enabled in Firebase Console
4. Check Firestore rules are published

---

### Feedback Button Goes to Wrong Repo

**Problem:** Clicking Feedback opens someone else's repository

**Solution:**
1. Edit `src/App.jsx`
2. Update line 347: `const repoUrl = "https://github.com/YOUR-USERNAME/claude-code-guide";`
3. Commit and push

---

### Admin Panel Shows Error

**Problem:** "Admin config not found"

**Solutions:**
1. Create `src/admin.config.js` from the example
2. Verify GitHub token is valid (not expired)
3. Check token has `repo` scope
4. Verify owner/repo names match exactly

---

### Build Failing on GitHub Actions

**Problem:** Deployment fails with module errors

**Solutions:**
1. Check `src/data.json` for syntax errors (trailing commas, missing quotes)
2. Verify all imports in `App.jsx` are correct
3. Run `npm run build` locally to test
4. Check GitHub Actions log for specific error

---

## 📞 Getting Help

1. **Check the troubleshooting section above**
2. **Search GitHub Issues:** https://github.com/YOUR-USERNAME/claude-code-guide/issues
3. **Open a new issue:** Use the Feedback template
4. **Community:** Comment on the guide itself using the comments feature

---

## 🎯 Next Steps

Now that your guide is live:

1. **Share it:** Tweet the link, share in Claude Code communities
2. **Monitor contributions:** Check GitHub Issues regularly
3. **Engage with comments:** Reply to questions, upvote good tips
4. **Expand content:** Keep adding more tips as you discover them
5. **Iterate:** Update based on community feedback

---

**Built with:** React + Vite + Firebase + GitHub Pages
**License:** MIT (see LICENSE file)
**Community:** Contributions welcome via GitHub Issues

Enjoy your Claude Code community guide! 🎉

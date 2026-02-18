# Claude Code Reference Guide - Community Edition

A comprehensive, community-driven reference guide for Claude Code featuring:
- 📚 120+ commands, shortcuts, and best practices
- 🌓 Dark/Light mode toggle
- 💬 Per-section comments with upvote/downvote
- 🔧 Admin panel for managing contributions
- 📝 GitHub Issues integration for feedback
- 🎨 Modern, accessible UI

## Quick Start

### 1. Deploy to GitHub Pages

```bash
# Clone or extract this repository
cd claude-code-guide

# Install dependencies
npm install

# Create your Firebase config (see SETUP.md)
cp src/firebase.config.example.js src/firebase.config.js
# Edit src/firebase.config.js with your Firebase credentials

# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/claude-code-guide.git
git push -u origin main

# Enable GitHub Pages:
# Settings → Pages → Source: GitHub Actions
```

Your site will be live at: `https://YOUR-USERNAME.github.io/claude-code-guide/`

## Configuration

See `SETUP.md` for detailed setup instructions including:
- Firebase setup for comments/voting
- GitHub Personal Access Token for admin panel
- Customizing the content

## Updating Content

Edit `src/data.json` to add/modify entries. Structure:

```json
{
  "title": "Command name",
  "type": "code",
  "mac": "command for macOS",
  "win": "command for Windows/Linux",
  "note": "Description of what this does"
}
```

Commit and push - GitHub Actions will auto-deploy.

## Features

- **Data-driven**: All content in editable JSON
- **Comments**: Real-time via Firebase
- **Admin Panel**: `/admin` route for reviewing contributions
- **Responsive**: Works on mobile, tablet, desktop
- **Accessible**: Keyboard navigation, screen reader friendly

## Tech Stack

- React 18
- Vite
- Firebase (Firestore)
- React Router
- GitHub Pages

---

Built with ❤️ by the Claude Code community

// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// 1. Copy this file to: src/admin.config.js
// 2. Go to GitHub → Settings → Developer settings
// 3. Personal access tokens → Tokens (classic) → Generate new token
// 4. Select scopes: repo (full control)
// 5. Copy the token and paste below
// ═══════════════════════════════════════════════════════════════

export const adminConfig = {
  githubToken: 'ghp_YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE',
  owner: 'YOUR_GITHUB_USERNAME',
  repo: 'claude-code-guide'
};

// ⚠️ SECURITY WARNING:
// - This file is in .gitignore - never commit it!
// - The token gives full access to your repo
// - Rotate it regularly
// - Keep it secret, keep it safe

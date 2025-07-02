# Auto-Update Setup Guide

## Overview
Your Tauri app now supports automatic updates! Here's how it works and how to set it up:

## How It Works
1. **GitHub Releases**: When you push a new tag (e.g., `v1.0.1`), GitHub Actions automatically builds and creates a release
2. **Signing**: The release is signed with your private key for security
3. **Update Check**: The app checks for updates on startup
4. **Auto-Install**: If an update is available, users get a dialog to install it

## Setup Steps

### 1. Add GitHub Secrets
In your GitHub repository, go to Settings → Secrets and variables → Actions, and add:

- `TAURI_PRIVATE_KEY`: Content of `/Users/goatgiver/.tauri/myapp.key`
- `TAURI_KEY_PASSWORD`: The password you used when generating the key

### 2. Update the Updater Endpoint
✅ **Already Done!** The endpoint is now configured for your repository:
```json
"endpoints": [
  "https://api.github.com/repos/Ktopper/img-optimizer-tauri/releases/latest"
]
```

### 3. Release Process
To create a new release:

```bash
# Update version in src-tauri/Cargo.toml and package.json
# Then create and push a tag
git tag v1.0.1
git push origin v1.0.1
```

This triggers the GitHub Action which:
- Builds for Windows, macOS, and Linux
- Signs the binaries
- Creates a GitHub release
- Makes the update available to all users

### 4. Update Flow for Users
1. User opens the app
2. App automatically checks for updates
3. If update available, user sees a dialog
4. User clicks "Install" → app downloads, installs, and restarts
5. User now has the latest version!

## Important Files Created/Modified

- `src-tauri/tauri.conf.json` - Added updater configuration
- `src-tauri/Cargo.toml` - Added updater feature
- `src-tauri/src/main.rs` - Added update checking function
- `src/App.jsx` - Added automatic update check on startup
- `.github/workflows/release.yml` - GitHub Actions for automated releases

## Security Notes

- **Private Key**: Keep `/Users/goatgiver/.tauri/myapp.key` safe and never commit it to git
- **Password**: Store the key password securely
- **Public Key**: The public key in the config allows users to verify updates are authentic

## Testing Updates

1. Make a small change to your app
2. Update the version number in both `Cargo.toml` and `package.json`
3. Create and push a git tag
4. Wait for GitHub Actions to complete
5. Run your current app - it should detect and offer the update!

## Troubleshooting

- If updates don't work, check the GitHub Actions logs
- Ensure the endpoint URL matches your repository
- Verify the private key and password are correct in GitHub secrets
- Make sure the version number was incremented

## Quick Setup for Your Repository

Since you shared your GitHub repository (https://github.com/Ktopper/img-optimizer-tauri), here are the exact steps:

### 1. Add GitHub Secrets
Go to: https://github.com/Ktopper/img-optimizer-tauri/settings/secrets/actions

Click "New repository secret" and add these two secrets:

**Secret 1: TAURI_PRIVATE_KEY**
- Name: `TAURI_PRIVATE_KEY`
- Value: Copy the entire content of `/Users/goatgiver/.tauri/myapp.key`

**Secret 2: TAURI_KEY_PASSWORD**  
- Name: `TAURI_KEY_PASSWORD`
- Value: The password you entered when generating the key

### 2. Test Your First Release
```bash
# Update version numbers first
# In package.json: "version": "0.1.1"
# In src-tauri/Cargo.toml: version = "0.1.1"

# Then create and push the tag
git add .
git commit -m "Setup auto-updates"
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

The GitHub Action will then build Windows, macOS, and Linux versions automatically!

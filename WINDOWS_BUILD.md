# Windows Build Instructions

## Prerequisites on Windows
1. Install Node.js from https://nodejs.org/
2. Install Rust from https://rustup.rs/
3. Install Visual Studio Build Tools or Visual Studio Community with C++ build tools

## Build Steps
```cmd
# Clone the repository
git clone https://github.com/Ktopper/img-optimizer-tauri.git
cd img-optimizer-tauri

# Install dependencies
npm install

# Build for Windows
npm run tauri build
```

## Output Location
The Windows executable (.exe) will be in:
- `src-tauri/target/release/bundle/msi/` (MSI installer)
- `src-tauri/target/release/bundle/nsis/` (NSIS installer)
- `src-tauri/target/release/` (standalone executable)

## File Sharing
The MSI installer is typically the best option for distribution as it:
- Handles installation/uninstallation
- Creates shortcuts
- Is signed (if you have a certificate)
- Is typically 10-50MB in size

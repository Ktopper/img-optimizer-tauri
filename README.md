I'm tinkering with a Tauri app for optimizing images – it's my playground for merging the power of Rust with the elegance of React.  Think of it as a Swiss Army knife for web images, fine-tuned for peak performance.


# Image Optimizer

A powerful desktop application built with Tauri and React for batch processing and optimizing images with various conversion options.

## Features

- Convert images to WebP format
- Resize images to specific dimensions:
  - 700x700px square
  - 300x300px square
  - 1600px width
  - Custom width with aspect ratio preservation
- Convert images to different formats:
  - ICO (favicon)
  - JPG
  - PNG (100x100)
- Apply image effects:
  - Grayscale conversion
  - Image overlay with multiple positioning options
- Aspect ratio conversion with presets:
  - 16:9
  - 3:2
  - 2:1
  - 1:2
  - 3:4
  - 4:3
  - 5:3
- Batch processing for folders

## Prerequisites

- Node.js (Latest LTS version recommended)
- Rust (Latest stable version)
- npm or yarn package manager

## Installation

1. Clone the repository
   ```bash
   git clone [your-repository-url]
   cd img-optimizer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Install Rust dependencies
   ```bash
   cd src-tauri
   cargo build
   cd ..
   ```

## Development

To run the application in development mode:

```bash
npm run tauri dev
```

## Building

To create a production build:

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

## Tech Stack

- Frontend:
  - React
  - Vite
  - CSS3
- Backend:
  - Tauri
  - Rust
  - Sharp (Node.js image processing)

## Project Structure

- `/src` - React frontend code
- `/src-tauri` - Rust backend code
- `/src-tauri/node-backend` - Node.js image processing scripts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tauri](https://tauri.app/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [React](https://reactjs.org/)

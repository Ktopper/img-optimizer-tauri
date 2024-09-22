const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Convert a single image to WebP
async function convertImageToWebp(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '.webp');
  await sharp(imagePath)
    .webp({ quality: 80 }) // Adjust the quality if needed
    .toFile(outputImagePath);
  return outputImagePath;
}

// Convert all images in a folder to WebP
async function convertFolderToWebp(folderPath) {
  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of imageFiles) {
    await convertImageToWebp(path.join(folderPath, file));
  }
  return 'All images converted to WebP';
}

// Export these functions so they can be called by the frontend
module.exports = { convertImageToWebp, convertFolderToWebp };

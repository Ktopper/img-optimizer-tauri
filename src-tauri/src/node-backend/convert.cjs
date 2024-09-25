const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertImageToWebp(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '.webp');
  console.log(`Converting: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return outputImagePath;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertFolderToWebp(folderPath) {
  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  const convertedFiles = [];
  for (const file of imageFiles) {
    const convertedFile = await convertImageToWebp(path.join(folderPath, file));
    convertedFiles.push(convertedFile);
  }
  return `Converted ${convertedFiles.length} images to WebP`;
}

async function convertToSquare700(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '-700.webp');
  console.log(`Converting to 700px square: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .resize(700, 700, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return outputImagePath;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertToWidth1600(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '-1600.webp');
  console.log(`Converting to 1600px width: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .resize(1600, null, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return outputImagePath;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--image') {
    const imagePath = args[1];
    const conversionType = args[2];
    let result;
    switch (conversionType) {
      case 'webp':
        result = await convertImageToWebp(imagePath);
        break;
      case 'square700':
        result = await convertToSquare700(imagePath);
        break;
      case 'width1600':
        result = await convertToWidth1600(imagePath);
        break;
      default:
        throw new Error('Invalid conversion type');
    }
    console.log(result);
  } else if (args[0] === '--folder') {
    const folderPath = args[1];
    const result = await convertFolderToWebp(folderPath);
    console.log(result);
  } else {
    console.error('Invalid arguments. Use --image <path> <conversionType> or --folder <path>');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

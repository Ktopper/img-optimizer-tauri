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
    return `Output: ${outputImagePath}`;
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
    return `Output: ${outputImagePath}`;
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
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertToIco(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '.ico');
  console.log(`Converting to ICO: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .resize(256, 256)
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertTo100x100Png(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '-100x100.png');
  console.log(`Converting to 100x100 PNG: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .resize(100, 100, { fit: 'cover', position: 'center' })
      .png()
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertToGrayScale(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '-grayscale' + path.extname(imagePath));
  console.log(`Converting to gray-scale: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
    .modulate({ brightness: 1.2 }) 
      .grayscale()
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function overlayImage(baseImagePath, overlayImagePath, overlayOption) {
  const outputImagePath = baseImagePath.replace(path.extname(baseImagePath), '-overlay.png');
  console.log(`Overlaying: ${overlayImagePath} onto ${baseImagePath} with option: ${overlayOption}`);

  try {
    const baseImage = sharp(baseImagePath);
    const overlayImage = await sharp(overlayImagePath).toBuffer();

    const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
    const { width: overlayWidth, height: overlayHeight } = await sharp(overlayImagePath).metadata();

    let options = { input: overlayImage };

    switch (overlayOption) {
      case 'center':
        options.gravity = 'center';
        break;
      case 'left':
        options.gravity = 'west';
        break;
      case 'right':
        options.gravity = 'east';
        break;
      case 'tile':
        options.tile = true;
        break;
      case 'stretch':
        options = { ...options, width: baseWidth, height: baseHeight };
        break;
      default:
        options.gravity = 'center';
    }

    await baseImage
      .composite([options])
      .toFile(outputImagePath);

    console.log(`Successfully overlaid: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to overlay: ${baseImagePath}`, error);
    throw error;
  }
}

async function resizeToSpecificWidth(imagePath, targetWidth) {
  const ext = path.extname(imagePath);
  const outputImagePath = imagePath.replace(ext, `-${targetWidth}w${ext}`);
  console.log(`Resizing to ${targetWidth}px width: ${imagePath} to ${outputImagePath}`);

  try {
    const width = parseInt(targetWidth, 10);
    if (isNaN(width) || width <= 0) {
      throw new Error('Invalid target width');
    }
    
    // Create the sharp pipeline for resizing
    let pipeline = sharp(imagePath).resize(width, null, { fit: 'inside' });
    
    // If the image is in WebP format, ensure the output is properly encoded as WebP.
    if (ext.toLowerCase() === '.webp') {
      pipeline = pipeline.webp({ quality: 80 });
    }
    
    await pipeline.toFile(outputImagePath);
    console.log(`Successfully resized: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to resize: ${imagePath}`, error);
    throw error;
  }
}

async function resizeToSpecificHeight(imagePath, targetHeight) {
  const ext = path.extname(imagePath);
  const outputImagePath = imagePath.replace(ext, `-${targetHeight}h${ext}`);
  console.log(`Resizing to ${targetHeight}px height: ${imagePath} to ${outputImagePath}`);

  try {
    const height = parseInt(targetHeight, 10);
    if (isNaN(height) || height <= 0) {
      throw new Error('Invalid target height');
    }
    
    // Create the sharp pipeline for resizing
    let pipeline = sharp(imagePath).resize(null, height, { fit: 'inside' });
    
    // If the image is in WebP format, ensure the output is properly encoded as WebP.
    if (ext.toLowerCase() === '.webp') {
      pipeline = pipeline.webp({ quality: 80 });
    }
    
    await pipeline.toFile(outputImagePath);
    console.log(`Successfully resized: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to resize: ${imagePath}`, error);
    throw error;
  }
}

async function convertToAspectRatio(imagePath, aspectRatio) {
  const [width, height] = aspectRatio.split(':').map(Number);
  const ext = path.extname(imagePath);
  const outputImagePath = imagePath.replace(ext, `-${width}x${height}${ext}`);
  console.log(`Converting to ${width}:${height} aspect ratio: ${imagePath} to ${outputImagePath}`);

  if (!width || !height || isNaN(width) || isNaN(height)) {
    throw new Error(`Invalid aspect ratio: ${aspectRatio}`);
  }

  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    console.log(`Original dimensions: ${originalWidth}x${originalHeight}`);

    let newWidth, newHeight;
    const targetRatio = width / height;
    const originalRatio = originalWidth / originalHeight;

    if (originalRatio > targetRatio) {
      newHeight = originalHeight;
      newWidth = Math.round(newHeight * targetRatio);
    } else {
      newWidth = originalWidth;
      newHeight = Math.round(newWidth / targetRatio);
    }

    console.log(`New dimensions: ${newWidth}x${newHeight}`);

    if (isNaN(newWidth) || isNaN(newHeight) || newWidth <= 0 || newHeight <= 0) {
      throw new Error(`Invalid new dimensions: ${newWidth}x${newHeight}`);
    }

    await image
      .resize(newWidth, newHeight, { fit: 'cover', position: 'center' })
      .toFile(outputImagePath);

    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertToJpg(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '.jpg');
  console.log(`Converting to JPG: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .jpeg({ quality: 85 })
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
  } catch (error) {
    console.error(`Failed to convert: ${imagePath}`, error);
    throw error;
  }
}

async function convertToSquare300(imagePath) {
  const outputImagePath = imagePath.replace(path.extname(imagePath), '-300.webp');
  console.log(`Converting to 300px square: ${imagePath} to ${outputImagePath}`);

  try {
    await sharp(imagePath)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(outputImagePath);
    console.log(`Successfully converted: ${outputImagePath}`);
    return `Output: ${outputImagePath}`;
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
    try {
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
        case 'ico':
          result = await convertToIco(imagePath);
          break;
        case 'png100':
          result = await convertTo100x100Png(imagePath);
          break;
        case 'grayscale':
          result = await convertToGrayScale(imagePath);
          break;
        case 'overlay':
          result = await overlayImage(imagePath, args[3], args[4]); // Assuming args[4] is the overlay option
          break;
        case 'resize':
          const width = parseInt(args[3], 10);
          if (isNaN(width) || width <= 0) {
            throw new Error('Invalid target width');
          }
          result = await resizeToSpecificWidth(imagePath, width);
          break;
        case 'resize-height':
          console.log('Full args:', process.argv);
          console.log('Sliced args:', args);
          const heightStr = args[3];
          console.log('Height string:', heightStr);
          
          if (!heightStr) {
            throw new Error('Height parameter is missing');
          }
          
          const height = parseInt(heightStr, 10);
          console.log('Parsed height:', height);
          
          if (isNaN(height) || height <= 0) {
            throw new Error(`Invalid target height: ${heightStr}`);
          }
          
          result = await resizeToSpecificHeight(imagePath, height);
          break;
        case 'aspect-ratio':
          const aspectRatio = args[3];
          if (!aspectRatio) {
            throw new Error('Aspect ratio not provided');
          }
          result = await convertToAspectRatio(imagePath, aspectRatio);
          break;
        case 'jpg':
          result = await convertToJpg(imagePath);
          break;
        case 'square300':
          result = await convertToSquare300(imagePath);
          break;
        default:
          throw new Error(`Unknown conversion type: ${conversionType}`);
      }
      console.log(result);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
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

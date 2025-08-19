const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

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
  const imageFiles = files.filter(file => /\.(.webp|jpg|jpeg|png)$/i.test(file));

  const convertedFiles = [];
  for (const file of imageFiles) {
    const convertedFile = await convertImageToWebp(path.join(folderPath, file));
    convertedFiles.push(convertedFile);
  }
  return `Converted ${convertedFiles.length} images to WebP`;
}

async function convertToSquare700(imagePath, convertToWebP = false) {
  const ext = path.extname(imagePath);
  const outputExt = convertToWebP ? '.webp' : '.webp'; // Default to webp but respect the flag
  const outputImagePath = imagePath.replace(ext, `-700${outputExt}`);
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

async function resizeToSpecificWidth(imagePath, targetWidth, convertToWebP = false) {
  const ext = path.extname(imagePath);
  const outputExt = convertToWebP ? '.webp' : ext;
  const outputImagePath = imagePath.replace(ext, `-${targetWidth}w${outputExt}`);
  console.log(`Resizing to ${targetWidth}px width: ${imagePath} to ${outputImagePath}${convertToWebP ? ' (WebP)' : ''}`);

  try {
    const width = parseInt(targetWidth, 10);
    if (isNaN(width) || width <= 0) {
      throw new Error('Invalid target width');
    }
    
    // Create the sharp pipeline for resizing
    let pipeline = sharp(imagePath).resize(width, null, { fit: 'inside' });
    
    // Apply format conversion
    if (convertToWebP) {
      pipeline = pipeline.webp({ quality: 80 });
    } else if (ext.toLowerCase() === '.webp') {
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

async function resizeToSpecificHeight(imagePath, targetHeight, convertToWebP = false) {
  const ext = path.extname(imagePath);
  const outputExt = convertToWebP ? '.webp' : ext;
  const outputImagePath = imagePath.replace(ext, `-${targetHeight}h${outputExt}`);
  console.log(`Resizing to ${targetHeight}px height: ${imagePath} to ${outputImagePath}${convertToWebP ? ' (WebP)' : ''}`);

  try {
    const height = parseInt(targetHeight, 10);
    if (isNaN(height) || height <= 0) {
      throw new Error('Invalid target height');
    }
    
    // Create the sharp pipeline for resizing
    let pipeline = sharp(imagePath).resize(null, height, { fit: 'inside' });
    
    // Apply format conversion
    if (convertToWebP) {
      pipeline = pipeline.webp({ quality: 80 });
    } else if (ext.toLowerCase() === '.webp') {
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

async function convertToAspectRatio(imagePath, aspectRatio, convertToWebP = false) {
  const [width, height] = aspectRatio.split(':').map(Number);
  const ext = path.extname(imagePath);
  const outputExt = convertToWebP ? '.webp' : ext;
  const outputImagePath = imagePath.replace(ext, `-${width}x${height}${outputExt}`);
  console.log(`Converting to ${width}:${height} aspect ratio: ${imagePath} to ${outputImagePath}${convertToWebP ? ' (WebP)' : ''}`);

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

    let pipeline = image.resize(newWidth, newHeight, { fit: 'cover', position: 'center' });
    
    // Apply format conversion
    if (convertToWebP) {
      pipeline = pipeline.webp({ quality: 80 });
    }

    await pipeline.toFile(outputImagePath);

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

async function convertToSquare300(imagePath, convertToWebP = false) {
  const ext = path.extname(imagePath);
  const outputExt = convertToWebP ? '.webp' : '.webp'; // Default to webp but respect the flag
  const outputImagePath = imagePath.replace(ext, `-300${outputExt}`);
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

/**
 * Convert video using ffmpeg. Supports aspect ratios 16:9 and 1:1 and resolutions 720p and 480p.
 * compression: 'high' (more), 'medium' (balanced), 'low' (less compression)
 */
function convertVideo(videoPath, aspectRatio = '16:9', resolution = '720p', compression = 'medium') {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(videoPath)) {
      return reject(new Error('Video file not found'));
    }

    // Quick check for ffmpeg on PATH
    try {
      const check = spawnSync('ffmpeg', ['-version']);
      if (check.error || check.status !== 0) {
        return reject(new Error('ffmpeg not found or not executable. Please install ffmpeg and ensure it is on PATH.'));
      }
    } catch (err) {
      return reject(new Error('ffmpeg not found. Please install ffmpeg and ensure it is on PATH.'));
    }

    const ext = path.extname(videoPath);
    const base = videoPath.replace(ext, '');
    const outputPath = `${base}-${aspectRatio.replace(':','x')}-${resolution}.mp4`;

    // Determine scale based on resolution
    let targetHeight = 720;
    if (resolution === '480p') targetHeight = 480;

    // Determine desired width from aspect ratio
    const [arW, arH] = aspectRatio.split(':').map(Number);
    if (!arW || !arH) return reject(new Error('Invalid aspect ratio'));
    const targetWidth = Math.round((targetHeight * arW) / arH);

    // Compression mapping -> CRF (lower is better quality). We'll use libx264 with reasonable presets.
    let crf = 23; // default medium
    if (compression === 'high') crf = 28; // higher crf -> smaller file, lower quality
    if (compression === 'low') crf = 18; // lower crf -> better quality

    // ffmpeg filter: scale and crop to enforce aspect ratio and size
    // We'll first scale to fit the target height while preserving aspect, then crop center to exact width if needed
    const scaleFilter = `scale='if(gt(a,${arW/arH}),-2,${targetWidth})':'if(gt(a,${arW/arH}),${targetHeight},-2)'`;
    const cropFilter = `crop=${targetWidth}:${targetHeight}`;
    const vf = `${scaleFilter},${cropFilter}`;

    const ffmpegArgs = [
      '-y',
      '-i', videoPath,
      '-vf', vf,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', String(crf),
      '-c:a', 'aac',
      '-b:a', '128k',
      outputPath
    ];

    const ff = spawn('ffmpeg', ffmpegArgs);

    // handle spawn errors (ENOENT etc.) to avoid unhandled exceptions
    ff.on('error', (err) => {
      return reject(new Error(`Failed to start ffmpeg: ${err.message}. Please ensure ffmpeg is installed and on PATH.`));
    });

    let stderr = '';
    ff.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ff.on('close', (code) => {
      if (code === 0) {
        resolve(`Output: ${outputPath}`);
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--image') {
    const imagePath = args[1];
    const conversionType = args[2];
    const webpFlag = args.includes('--webp');
    let result;
    try {
      switch (conversionType) {
        case 'webp':
          result = await convertImageToWebp(imagePath);
          break;
        case 'square700':
          result = await convertToSquare700(imagePath, webpFlag);
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
          result = await resizeToSpecificWidth(imagePath, width, webpFlag);
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
          
          result = await resizeToSpecificHeight(imagePath, height, webpFlag);
          break;
        case 'aspect-ratio':
          const aspectRatio = args[3];
          if (!aspectRatio) {
            throw new Error('Aspect ratio not provided');
          }
          result = await convertToAspectRatio(imagePath, aspectRatio, webpFlag);
          break;
        case 'jpg':
          result = await convertToJpg(imagePath);
          break;
        case 'square300':
          result = await convertToSquare300(imagePath, webpFlag);
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
  } else if (args[0] === '--video') {
    // args: --video <path> <aspectRatio> <resolution> <compression>
    const videoPath = args[1];
    const aspectRatio = args[2] || '16:9';
    const resolution = args[3] || '720p';
    const compression = args[4] || 'medium';

    try {
      const result = await convertVideo(videoPath, aspectRatio, resolution, compression);
      console.log(result);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  } else {
    console.error('Invalid arguments. Use --image <path> <conversionType> or --folder <path>');
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});

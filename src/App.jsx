import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import './App.css';
import ImageOverlayModal from './ImageOverlayModal';

function App() {
  const [status, setStatus] = useState('Ready to optimize images');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(800);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fileList, setFileList] = useState('');
  const [markdownText, setMarkdownText] = useState('');
  const [convertToWebP, setConvertToWebP] = useState(true);

  const handleConversion = async (type, conversionType) => {
    try {
      setIsLoading(true);
      const selected = await open({
        multiple: false,
        directory: type === 'folder',
        filters: type === 'image'
          ? [{ name: 'Images', extensions: ['avif','jpg', 'jpeg', 'png', 'webp'] }]
          : undefined,
      });

      if (!selected) {
        setIsLoading(false);
        return;
      }

      setStatus('Converting...');
      const payload = {
        imagePath: selected,
        conversionType,
        targetWidth: null,
        targetHeight: null,
        aspectRatio: null,
        convertToWebP: convertToWebP && ['resize', 'resize-height', 'square700', 'square300', 'aspect-ratio'].includes(conversionType)
      };

      if (conversionType === 'resize') {
        payload.targetWidth = targetWidth.toString();
      } else if (conversionType === 'resize-height') {
        if (!targetHeight || parseInt(targetHeight, 10) <= 0) {
          setStatus('Error: Invalid target height value');
          setIsLoading(false);
          return;
        }
        payload.targetHeight = targetHeight.toString();
      } else if (conversionType === 'aspect-ratio') {
        payload.aspectRatio = aspectRatio;
      }

      console.log('Sending payload:', payload);
      const response = await invoke('convert_image', payload);
      setStatus(response);
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlay = async (baseImage, overlayImage, overlayOption) => {
    try {
      setIsLoading(true);
      setStatus('Overlaying images...');
      const response = await invoke('overlay_image', { baseImagePath: baseImage, overlayImagePath: overlayImage, overlayOption });
      setStatus(response);
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAspectRatioConversion = async () => {
    try {
      setIsLoading(true);
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
      });

      if (selected) {
        setStatus('Converting aspect ratio...');
        const response = await invoke('convert_image', { 
          imagePath: selected, 
          conversionType: 'aspect-ratio',
          aspectRatio: aspectRatio,
          convertToWebP: convertToWebP
        });
        setStatus(response);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListFiles = async () => {
    try {
      setIsLoading(true);
      const selected = await open({
        multiple: false,
        directory: true,
      });

      if (!selected) {
        setIsLoading(false);
        return;
      }

      setStatus('Listing files...');
      const response = await invoke('list_files', { folderPath: selected });
      setFileList(response);
      setStatus('Files listed successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
      setFileList('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkdownToText = async () => {
    try {
      setIsLoading(true);
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      });

      if (!selected) {
        setIsLoading(false);
        return;
      }

      setStatus('Converting markdown...');
      const response = await invoke('convert_markdown', { markdownPath: selected });
      setMarkdownText(response);
      setStatus('Markdown converted successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
      setMarkdownText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Image Optimizer Pro</h1>
        <p>Professional image processing and optimization tools</p>
      </header>

      <main className="main-content">
        {/* Format Conversion Tools */}
        <section className="tools-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Format Conversion
          </h2>
          <div className="tools-grid">
            <div className="tool-card">
              <h3>WebP Conversion</h3>
              <p>Convert images to modern WebP format for better compression</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'webp')} disabled={isLoading}>
                  {isLoading ? <span className="loading"></span> : null}
                  Convert to WebP
                </button>
                <button onClick={() => handleConversion('folder', 'webp')} disabled={isLoading}>
                  Convert Folder to WebP
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>JPG Conversion</h3>
              <p>Convert images to JPG format with quality optimization</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'jpg')} disabled={isLoading}>
                  Convert to JPG
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>ICO Conversion</h3>
              <p>Create favicon and icon files from your images</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'ico')} disabled={isLoading}>
                  Convert to ICO
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>PNG Thumbnails</h3>
              <p>Generate 100x100 PNG thumbnails with center cropping</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'png100')} disabled={isLoading}>
                  Create 100x100 PNG
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Size & Dimension Tools */}
        <section className="tools-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Size & Dimensions
          </h2>
          
          {/* Global WebP Conversion Option */}
          <div className="webp-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={convertToWebP}
                onChange={(e) => setConvertToWebP(e.target.checked)}
                className="webp-checkbox"
              />
              <span className="checkmark"></span>
              Convert to WebP format during resize operations
            </label>
          </div>

          <div className="tools-grid">
            <div className="tool-card">
              <h3>Square Formats</h3>
              <p>Perfect for social media and profile pictures</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'square700')} disabled={isLoading}>
                  700px Square{convertToWebP ? ' → WebP' : ''}
                </button>
                <button onClick={() => handleConversion('image', 'square300')} disabled={isLoading}>
                  300px Square{convertToWebP ? ' → WebP' : ''}
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>Web Optimized</h3>
              <p>Standard web dimensions for optimal loading</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'width1600')} disabled={isLoading}>
                  1600px Width
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>Custom Width</h3>
              <p>Resize to specific width while maintaining aspect ratio</p>
              <div className="tool-controls">
                <div className="control-row">
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(e.target.value)}
                    min="1"
                    placeholder="Width in pixels"
                  />
                  <button onClick={() => handleConversion('image', 'resize')} disabled={isLoading}>
                    Resize Width{convertToWebP ? ' → WebP' : ''}
                  </button>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <h3>Custom Height</h3>
              <p>Resize to specific height while maintaining aspect ratio</p>
              <div className="tool-controls">
                <div className="control-row">
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(parseInt(e.target.value, 10))}
                    min="1"
                    placeholder="Height in pixels"
                  />
                  <button onClick={() => handleConversion('image', 'resize-height')} disabled={isLoading}>
                    Resize Height{convertToWebP ? ' → WebP' : ''}
                  </button>
                </div>
              </div>
            </div>

            <div className="tool-card">
              <h3>Aspect Ratio</h3>
              <p>Convert images to specific aspect ratios</p>
              <div className="tool-controls">
                <div className="control-row">
                  <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="3:2">3:2 (Photography)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="2:1">2:1 (Panoramic)</option>
                    <option value="1:2">1:2 (Portrait)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                    <option value="5:3">5:3 (Wide)</option>
                  </select>
                  <button onClick={handleAspectRatioConversion} disabled={isLoading}>
                    Convert Ratio{convertToWebP ? ' → WebP' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Effects & Processing */}
        <section className="tools-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Effects & Processing
          </h2>
          <div className="tools-grid">
            <div className="tool-card">
              <h3>Grayscale Conversion</h3>
              <p>Convert images to black and white with brightness enhancement</p>
              <div className="tool-controls">
                <button onClick={() => handleConversion('image', 'grayscale')} disabled={isLoading}>
                  Convert to Grayscale
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>Image Overlay</h3>
              <p>Add watermarks, logos, or decorative elements to your images</p>
              <div className="tool-controls">
                <button onClick={() => setShowModal(true)} disabled={isLoading}>
                  Open Overlay Tool
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Utility Tools */}
        <section className="tools-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Utility Tools
          </h2>
          <div className="tools-grid">
            <div className="tool-card">
              <h3>File Explorer</h3>
              <p>List and explore files in any directory</p>
              <div className="tool-controls">
                <button onClick={handleListFiles} disabled={isLoading}>
                  List Files in Folder
                </button>
              </div>
            </div>

            <div className="tool-card">
              <h3>Markdown Converter</h3>
              <p>Convert Markdown files to plain text</p>
              <div className="tool-controls">
                <button onClick={handleMarkdownToText} disabled={isLoading}>
                  Convert Markdown
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="status-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Status
          </h2>
          <div className={`status ${status.includes('Error') ? 'error' : status.includes('Success') ? 'success' : ''}`}>
            {isLoading && <span className="loading"></span>}
            {status}
          </div>
        </section>
      </main>

      {/* Modal */}
      {showModal && <ImageOverlayModal onClose={() => setShowModal(false)} onOverlay={handleOverlay} />}

      {/* Output Sections */}
      {fileList && (
        <section className="output-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            File List
          </h2>
          <div className="output-content">
            <textarea
              readOnly
              value={fileList}
              onClick={(e) => e.target.select()}
            />
          </div>
        </section>
      )}

      {markdownText && (
        <section className="output-section">
          <h2 className="section-title">
            <div className="section-icon"></div>
            Converted Text
          </h2>
          <div className="output-content">
            <textarea
              readOnly
              value={markdownText}
              onClick={(e) => e.target.select()}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default App;

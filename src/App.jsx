import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import './App.css';
import ImageOverlayModal from './ImageOverlayModal';

function App() {
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(800);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fileList, setFileList] = useState('');
  const [markdownText, setMarkdownText] = useState('');

  const handleConversion = async (type, conversionType) => {
    try {
      const selected = await open({
        multiple: false,
        directory: type === 'folder',
        filters: type === 'image'
          ? [{ name: 'Images', extensions: ['avif','jpg', 'jpeg', 'png', 'webp'] }]
          : undefined,
      });

      if (!selected) return;

      setStatus('Converting...');
      const payload = {
        imagePath: selected,
        conversionType,
        targetWidth: null,
        targetHeight: null,
        aspectRatio: null
      };

      if (conversionType === 'resize') {
        payload.targetWidth = targetWidth.toString();
      } else if (conversionType === 'resize-height') {
        if (!targetHeight || parseInt(targetHeight, 10) <= 0) {
          setStatus('Error: Invalid target height value');
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
    }
  };

  const handleOverlay = async (baseImage, overlayImage, overlayOption) => {
    try {
      setStatus('Overlaying...');
      const response = await invoke('overlay_image', { baseImagePath: baseImage, overlayImagePath: overlayImage, overlayOption });
      setStatus(response);
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleAspectRatioConversion = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
      });

      if (selected) {
        setStatus('Converting...');
        const response = await invoke('convert_image', { 
          imagePath: selected, 
          conversionType: 'aspect-ratio',
          aspectRatio: aspectRatio
        });
        setStatus(response);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const handleListFiles = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
      });

      if (!selected) return;

      setStatus('Listing files...');
      const response = await invoke('list_files', { folderPath: selected });
      setFileList(response);
      setStatus('Files listed successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
      setFileList('');
    }
  };

  const handleMarkdownToText = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      });

      if (!selected) return;

      setStatus('Converting markdown...');
      const response = await invoke('convert_markdown', { markdownPath: selected });
      setMarkdownText(response);
      setStatus('Markdown converted successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
      setMarkdownText('');
    }
  };

  return (
    <div className="App">
      <h1>Image Optimizer</h1>
      <div className="button-container">
        <button onClick={handleListFiles}>List Files in Folder</button>
        <button onClick={() => setShowModal(true)}>Overlay Image</button>
        <button onClick={() => handleConversion('image', 'webp')}>Convert to WebP</button>
        <button onClick={() => handleConversion('image', 'square700')}>700px Square</button>
        <button onClick={() => handleConversion('image', 'square300')}>300px Square</button>
        <button onClick={() => handleConversion('image', 'width1600')}>1600px Width</button>
        <button onClick={() => handleConversion('image', 'ico')}>Convert to ICO</button>
        <button onClick={() => handleConversion('image', 'png100')}>100x100 PNG</button>
        <button onClick={() => handleConversion('image', 'grayscale')}>Convert to Gray-Scale</button>
        <button onClick={() => handleConversion('folder', 'webp')}>Convert Folder</button>
        <button onClick={() => handleConversion('image', 'jpg')}>Convert to JPG</button>
        <button onClick={() => handleConversion('image', 'resize')}>
            Resize to {targetWidth}px Width
          </button>
          <input
            type="number"
            value={targetWidth}
            onChange={(e) => setTargetWidth(e.target.value)}
            min="1"
          />
      
        <button onClick={() => {
            console.log('Current height value:', targetHeight);
            handleConversion('image', 'resize-height');
          }}>
            Resize to {targetHeight}px Height
          </button>
          <input
            type="number"
            value={targetHeight}
            onChange={(e) => {
              console.log('New height value:', e.target.value);
              setTargetHeight(parseInt(e.target.value, 10));
            }}
            min="1"
          />
        <div className="aspect-ratio-container">
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="16:9">16:9</option>
            <option value="3:2">3:2</option>
            <option value="2:1">2:1</option>
            <option value="1:2">1:2</option>
            <option value="3:4">3:4</option>
            <option value="4:3">4:3</option>
            <option value="5:3">5:3</option>
          </select>
          <button onClick={handleAspectRatioConversion}>Convert to Aspect Ratio</button>
        </div>
        <button onClick={handleMarkdownToText}>Convert Markdown to Text</button>
      </div>
      {showModal && <ImageOverlayModal onClose={() => setShowModal(false)} onOverlay={handleOverlay} />}
      <div className="status">{status}</div>
      {fileList && (
        <div className="file-list">
          <textarea
            readOnly
            value={fileList}
            onClick={(e) => e.target.select()}
            style={{
              width: '100%',
              minHeight: '200px',
              marginTop: '20px',
              padding: '10px',
            }}
          />
        </div>
      )}
      {markdownText && (
        <div className="markdown-output">
          <textarea
            readOnly
            value={markdownText}
            onClick={(e) => e.target.select()}
            style={{
              width: '100%',
              minHeight: '200px',
              marginTop: '20px',
              padding: '10px',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;

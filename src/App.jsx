import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import './App.css';
import ImageOverlayModal from './ImageOverlayModal';

function App() {
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [targetWidth, setTargetWidth] = useState(800);

  const handleConversion = async (type, conversionType) => {
    try {
      const selected = await open({
        multiple: false,
        directory: type === 'folder',
        filters: type === 'image' ? [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }] : undefined,
      });

      if (selected) {
        setStatus('Converting...');
        const response = await invoke('convert_image', { 
          imagePath: selected, 
          conversionType,
          targetWidth: conversionType === 'resize' ? targetWidth.toString() : undefined
        });
        setStatus(response);
      }
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

  return (
    <div className="App">
      <h1>Image Optimizer</h1>
      <div className="button-container">
        <button onClick={() => setShowModal(true)}>Overlay Image</button>
        <button onClick={() => handleConversion('image', 'webp')}>Convert to WebP</button>
        <button onClick={() => handleConversion('image', 'square700')}>700px Square</button>
        <button onClick={() => handleConversion('image', 'width1600')}>1600px Width</button>
        <button onClick={() => handleConversion('image', 'ico')}>Convert to ICO</button>
        <button onClick={() => handleConversion('image', 'png100')}>100x100 PNG</button>
        <button onClick={() => handleConversion('image', 'grayscale')}>Convert to Gray-Scale</button>
        <button onClick={() => handleConversion('folder', 'webp')}>Convert Folder</button>
        <div className="resize-container">
          <input
            type="number"
            value={targetWidth}
            onChange={(e) => setTargetWidth(e.target.value)}
            min="1"
          />
          <button onClick={() => handleConversion('image', 'resize')}>
            Resize to {targetWidth}px Width
          </button>
        </div>
      </div>
      {showModal && <ImageOverlayModal onClose={() => setShowModal(false)} onOverlay={handleOverlay} />}
      <div className="status">{status}</div>
    </div>
  );
}

export default App;

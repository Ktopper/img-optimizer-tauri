import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';

function ImageOverlayModal({ onClose, onOverlay }) {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayOption, setOverlayOption] = useState('center');

  const selectBaseImage = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
    });
    setBaseImage(selected);
  };
  
  const selectOverlayImage = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Images', extensions: ['png'] }],
    });
    setOverlayImage(selected);
  };

  const handleOverlay = () => {
    if (baseImage && overlayImage) {
      onOverlay(baseImage, overlayImage, overlayOption);
      onClose();
    }
  };

  const getFileName = (path) => {
    if (!path) return '';
    return path.split('/').pop() || path.split('\\').pop() || path;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Image Overlay Tool</h2>
        
        <div className="control-row">
          <button onClick={selectBaseImage} className="secondary">
            Select Base Image
          </button>
        </div>
        {baseImage && (
          <div className="file-path">
            📷 {getFileName(baseImage)}
          </div>
        )}
        
        <div className="control-row">
          <button onClick={selectOverlayImage} className="secondary">
            Select Overlay Image
          </button>
        </div>
        {overlayImage && (
          <div className="file-path">
            🖼️ {getFileName(overlayImage)}
          </div>
        )}
        
        <div className="control-row">
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Overlay Position:
          </label>
          <select value={overlayOption} onChange={(e) => setOverlayOption(e.target.value)}>
            <option value="center">Center</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="tile">Tile</option>
            <option value="stretch">Stretch to Fit</option>
          </select>
        </div>
        
        <div className="control-row" style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={handleOverlay} 
            disabled={!baseImage || !overlayImage}
            className="success"
          >
            Apply Overlay
          </button>
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageOverlayModal;
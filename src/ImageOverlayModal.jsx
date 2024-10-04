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
    }
  };

  return (
    <div className="modal">
      <h2>Select Images for Overlay</h2>
      <button onClick={selectBaseImage}>Select Base Image</button>
      {baseImage && <p>Base Image: {baseImage}</p>}
      <button onClick={selectOverlayImage}>Select Overlay Image</button>
      {overlayImage && <p>Overlay Image: {overlayImage}</p>}
      <select value={overlayOption} onChange={(e) => setOverlayOption(e.target.value)}>
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="tile">Tile</option>
        <option value="stretch">Stretch</option>
      </select>
      <button onClick={handleOverlay}>Apply Overlay</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default ImageOverlayModal;
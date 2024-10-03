import React, { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';

function ImageOverlayModal({ onClose, onOverlay }) {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);

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
      onOverlay(baseImage, overlayImage);
    }
  };

  return (
    <div className="modal">
      <h2>Select Images for Overlay</h2>
      <button onClick={selectBaseImage}>Select Base Image</button>
      {baseImage && <p>Base Image: {baseImage}</p>}
      <button onClick={selectOverlayImage}>Select Overlay Image</button>
      {overlayImage && <p>Overlay Image: {overlayImage}</p>}
      <button onClick={handleOverlay}>Apply Overlay</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default ImageOverlayModal;
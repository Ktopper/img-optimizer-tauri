import React, { useRef, useState, useEffect } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { convertFileSrc } from '@tauri-apps/api/tauri';

function parseAspect(aspect) {
  if (!aspect || aspect === 'free') return null;
  const parts = aspect.split(':').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  return parts[0] / parts[1];
}

function ImageCropModal({ onClose, initialImagePath = null }) {
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [imgNatural, setImgNatural] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [imgRect, setImgRect] = useState(null);

  // crop in image pixels
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const [aspectPreset, setAspectPreset] = useState('16:9');
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(450);

  useEffect(() => {
  if (!imagePath) return;
  const img = new Image();
  img.onload = () => {
      setImgNatural({ width: img.naturalWidth, height: img.naturalHeight });
      // initialize crop to center with aspect
      const aspect = parseAspect(aspectPreset);
      let w = img.naturalWidth * 0.8;
      let h = img.naturalHeight * 0.8;
      if (aspect) {
        if (w / h > aspect) {
          w = Math.round(h * aspect);
        } else {
          h = Math.round(w / aspect);
        }
      }
      setCrop({ x: Math.round((img.naturalWidth - w) / 2), y: Math.round((img.naturalHeight - h) / 2), w: Math.round(w), h: Math.round(h) });
      setTargetWidth(Math.round(w));
      setTargetHeight(Math.round(h));
      // measure displayed rect after load (small timeout to ensure render)
      setTimeout(() => {
        if (imgRef.current && containerRef.current) {
          const imgR = imgRef.current.getBoundingClientRect();
          const contR = containerRef.current.getBoundingClientRect();
          setImgRect({ left: imgR.left - contR.left, top: imgR.top - contR.top, width: imgR.width, height: imgR.height });
        }
      }, 50);
    };
    const makeSrc = (p) => {
      if (!p) return p;
      if (p.startsWith('data:') || p.startsWith('http') || p.startsWith('blob:')) return p;
      try { return convertFileSrc(p); } catch (e) { return p.startsWith('/') ? `file://${p}` : p; }
    };
    img.src = makeSrc(imagePath);
  }, [imagePath, aspectPreset]);

  // respond to external initialImagePath changes
  useEffect(() => {
    if (initialImagePath) setImagePath(initialImagePath);
  }, [initialImagePath]);

  useEffect(() => {
    const onResize = () => {
      if (imgRef.current && containerRef.current) {
        const imgR = imgRef.current.getBoundingClientRect();
        const contR = containerRef.current.getBoundingClientRect();
        setImgRect({ left: imgR.left - contR.left, top: imgR.top - contR.top, width: imgR.width, height: imgR.height });
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectImage = async () => {
    const selected = await open({ multiple: false, filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'] }] });
    if (selected) setImagePath(selected);
  };

  const makeDisplaySrc = (p) => {
    if (!p) return null;
    if (p.startsWith('data:') || p.startsWith('http') || p.startsWith('blob:')) return p;
    try { return convertFileSrc(p); } catch (e) { return p.startsWith('/') ? `file://${p}` : p; }
  };

  // helpers to map client coords to natural image pixels
  const clientToImage = (clientX, clientY) => {
    const imgEl = imgRef.current;
    if (!imgEl) return { x: 0, y: 0 };
    const rect = imgEl.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const sx = relX / rect.width;
    const sy = relY / rect.height;
    return { x: Math.round(sx * imgNatural.width), y: Math.round(sy * imgNatural.height) };
  };

  const onMouseDownCrop = (e) => {
    if (!imagePath) return;
    e.preventDefault();
    const start = clientToImage(e.clientX, e.clientY);
    dragRef.current = { startClient: start, origCrop: { ...crop }, type: 'move' };
    setDragging(true);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const pos = clientToImage(e.clientX, e.clientY);
    const dX = pos.x - dragRef.current.startClient.x;
    const dY = pos.y - dragRef.current.startClient.y;
    if (dragRef.current.type === 'move') {
      const nx = Math.max(0, Math.min(imgNatural.width - crop.w, dragRef.current.origCrop.x + dX));
      const ny = Math.max(0, Math.min(imgNatural.height - crop.h, dragRef.current.origCrop.y + dY));
      setCrop((c) => ({ ...c, x: nx, y: ny }));
    }
  };

  const onMouseUp = () => {
    setDragging(false);
    dragRef.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const applyAspectPreset = (preset) => {
    setAspectPreset(preset);
    if (!imgNatural.width) return;
    const aspect = parseAspect(preset);
    let w = crop.w; let h = crop.h;
    if (aspect) {
      if (w / h > aspect) {
        w = Math.round(h * aspect);
      } else {
        h = Math.round(w / aspect);
      }
    }
    setCrop((c) => ({ ...c, w, h, x: Math.max(0, Math.min(imgNatural.width - w, c.x)), y: Math.max(0, Math.min(imgNatural.height - h, c.y)) }));
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const drawPreview = () => {
    if (!imagePath || !imgNatural.width) return;
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth || crop.w;
    canvas.height = targetHeight || crop.h;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
    };
    img.src = imagePath;
  };

  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop, targetWidth, targetHeight, imagePath]);

  const exportCropped = () => {
    if (!imagePath) return;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth || crop.w;
    canvas.height = targetHeight || crop.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crop_${targetWidth}x${targetHeight}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = imagePath;
  };

  const getFileName = (path) => {
    if (!path) return '';
    return path.split('/').pop() || path.split('\\').pop() || path;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '980px', width: '95%' }}>
        <h2>Crop & Resize Preview</h2>

        <div className="control-row">
          <button onClick={selectImage} className="secondary">Select Image</button>
          <div style={{ flex: 1 }} />
          <label style={{ color: 'var(--text-secondary)' }}>Aspect Preset</label>
          <select value={aspectPreset} onChange={(e) => applyAspectPreset(e.target.value)}>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="3:2">3:2</option>
            <option value="1:1">1:1</option>
            <option value="free">Free</option>
          </select>
        </div>

        {imagePath && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-start' }}>
            <div ref={containerRef} style={{ flex: 1, minHeight: '320px', position: 'relative', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                ref={imgRef}
                src={makeDisplaySrc(imagePath) || ''}
                alt="To crop"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onLoad={() => {
                  if (imgRef.current && containerRef.current) {
                    const imgR = imgRef.current.getBoundingClientRect();
                    const contR = containerRef.current.getBoundingClientRect();
                    setImgRect({ left: imgR.left - contR.left, top: imgR.top - contR.top, width: imgR.width, height: imgR.height });
                  }
                }}
              />

              {/* overlay crop rectangle positioned using percentage of natural image */}
              {imgNatural.width > 0 && (
                <div
                  className="crop-area"
                  onMouseDown={onMouseDownCrop}
                  style={{
                    // compute style based on image display rect
                    position: 'absolute',
                    boxSizing: 'border-box',
                    border: '2px dashed var(--accent-primary)',
                    background: 'rgba(59,130,246,0.08)',
                    cursor: 'move',
                    // position/size mapping from natural pixels -> displayed image
                    left: imgRect ? `${(crop.x / imgNatural.width) * imgRect.width + imgRect.left}px` : '0px',
                    top: imgRect ? `${(crop.y / imgNatural.height) * imgRect.height + imgRect.top}px` : '0px',
                    width: imgRect ? `${(crop.w / imgNatural.width) * imgRect.width}px` : '100px',
                    height: imgRect ? `${(crop.h / imgNatural.height) * imgRect.height}px` : '100px'
                  }}
                />
              )}
            </div>

            <div style={{ width: '360px' }}>
              <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Preview</div>
              <canvas id="preview-canvas" style={{ width: '100%', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }} />

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <input type="number" value={targetWidth} onChange={(e) => setTargetWidth(parseInt(e.target.value || '0', 10))} min={1} />
                <input type="number" value={targetHeight} onChange={(e) => setTargetHeight(parseInt(e.target.value || '0', 10))} min={1} />
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportCropped} className="success">Export Cropped Image</button>
                <button onClick={onClose} className="secondary">Close</button>
              </div>

              <div className="file-path" style={{ marginTop: '0.75rem' }}>📁 {getFileName(imagePath)}</div>
            </div>
          </div>
        )}

        {!imagePath && (
          <div style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No image selected — click Select Image to open a file.</div>
        )}
      </div>
    </div>
  );
}

export default ImageCropModal;

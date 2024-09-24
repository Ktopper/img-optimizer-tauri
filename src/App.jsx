import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

function App() {
  const [status, setStatus] = React.useState('');

  const handleConversion = async (type) => {
    try {
      const selected = await open({
        multiple: false,
        directory: type === 'folder',
        filters: type === 'image' ? [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }] : undefined,
      });

      if (selected) {
        setStatus('Converting...');
        const response = await invoke('convert_image', { imagePath: selected });
        setStatus(response);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="App">
      <h1>Image Optimizer</h1>
      <button onClick={() => handleConversion('image')}>Convert Single Image to WebP</button>
      <button onClick={() => handleConversion('folder')}>Convert Folder to WebP</button>
      <p>{status}</p>
    </div>
  );
}

export default App;

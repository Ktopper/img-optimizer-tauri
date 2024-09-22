import React from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

function App() {
  const [status, setStatus] = React.useState('');

  // Function to pick a single image
  const handleImagePick = async () => {
    const selectedFile = await open({
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }],
    });

    if (selectedFile) {
      invoke('convert_image', { imagePath: selectedFile })
        .then((response) => setStatus(response))
        .catch((error) => setStatus('Error: ' + error));
    }
  };

  // Function to pick a folder of images
  const handleFolderPick = async () => {
    const selectedFolder = await open({
      directory: true,
    });

    if (selectedFolder) {
      invoke('convert_image', { imagePath: selectedFolder })
        .then((response) => setStatus(response))
        .catch((error) => setStatus('Error: ' + error));
    }
  };

  return (
    <div className="App">
      <h1>Image Optimizer</h1>
      <button onClick={handleImagePick}>Convert Single Image to WebP</button>
      <button onClick={handleFolderPick}>Convert Folder to WebP</button>
      <p>{status}</p>
    </div>
  );
}

export default App;

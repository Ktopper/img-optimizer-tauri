import { invoke } from '@tauri-apps/api/tauri';

export const convertImage = async (imagePath) => {
  return await invoke('convert_image', { imagePath });
};

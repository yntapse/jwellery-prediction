const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const uploadImageForRecommendation = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post('/recommend', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to get recommendations');
    } else if (error.request) {
      throw new Error('No response from server. Make sure the backend is running.');
    } else {
      throw new Error(error.message);
    }
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend is not available');
  }
};

export const buildImageUrl = (imagePath) => {
  if (!imagePath) return '';

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const normalizedPath = imagePath.replace(/\\/g, '/');

  if (normalizedPath.startsWith('/images/')) {
    return `${API_URL}${normalizedPath}`;
  }

  const filename = normalizedPath.split('/').pop();
  return `${API_URL}/images/${filename}`;
};

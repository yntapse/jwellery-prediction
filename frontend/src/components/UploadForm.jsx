import React, { useState } from 'react';

const UploadForm = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-indigo-50'
              : 'border-gray-300 hover:border-primary'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12l-3.172-3.172a4 4 0 00-5.656 0L28 12m0 0l3.172-3.172a4 4 0 014.656 0L40 12M12 24l5.466-5.466a4 4 0 015.656 5.656L12 40"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-4 text-lg text-gray-700">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop your dress image
          </p>
          <p className="mt-2 text-sm text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="file-input"
            disabled={isLoading}
          />
          <label
            htmlFor="file-input"
            className="mt-6 inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
          >
            Browse Files
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Dress</h3>
            {!isLoading && (
              <button
                onClick={clearPreview}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Change Image
              </button>
            )}
          </div>

          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-contain rounded-lg mb-6 bg-gray-100"
          />

          {isLoading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-4 text-gray-600">Processing your image...</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">✕ {error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;

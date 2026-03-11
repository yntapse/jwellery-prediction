import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import ResultsGrid from './components/ResultsGrid';
import { uploadImageForRecommendation, healthCheck } from './api';
import './App.css';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await healthCheck();
      setBackendReady(true);
      setError(null);
    } catch (err) {
      setBackendReady(false);
      setError('Backend server is not running. Please start it with: uvicorn main:app --reload');
    }
  };

  const handleUpload = async (file) => {
    if (!backendReady) {
      setError('Backend server is not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await uploadImageForRecommendation(file);
      setResults(data.recommended_necklaces);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-800">
                AI Jewellery Stylist
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  backendReady
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span
                  className={`inline-flex w-2 h-2 rounded-full mr-2 ${
                    backendReady ? 'bg-green-400' : 'bg-red-400'
                  }`}
                ></span>
                {backendReady ? 'Backend Ready' : 'Backend Offline'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            Upload a dress image and discover the perfect necklace to match
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="text-red-700">
              <span className="font-semibold">Error:</span> {error}
            </p>
            {!backendReady && (
              <button
                onClick={checkBackendHealth}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Retry Connection
              </button>
            )}
          </div>
        )}

        {/* Upload Section */}
        <section className="mb-16">
          <UploadForm onUpload={handleUpload} isLoading={isLoading} />
        </section>

        {/* Results Section */}
        {results && (
          <section className="mb-8">
            <ResultsGrid results={results} isLoading={isLoading} />
          </section>
        )}

        {/* Feature Cards */}
        {!results && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Your Dress
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose an image of your dress from your device
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Our AI model analyzes colors, patterns, and style
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Get Recommendations
                </h3>
                <p className="text-gray-600 text-sm">
                  Discover your top 5 matching necklaces instantly
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            © 2024 AI Jewellery Recommendation System. Powered by OpenCLIP &
            FAISS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

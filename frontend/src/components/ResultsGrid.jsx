import React from 'react';
import { buildImageUrl } from '../api';

const ResultsGrid = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        ✨ Top 5 Recommended Necklaces
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {results.map((imagePath, index) => {
          const filename = imagePath.split(/[\\/]/).pop();
          return (
            <div
              key={index}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                <div className="absolute top-2 left-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                <img
                  src={buildImageUrl(imagePath)}
                  alt={`Necklace ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E';
                    e.target.className = 'w-12 h-12 text-gray-300';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <p className="text-sm font-medium text-gray-700 truncate" title={filename}>
                  {filename}
                </p>
                <p className="text-xs text-gray-500 mt-1">Match #{index + 1}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 text-sm">
          These necklaces are recommended based on visual similarity to your dress
        </p>
      </div>
    </div>
  );
};

export default ResultsGrid;

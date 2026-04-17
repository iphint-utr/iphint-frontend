'use client';

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { Upload, Link as LinkIcon, Search, RefreshCw, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../../../../lib/store/store'; // Adjust based on your store path
import { performScan, clearResults } from '../../../../lib/store/slices/scanSlice'; // Adjust based on your slice path

export default function ScanPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading, error } = useSelector((state: RootState) => state.scan);
  
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUrl(''); // Clear URL if a file is uploaded
      dispatch(performScan(file));
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  // Handle URL search
  const handleUrlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      setPreview(url);
      dispatch(performScan(url));
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUrl('');
    dispatch(clearResults());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Image Scan</h1>
        <p className="text-gray-500">Upload an image or paste a URL to search for matches across the web.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search Inputs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Drag & Drop Area */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
              ${loading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP up to 10MB</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* URL Input */}
          <form onSubmit={handleUrlSearch} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500 text-sm"
                placeholder="Paste image URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Image
            </button>
          </form>

          {/* Current Preview */}
          {preview && (
            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Source</span>
                <button onClick={handleReset} className="text-xs text-red-500 hover:underline">Clear</button>
              </div>
              <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-lg bg-gray-50" />
            </div>
          )}
        </div>

        {/* Right Column: Results Table */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 text-lg">Search Results</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {results.length} Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Engine</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Searching for matches...</p>
                      </td>
                    </tr>
                  ) : results.length > 0 ? (
                    results.map((result: any, index: number) => (
                      <tr key={result._id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {result.image ? (
                            <img 
                              src={result.image} 
                              alt="Result" 
                              className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 min-w-[280px]">
                          <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {result.details?.title || 'No title'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold text-[10px]">Source</span>
                            {result.details?.source || 'Website'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                            Reverse Search
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {result.details?.link && (
                            <a 
                              href={result.details.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Visit Site <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No scan results to display.</p>
                        <p className="text-xs mt-1">Start by uploading an image on the left.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
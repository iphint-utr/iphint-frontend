'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Link as LinkIcon,
  Search,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  X,
  FolderPlus,
  Check,
  LayoutGrid,
  List,
  Lock,
} from 'lucide-react';
import { AppDispatch, RootState } from '../../../lib/store/store'; // Adjust based on your store path
import {
  performScan,
  clearResults,
  fetchFolders,
  createFolder,
  assignSearchFolder,
  setCurrentFolderId,
} from '../../../lib/store/slices/scanSlice'; // Adjust based on your slice path

export default function ScanPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading, error, searchId, folders, currentFolderId, foldersLoading } = useSelector(
    (state: RootState) => state.scan,
  );
  
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [previewResultIndex, setPreviewResultIndex] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderPanelOpen, setFolderPanelOpen] = useState(false);
  const [folderNotice, setFolderNotice] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [planSnapshot, setPlanSnapshot] = useState<any>(null);
  const [planPromptOpen, setPlanPromptOpen] = useState(false);
  const [planPromptMode, setPlanPromptMode] = useState<'upgrade' | 'renew' | 'near_limit'>('upgrade');
  const [hasShownNearLimitPrompt, setHasShownNearLimitPrompt] = useState(false);

  const isLimitError = typeof error === 'string' && /upload limit|plan_upload_limit_reached/i.test(error);

  const openPlanPrompt = (mode: 'upgrade' | 'renew' | 'near_limit') => {
    setPlanPromptMode(mode);
    setPlanPromptOpen(true);
  };

  const loadPlanSnapshot = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/v1/billing/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setPlanSnapshot(data || null);
    } catch {
      setPlanSnapshot(null);
    }
  }, []);

  const evaluateActionAgainstPlan = () => {
    if (!planSnapshot) return true;

    const status = planSnapshot?.subscription?.status;
    const used = Number(planSnapshot?.usage?.imagesUsedThisMonth || 0);
    const limit = Number(planSnapshot?.usage?.imageUploadLimit || 0);

    if (status === 'cancelled' || status === 'expired') {
      openPlanPrompt('renew');
    }

    if (limit > 0 && used >= limit) {
      openPlanPrompt('upgrade');
      return false;
    }

    if (limit > 0 && limit - used <= 1) {
      openPlanPrompt('near_limit');
    }

    return true;
  };

  useEffect(() => {
    dispatch(fetchFolders());
    loadPlanSnapshot();
  }, [dispatch, loadPlanSnapshot]);

  useEffect(() => {
    if (!searchId) return;
    loadPlanSnapshot();
  }, [searchId, loadPlanSnapshot]);

  useEffect(() => {
    if (!planSnapshot || hasShownNearLimitPrompt) return;

    const status = planSnapshot?.subscription?.status;
    const used = Number(planSnapshot?.usage?.imagesUsedThisMonth || 0);
    const limit = Number(planSnapshot?.usage?.imageUploadLimit || 0);

    if (status === 'cancelled' || status === 'expired') {
      openPlanPrompt('renew');
      setHasShownNearLimitPrompt(true);
      return;
    }

    if (limit > 0 && used / limit >= 0.8 && used < limit) {
      openPlanPrompt('near_limit');
      setHasShownNearLimitPrompt(true);
    }
  }, [planSnapshot, hasShownNearLimitPrompt]);

  useEffect(() => {
    if (!folderNotice) return;

    const timer = window.setTimeout(() => {
      setFolderNotice('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [folderNotice]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!evaluateActionAgainstPlan()) return;
      setPreview(URL.createObjectURL(file));
      setUrl(''); // Clear URL if a file is uploaded
      dispatch(performScan(file));
    }
  }, [dispatch, planSnapshot]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  // Handle URL search
  const handleUrlSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      if (!evaluateActionAgainstPlan()) return;
      setPreview(url);
      dispatch(performScan(url));
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUrl('');
    setPreviewResultIndex(null);
    dispatch(clearResults());
  };

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const action = await dispatch(createFolder(trimmed));
    if (createFolder.fulfilled.match(action)) {
      const createdFolderName = action.payload?.name || trimmed;
      setNewFolderName('');
      if (searchId && action.payload?._id) {
        dispatch(assignSearchFolder({ searchId, folderId: action.payload._id }));
        setFolderNotice(`Saved to "${createdFolderName}"`);
      }
      setFolderPanelOpen(false);
    }
  };

  const handleFolderChange = (folderId: string) => {
    dispatch(setCurrentFolderId(folderId));
    if (searchId) {
      dispatch(assignSearchFolder({ searchId, folderId }));
      if (folderId) {
        const selectedFolder = folders.find((folder) => folder._id === folderId);
        if (selectedFolder?.name) {
          setFolderNotice(`Saved to "${selectedFolder.name}"`);
        }
      } else {
        setFolderNotice('Removed from folder');
      }
    }
    setFolderPanelOpen(false);
  };

  const selectedFolderName = folders.find((folder) => folder._id === currentFolderId)?.name;
  const lockedResultsCount = (results as any[]).filter((item: any) => item?.isLocked).length;

  const previewResult = previewResultIndex !== null ? (results as any[])[previewResultIndex] : null;

  const closePreviewModal = () => setPreviewResultIndex(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Image Scan</h1>
        <p className="text-gray-500">Upload an image or paste a URL to search for matches across the web.</p>
        {planSnapshot?.usage?.imageUploadLimit ? (
          <p className="mt-2 text-xs text-gray-500">
            Plan usage: {planSnapshot?.usage?.imagesUsedThisMonth}/{planSnapshot?.usage?.imageUploadLimit} uploads this month.
          </p>
        ) : null}
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
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {isLimitError ? 'Monthly upload quota reached' : 'Search request failed'}
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    {isLimitError
                      ? `You have reached your monthly upload limit for the ${planSnapshot?.plan?.name || 'current'} plan. Upgrade to continue scanning without interruption.`
                      : error}
                  </p>
                  {isLimitError && (
                    <button
                      type="button"
                      onClick={() => (window.location.href = '/dashboard/billing')}
                      className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800"
                    >
                      Upgrade plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 text-lg">Search Results</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {results.length} Found
              </span>
            </div>

            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex flex-1 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFolderPanelOpen((prev) => !prev)}
                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <FolderPlus className="h-4 w-4" />
                    {selectedFolderName ? `Saved: ${selectedFolderName}` : 'Save this search to a folder'}
                  </button>

                  {folderNotice && (
                    <p className="text-xs text-emerald-700">{folderNotice}</p>
                  )}

                  {folderPanelOpen && (
                    <div className="w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                      {!searchId ? (
                        <p className="text-xs text-gray-500">Run a search first, then save it to a folder.</p>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-gray-500">Choose existing folder</p>

                          {foldersLoading ? (
                            <p className="mt-2 text-xs text-gray-500">Loading folders...</p>
                          ) : folders.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleFolderChange('')}
                                className="inline-flex h-8 cursor-pointer items-center rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-600 hover:bg-gray-50"
                              >
                                No folder
                              </button>
                              {folders.map((folder) => (
                                <button
                                  type="button"
                                  key={folder._id}
                                  onClick={() => handleFolderChange(folder._id)}
                                  className={[
                                    'inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border px-2.5 text-xs',
                                    currentFolderId === folder._id
                                      ? 'border-gray-800 bg-gray-800 text-white'
                                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                                  ].join(' ')}
                                >
                                  {currentFolderId === folder._id && <Check className="h-3.5 w-3.5" />}
                                  {folder.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-gray-500">No folders yet. Create one below.</p>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <input
                              value={newFolderName}
                              onChange={(event) => setNewFolderName(event.target.value)}
                              placeholder="Create new folder"
                              className="h-8 min-w-48 flex-1 rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-400"
                            />

                            <button
                              type="button"
                              onClick={handleCreateFolder}
                              disabled={!newFolderName.trim()}
                              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FolderPlus className="h-3.5 w-3.5" />
                              Create
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
                    ].join(' ')}
                  >
                    <List className="h-3.5 w-3.5" />
                    List
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'list' ? (
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
                  {lockedResultsCount > 0 && (
                    <tr>
                      <td colSpan={4} className="bg-amber-50 px-6 py-2 text-xs text-amber-800">
                        {lockedResultsCount} result{lockedResultsCount === 1 ? '' : 's'} hidden by your current plan. Upgrade membership to unlock full thumbnails and source links.
                      </td>
                    </tr>
                  )}
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
                            <button
                              type="button"
                              onClick={() => setPreviewResultIndex(index)}
                              disabled={result.isLocked}
                              className="cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                              aria-label="Preview result image"
                            >
                              <img 
                                src={result.image} 
                                alt="Result" 
                                className={[
                                  'w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm',
                                  result.isLocked ? 'blur-sm opacity-70' : '',
                                ].join(' ')}
                              />
                            </button>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 min-w-70">
                          <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {result.isLocked ? 'Upgrade plan to view this result' : (result.details?.title || 'No title')}
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
                            !result.isLocked ? (
                            <a 
                              href={result.details.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium"
                            >
                              Visit Site <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            ) : (
                              <span className="text-xs font-medium text-amber-700">Upgrade required</span>
                            )
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
            ) : (
              <div className="p-6">
                {loading && results.length === 0 ? (
                  <div className="py-14 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Searching for matches...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((result: any, index: number) => (
                      <div key={result._id || index} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setPreviewResultIndex(index)}
                          disabled={result.isLocked}
                          className="w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                        >
                          {result.image ? (
                            <img
                              src={result.image}
                              alt="Result"
                              className={[
                                'h-40 w-full object-cover',
                                result.isLocked ? 'blur-sm opacity-70' : '',
                              ].join(' ')}
                            />
                          ) : (
                            <div className="flex h-40 items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </button>
                        <div className="mt-3">
                          <p className="line-clamp-2 text-sm font-medium text-gray-900">
                            {result.isLocked ? 'Upgrade plan to view this result' : (result.details?.title || 'No title')}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{result.details?.source || 'Website'}</p>
                        </div>
                        {result.details?.link && !result.isLocked && (
                          <a
                            href={result.details.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            Visit Site <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {result.isLocked && (
                          <p className="mt-3 text-xs font-medium text-amber-700">Upgrade required</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No scan results to display.</p>
                    <p className="text-xs mt-1">Start by uploading an image on the left.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {previewResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closePreviewModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreviewModal}
              className="absolute right-3 top-3 cursor-pointer rounded-md border border-gray-200 bg-white p-1 text-gray-600 hover:bg-gray-50"
              aria-label="Close image preview"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5">
              <img
                src={previewResult.image}
                alt={previewResult.details?.title || 'preview image'}
                className="w-full max-h-[70vh] object-contain rounded-lg border border-gray-200 bg-gray-50"
              />

              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {previewResult.details?.title || 'Untitled result'}
                </p>
                <p className="text-xs text-gray-600">
                  Source: {previewResult.details?.source || 'Website'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {planPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-3 w-fit rounded-2xl bg-gray-100 p-3">
              <Lock className="h-6 w-6 text-gray-700" />
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-900">
              {planPromptMode === 'renew'
                ? 'Your subscription needs renewal'
                : planPromptMode === 'near_limit'
                  ? 'You are close to your monthly limit'
                  : 'You have reached your upload limit'}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              {planPromptMode === 'renew'
                ? 'Renew your plan to keep uninterrupted access to image scans and reports.'
                : planPromptMode === 'near_limit'
                  ? 'You are approaching your monthly upload cap. Upgrading now helps avoid workflow interruption.'
                  : 'Upgrade your plan to continue uploading and scanning images this month.'}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setPlanPromptOpen(false)}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/dashboard/billing')}
                className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                {planPromptMode === 'renew' ? 'Renew plan' : 'Upgrade plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, FileImage, Image as ImageIcon, AudioLines, Globe, Link2, FileWarning } from 'lucide-react';
import { validateMediaFile, validateAudioFile, validateUrl, formatBytes, isAudio } from '@/lib/media';

export type VerificationInput = {
  type: 'image' | 'audio' | 'url';
  file?: File;
  url?: string;
  context: string;
};

interface UploadAreaProps {
  onAnalyze: (input: VerificationInput) => void;
  isAnalyzing: boolean;
}

export function UploadArea({ onAnalyze, isAnalyzing }: UploadAreaProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'audio' | 'url'>('image');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    setError(null);
    let problem: string | null = null;
    if (activeTab === 'audio') {
      problem = validateAudioFile(file);
    } else {
      problem = validateMediaFile(file);
    }

    if (problem) {
      setError(problem);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleAnalyze = () => {
    setError(null);
    if (activeTab === 'url') {
      const urlCheck = validateUrl(urlInput);
      if (!urlCheck.isValid || !urlCheck.formattedUrl) {
        setError(urlCheck.error || 'Please enter a valid URL.');
        return;
      }
      onAnalyze({ type: 'url', url: urlCheck.formattedUrl, context });
    } else {
      if (!selectedFile) {
        setError(`Please upload a valid ${activeTab === 'audio' ? 'audio' : 'image'} file.`);
        return;
      }
      onAnalyze({ type: activeTab, file: selectedFile, context });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Content</h1>
        <p className="text-slate-500">Multimodal verification powered by Gemma 4. Verify images, audio, or webpage links.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-slate-200 gap-4 mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('image');
            setError(null);
          }}
          className={`pb-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'image' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Image / Video
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('audio');
            setError(null);
          }}
          className={`pb-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'audio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AudioLines className="w-4 h-4" /> Audio Recording
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setError(null);
          }}
          className={`pb-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> Webpage URL
        </button>
      </div>

      {activeTab === 'url' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <label htmlFor="url-field" className="block font-semibold text-slate-800">
            Enter Webpage / News Article URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            <input
              id="url-field"
              type="url"
              className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://news.example.com/article"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              disabled={isAnalyzing}
            />
          </div>
          <p className="text-xs text-slate-500">Supports public webpages, blog posts, and news articles (http:// or https://).</p>
        </div>
      ) : !selectedFile ? (
        <div 
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 
            ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={activeTab === 'audio' ? '.mp3,.wav,.m4a,.ogg,.aac,.flac,audio/*' : 'image/jpeg,image/png,image/webp,video/mp4'}
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
              {activeTab === 'audio' ? <AudioLines className="w-8 h-8 text-blue-500" /> : <UploadCloud className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-slate-700 font-medium text-lg">
                Click to upload or drag and drop {activeTab === 'audio' ? 'Audio file' : 'Media file'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'audio' ? 'MP3, WAV, M4A, OGG, AAC, or FLAC (max 15 MB)' : 'JPG, PNG, WEBP, or MP4 (max 15 MB)'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              {isAudio(selectedFile.type, selectedFile.name) ? (
                <AudioLines className="w-5 h-5 text-blue-500" />
              ) : (
                <FileImage className="w-5 h-5 text-blue-500" />
              )}
              {isAudio(selectedFile.type, selectedFile.name) ? 'Audio Selected' : 'Media Selected'}
            </h3>
            <button 
              onClick={removeFile}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
              disabled={isAnalyzing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {previewUrl && isAudio(selectedFile.type, selectedFile.name) ? (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center gap-2">
                <AudioLines className="w-8 h-8 text-blue-500 animate-pulse" />
                <audio controls src={previewUrl} className="w-full max-w-sm" />
              </div>
            ) : previewUrl ? (
              <div className="w-full sm:w-1/2 aspect-video bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="object-contain w-full h-full" />
              </div>
            ) : null}
            
            <div className="w-full sm:w-1/2 space-y-2">
              <div>
                <p className="text-xs text-slate-500">File Name</p>
                <p className="font-medium text-slate-800 truncate">{selectedFile.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">File Size</p>
                <p className="font-medium text-slate-800">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <FileWarning className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <label htmlFor="context" className="block font-semibold text-slate-800 mb-2">
          Optional Context / Claim
        </label>
        <p className="text-sm text-slate-500 mb-4">
          Provide any claims or additional context associated with this verification request.
        </p>
        <textarea
          id="context"
          rows={3}
          className="w-full border border-slate-300 rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder='Example: "This recording claims to be a leaked statement from yesterday."'
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isAnalyzing}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (activeTab === 'url' ? !urlInput.trim() : !selectedFile)}
          className={`px-8 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 min-w-[200px]
            ${isAnalyzing || (activeTab === 'url' ? !urlInput.trim() : !selectedFile)
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Analyze with Gemma 4'
          )}
        </button>
      </div>
    </div>
  );
}

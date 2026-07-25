'use client';

import React, { useState } from 'react';
import { UploadArea, VerificationInput } from '@/components/verify-content/upload-area';
import { ProcessingState } from '@/components/verify-content/processing-state';
import { ResultsReport } from '@/components/verify-content/results-report';
import { TriangleAlert } from 'lucide-react';

type PageState = 'upload' | 'processing' | 'results';

export default function VerifyContentPage() {
  const [pageState, setPageState] = useState<PageState>('upload');
  const [currentInput, setCurrentInput] = useState<VerificationInput | null>(null);
  const [apiPayload, setApiPayload] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async (input: VerificationInput) => {
    setCurrentInput(input);
    setErrorMessage(null);
    setPageState('processing');

    try {
      let response: Response;

      if (input.type === 'url' && input.url) {
        response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input.url, claimedContext: input.context }),
        });
      } else if (input.file) {
        const formData = await new FormData();
        formData.append('media', input.file);
        formData.append('claimedContext', input.context);
        formData.append('type', input.type);

        response = await fetch('/api/verify', {
          method: 'POST',
          body: formData,
        });
      } else {
        throw new Error('Invalid input provided');
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Verification request failed.');
      }

      setApiPayload(payload);
    } catch (err: any) {
      console.error('[Verification Error]', err);
      setErrorMessage(err.message || 'Failed to verify content.');
    }
  };

  const handleProcessingComplete = () => {
    if (errorMessage) {
      setPageState('upload');
    } else {
      setPageState('results');
    }
  };

  const handleReset = () => {
    setPageState('upload');
    setCurrentInput(null);
    setApiPayload(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {errorMessage && pageState === 'upload' && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {pageState === 'upload' && (
        <UploadArea onAnalyze={handleAnalyze} isAnalyzing={false} />
      )}

      {pageState === 'processing' && (
        <ProcessingState type={currentInput?.type} onComplete={handleProcessingComplete} />
      )}

      {pageState === 'results' && (
        <div className="space-y-6">
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
          >
            &larr; Verify another content
          </button>
          <ResultsReport
            imageFile={currentInput?.file}
            url={currentInput?.url}
            context={currentInput?.context}
            payload={apiPayload}
          />
        </div>
      )}
    </div>
  );
}

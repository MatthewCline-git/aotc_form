'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnalysisResult } from '@/lib/types';

interface PDFDropzoneProps {
  onResult: (result: AnalysisResult) => void;
  onReset: () => void;
}

type UploadState = 'idle' | 'uploading' | 'analyzing';

export default function PDFDropzone({ onResult, onReset }: PDFDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [filename, setFilename] = useState<string>('');
  const [error, setError] = useState<string>('');

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDocument = async (file: File) => {
    setState('uploading');
    setFilename(file.name);
    setError('');
    onReset(); // Clear any previous result

    try {
      const base64 = await convertToBase64(file);
      setState('analyzing');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64,
          filename: file.name,
        }),
      });

      const result: AnalysisResult = await response.json();

      setState('idle');
      if (result.error) {
        setError(result.error);
      } else {
        onResult(result);
      }
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      analyzeDocument(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: state === 'uploading' || state === 'analyzing',
  });

  const isLoading = state === 'uploading' || state === 'analyzing';

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isLoading ? 'cursor-not-allowed' : ''}
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">
              {state === 'uploading' ? 'Uploading...' : 'Analyzing document...'}
            </p>
            <p className="text-gray-400 text-sm mt-2">{filename}</p>
          </>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the PDF here...</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  Drag & drop your tax return PDF here
                </p>
                <p className="text-gray-400 text-sm mt-2">or click to select a file</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

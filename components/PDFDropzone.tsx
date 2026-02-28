'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnalysisResult, FileAnalysis } from '@/lib/types';

export default function PDFDropzone() {
  const [files, setFiles] = useState<FileAnalysis[]>([]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDocument = async (file: File, id: string) => {
    try {
      const base64 = await convertToBase64(file);

      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'analyzing' } : f
      ));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, filename: file.name }),
      });

      const result: AnalysisResult = await response.json();

      setFiles(prev => prev.map(f =>
        f.id === id
          ? result.error
            ? { ...f, status: 'error', error: result.error }
            : { ...f, status: 'complete', result }
          : f
      ));
    } catch (err) {
      setFiles(prev => prev.map(f =>
        f.id === id
          ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Failed to analyze' }
          : f
      ));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileAnalysis[] = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      filename: file.name,
      status: 'uploading',
    }));

    setFiles(prev => [...newFiles, ...prev]);

    acceptedFiles.forEach((file, index) => {
      analyzeDocument(file, newFiles[index].id);
    });
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const getResultDisplay = (file: FileAnalysis) => {
    if (file.status === 'uploading' || file.status === 'analyzing') {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-gray-500 text-sm">
            {file.status === 'uploading' ? 'Uploading...' : 'Analyzing...'}
          </span>
        </div>
      );
    }

    if (file.status === 'error') {
      return <span className="text-red-600 text-sm">{file.error}</span>;
    }

    if (file.result) {
      const { claimed } = file.result;
      if (claimed === true) {
        return <span className="text-green-600 font-bold">YES</span>;
      } else if (claimed === false) {
        return <span className="text-gray-600 font-bold">NO</span>;
      } else {
        return <span className="text-yellow-600 font-medium">UNKNOWN</span>;
      }
    }

    return null;
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
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
          <p className="text-blue-600 font-medium">Drop the PDFs here...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Drag & drop tax return PDFs here
            </p>
            <p className="text-gray-400 text-sm mt-2">or click to select files</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <svg
                  className="h-5 w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-700 text-sm truncate">{file.filename}</span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {getResultDisplay(file)}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Remove"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

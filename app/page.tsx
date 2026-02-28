'use client';

import { useState } from 'react';
import Link from 'next/link';
import PDFDropzone from '@/components/PDFDropzone';
import ResultDisplay from '@/components/ResultDisplay';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleResult = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AOTC Checker
          </h1>
          <p className="text-gray-600">
            Upload your tax return to check if the American Opportunity Tax Credit was claimed
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <PDFDropzone onResult={handleResult} onReset={handleReset} />

          {result && <ResultDisplay result={result} />}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          It is analyzed once and immediately discarded.{' '}
          <Link href="/privacy" className="underline hover:text-gray-600">
            Privacy
          </Link>
        </p>
      </div>
    </main>
  );
}

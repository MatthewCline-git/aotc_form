'use client';

import Link from 'next/link';
import PDFDropzone from '@/components/PDFDropzone';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AOTC Checker
          </h1>
          <p className="text-gray-600">
            Upload your tax returns to check if the American Opportunity Tax Credit was claimed
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <PDFDropzone />
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

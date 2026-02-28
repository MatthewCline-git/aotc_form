'use client';

import { AnalysisResult } from '@/lib/types';

interface ResultDisplayProps {
  result: AnalysisResult;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const { claimed, confidence, reasoning } = result;

  // Determine display based on claimed status
  const getDisplay = () => {
    if (claimed === true) {
      return {
        text: 'YES',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
      };
    } else if (claimed === false) {
      return {
        text: 'NO',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-300',
      };
    } else {
      return {
        text: 'UNABLE TO DETERMINE',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
      };
    }
  };

  const getConfidenceBadge = () => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-orange-100 text-orange-800',
      none: 'bg-gray-100 text-gray-800',
    };
    return colors[confidence];
  };

  const display = getDisplay();

  return (
    <div className="mt-8 text-center">
      <div
        className={`
          inline-block px-12 py-8 rounded-2xl border-2
          ${display.bgColor} ${display.borderColor}
        `}
      >
        <p className="text-sm text-gray-500 mb-2">AOTC Claimed?</p>
        <p className={`text-5xl font-bold ${display.textColor}`}>
          {display.text}
        </p>
      </div>

      <div className="mt-4">
        <span
          className={`
            inline-block px-3 py-1 rounded-full text-sm font-medium
            ${getConfidenceBadge()}
          `}
        >
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
        </span>
      </div>

      {reasoning && (
        <div className="mt-6 max-w-md mx-auto">
          <p className="text-gray-600 text-sm">{reasoning}</p>
        </div>
      )}
    </div>
  );
}

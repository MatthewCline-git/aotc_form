export interface AnalysisResult {
  claimed: boolean | null; // true = yes, false = no, null = undetermined
  confidence: 'high' | 'medium' | 'low' | 'none';
  reasoning?: string;
  error: string | null;
}

export interface AnalyzeRequest {
  pdfBase64: string;
  filename?: string;
}

export interface ClaudeResponse {
  aotc_claimed: boolean | null;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

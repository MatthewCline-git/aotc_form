import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult, AnalyzeRequest, ClaudeResponse } from '@/lib/types';
import { AOTC_DETECTION_PROMPT } from '@/lib/prompts';

const MAX_PDF_SIZE = 32 * 1024 * 1024; // 32MB limit for Anthropic

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResult>> {
  try {
    const body: AnalyzeRequest = await request.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({
        claimed: null,
        confidence: 'none',
        error: 'No PDF data provided',
      }, { status: 400 });
    }

    // Check size (base64 is ~4/3 larger than binary)
    const estimatedSize = (pdfBase64.length * 3) / 4;
    if (estimatedSize > MAX_PDF_SIZE) {
      return NextResponse.json({
        claimed: null,
        confidence: 'none',
        error: 'PDF exceeds maximum size of 32MB',
      }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        claimed: null,
        confidence: 'none',
        error: 'Server configuration error: API key not set',
      }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: AOTC_DETECTION_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({
        claimed: null,
        confidence: 'none',
        error: 'No response from AI',
      }, { status: 500 });
    }

    // Parse JSON response
    const responseText = textContent.text.trim();

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed: ClaudeResponse = JSON.parse(jsonStr);

    return NextResponse.json({
      claimed: parsed.aotc_claimed,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      error: null,
    });

  } catch (error) {
    console.error('Analysis error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({
        claimed: null,
        confidence: 'none',
        error: 'Failed to parse AI response',
      }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({
      claimed: null,
      confidence: 'none',
      error: message,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { analyzePlanWithAi } from '@/lib/ai';
import { AnalysisRequest } from '@/types/analysis';

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json();

    if (!body.planText || typeof body.planText !== 'string' || !body.planText.trim()) {
      return NextResponse.json(
        { error: 'Rencana aktivitas wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await analyzePlanWithAi({
      planText: body.planText,
      contextDate: body.contextDate,
      apiKey: body.apiKey,
      model: body.model,
      baseUrl: body.baseUrl,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server saat memproses analisis.';
    console.error('API /api/analyze error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

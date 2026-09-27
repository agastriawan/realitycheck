import { AnalysisResponse, FeasibilityStatus, SeverityLevel, ActivityItem, ConflictItem, RiskItem } from '@/types/analysis';

export function sanitizeAndValidateAnalysisResponse(raw: unknown): AnalysisResponse {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Respons AI tidak berbentuk objek valid.');
  }

  const obj = raw as Record<string, unknown>;

  let status: FeasibilityStatus = 'perlu_penyesuaian';
  if (obj.status === 'realistis' || obj.status === 'berisiko_terlalu_padat' || obj.status === 'perlu_penyesuaian') {
    status = obj.status;
  } else if (typeof obj.status === 'string') {
    const s = obj.status.toLowerCase();
    if (s.includes('realis')) status = 'realistis';
    else if (s.includes('padat') || s.includes('risiko') || s.includes('risk')) status = 'berisiko_terlalu_padat';
    else status = 'perlu_penyesuaian';
  }

  let score = typeof obj.score === 'number' ? Math.max(0, Math.min(100, Math.round(obj.score))) : 60;

  const summary = typeof obj.summary === 'string' && obj.summary.trim() ? obj.summary.trim() : 'Analisis rencana berhasil diproses.';

  const activities: ActivityItem[] = Array.isArray(obj.activities)
    ? obj.activities.map((a: unknown) => {
        if (typeof a === 'object' && a !== null) {
          const item = a as Record<string, unknown>;
          return {
            name: String(item.name || 'Aktivitas'),
            start: String(item.start || ''),
            end: String(item.end || ''),
            duration_minutes: typeof item.duration_minutes === 'number' ? item.duration_minutes : 0,
          };
        }
        return { name: String(a), start: '', end: '', duration_minutes: 0 };
      })
    : [];

  const parseSeverity = (val: unknown): SeverityLevel => {
    const s = String(val).toLowerCase();
    if (s === 'high' || s === 'tinggi') return 'high';
    if (s === 'medium' || s === 'sedang') return 'medium';
    return 'low';
  };

  const conflicts: ConflictItem[] = Array.isArray(obj.conflicts)
    ? obj.conflicts.map((c: unknown) => {
        if (typeof c === 'object' && c !== null) {
          const item = c as Record<string, unknown>;
          return {
            severity: parseSeverity(item.severity),
            description: String(item.description || item.text || 'Konflik waktu terdeteksi.'),
          };
        }
        return { severity: 'high', description: String(c) };
      })
    : [];

  const risks: RiskItem[] = Array.isArray(obj.risks)
    ? obj.risks.map((r: unknown) => {
        if (typeof r === 'object' && r !== null) {
          const item = r as Record<string, unknown>;
          return {
            severity: parseSeverity(item.severity),
            description: String(item.description || item.text || 'Potensi risiko kepadatan.'),
          };
        }
        return { severity: 'medium', description: String(r) };
      })
    : [];

  const recommendations: string[] = Array.isArray(obj.recommendations)
    ? obj.recommendations.map((rec: unknown) => (typeof rec === 'object' && rec !== null ? String((rec as Record<string, unknown>).description || (rec as Record<string, unknown>).text || JSON.stringify(rec)) : String(rec)))
    : [];

  const missing_information: string[] = Array.isArray(obj.missing_information)
    ? obj.missing_information.map((m: unknown) => (typeof m === 'object' && m !== null ? String((m as Record<string, unknown>).description || (m as Record<string, unknown>).text || JSON.stringify(m)) : String(m)))
    : [];

  return {
    status,
    score,
    summary,
    activities,
    conflicts,
    risks,
    recommendations,
    missing_information,
  };
}

export function parseJsonFromAiText(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw new Error('Gagal mem-parsing output JSON dari AI.');
  }
}

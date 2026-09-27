import { AnalysisResponse, ActivityItem, ConflictItem, RiskItem } from '@/types/analysis';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from './prompt';
import { parseJsonFromAiText, sanitizeAndValidateAnalysisResponse } from './validation';

interface CallAiOptions {
  planText: string;
  contextDate?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export async function analyzePlanWithAi(options: CallAiOptions): Promise<AnalysisResponse> {
  const { planText, contextDate } = options;
  const apiKey = options.apiKey || process.env.AI_API_KEY;
  const model = options.model || process.env.AI_MODEL || 'gemini-1.5-flash';
  const baseUrl = options.baseUrl || process.env.AI_BASE_URL;

  if (!planText || !planText.trim()) {
    throw new Error('Rencana aktivitas tidak boleh kosong.');
  }

  // If API key is available, call the actual LLM API
  if (apiKey && apiKey.trim() !== '') {
    try {
      if (model.toLowerCase().includes('gemini') || (!baseUrl && apiKey.startsWith('AIza'))) {
        return await callGeminiApi(planText, contextDate, apiKey, model);
      } else {
        return await callOpenAiCompatibleApi(planText, contextDate, apiKey, model, baseUrl);
      }
    } catch (err: unknown) {
      console.warn('AI API Call failed, fallback to built-in heuristic analysis:', err);
      // If API fails, fall back to heuristic analyzer with a note
      const fallbackResult = analyzePlanHeuristically(planText, contextDate);
      fallbackResult.summary = `[Mode Offline/Fallback] ${fallbackResult.summary}`;
      return fallbackResult;
    }
  }

  // If no API key provided, use built-in heuristic NLP evaluator
  return analyzePlanHeuristically(planText, contextDate);
}

async function callGeminiApi(planText: string, contextDate: string | undefined, apiKey: string, model: string): Promise<AnalysisResponse> {
  const prompt = buildAnalysisPrompt(planText, contextDate);
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Tidak ada respon teks dari model Gemini.');
  }

  const parsed = parseJsonFromAiText(textContent);
  return sanitizeAndValidateAnalysisResponse(parsed);
}

async function callOpenAiCompatibleApi(
  planText: string,
  contextDate: string | undefined,
  apiKey: string,
  model: string,
  baseUrl?: string
): Promise<AnalysisResponse> {
  const prompt = buildAnalysisPrompt(planText, contextDate);
  const endpoint = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/chat/completions` : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content;
  if (!textContent) {
    throw new Error('Tidak ada respon teks dari OpenAI API.');
  }

  const parsed = parseJsonFromAiText(textContent);
  return sanitizeAndValidateAnalysisResponse(parsed);
}

/**
 * Built-in NLP heuristic evaluator that extracts activities, times, detects overlaps,
 * assesses density and late-night schedules, matching the evaluation test cases in RealityCheckContext.md.
 */
export function analyzePlanHeuristically(planText: string, _contextDate?: string): AnalysisResponse {
  const lines = planText.split(/[\n,;]+|\.\s+/).map(l => l.trim()).filter(Boolean);
  const activities: ActivityItem[] = [];

  const timePattern = /(?:jam|pukul)?\s*(\d{1,2})(?:[.:](\d{2}))?\s*(?:sampai|-|–|to|\/)\s*(?:jam|pukul)?\s*(\d{1,2})(?:[.:](\d{2}))?/i;
  const singleTimePattern = /(?:jam|pukul|at)\s*(\d{1,2})(?:[.:](\d{2}))?/i;
  const durationPattern = /(\d+)\s*(?:jam|hour|hours|menit|mins|minutes)/i;

  for (const line of lines) {
    const timeMatch = line.match(timePattern);
    if (timeMatch) {
      const startH = parseInt(timeMatch[1], 10);
      const startM = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const endH = parseInt(timeMatch[3], 10);
      const endM = timeMatch[4] ? parseInt(timeMatch[4], 10) : 0;

      const startFormatted = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const endFormatted = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      let duration = (endH * 60 + endM) - (startH * 60 + startM);
      if (duration < 0) duration += 24 * 60; // Next day midnight

      const name = line
        .replace(timePattern, '')
        .replace(/(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu|hari ini|besok|lusa)/gi, '')
        .replace(/(?:saya|ingin|mau|dari|jam|pukul|waktu|setelah itu|lalu|kemudian)/gi, '')
        .trim() || 'Aktivitas';

      activities.push({
        name: capitalize(name.replace(/^[-–—:.]\s*/, '')),
        start: startFormatted,
        end: endFormatted,
        duration_minutes: duration
      });
      continue;
    }

    const singleMatch = line.match(singleTimePattern);
    const durMatch = line.match(durationPattern);
    if (singleMatch) {
      const startH = parseInt(singleMatch[1], 10);
      const startM = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
      let durMinutes = 60;
      if (durMatch) {
        const val = parseInt(durMatch[1], 10);
        durMinutes = durMatch[0].includes('menit') || durMatch[0].includes('min') ? val : val * 60;
      }
      const endTotalM = (startH * 60 + startM + durMinutes) % (24 * 60);
      const endH = Math.floor(endTotalM / 60);
      const endM = endTotalM % 60;

      const name = line
        .replace(singleTimePattern, '')
        .replace(durationPattern, '')
        .replace(/(?:senin|selasa|rabu|kamis|jumat|sabtu|minggu|hari ini|besok|lusa)/gi, '')
        .replace(/(?:saya|ingin|mau|dari|jam|pukul|setelah itu|lalu|kemudian)/gi, '')
        .trim() || 'Aktivitas';

      activities.push({
        name: capitalize(name.replace(/^[-–—:.]\s*/, '')),
        start: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
        end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
        duration_minutes: durMinutes
      });
      continue;
    }

    if (line.length > 3) {
      activities.push({
        name: capitalize(line),
        start: '',
        end: '',
        duration_minutes: 0
      });
    }
  }

  // Conflict Detection
  const conflicts: ConflictItem[] = [];
  const timedActivities = activities.filter(a => a.start && a.end);

  for (let i = 0; i < timedActivities.length; i++) {
    for (let j = i + 1; j < timedActivities.length; j++) {
      const a = timedActivities[i];
      const b = timedActivities[j];

      const aStart = parseMinutes(a.start);
      let aEnd = parseMinutes(a.end);
      if (aEnd <= aStart) aEnd += 24 * 60;

      const bStart = parseMinutes(b.start);
      let bEnd = parseMinutes(b.end);
      if (bEnd <= bStart) bEnd += 24 * 60;

      // Check overlap
      const overlapStart = Math.max(aStart, bStart);
      const overlapEnd = Math.min(aEnd, bEnd);

      if (overlapStart < overlapEnd) {
        const oStartStr = formatMinutes(overlapStart % (24 * 60));
        const oEndStr = formatMinutes(overlapEnd % (24 * 60));
        conflicts.push({
          severity: 'high',
          description: `Terdapat konflik waktu antara ${a.name} (${a.start}–${a.end}) dan ${b.name} (${b.start}–${b.end}) pada pukul ${oStartStr}–${oEndStr}.`
        });
      }
    }
  }

  // Risk Detection & Density
  const risks: RiskItem[] = [];
  let workMinutes = 0;
  let hasLateNight = false;
  let hasBackToBack = false;

  const isRestActivity = (name: string): boolean => {
    const n = name.toLowerCase();
    return (
      n.includes('istirahat') ||
      n.includes('makan') ||
      n.includes('lunch') ||
      n.includes('dinner') ||
      n.includes('tidur') ||
      n.includes('nap') ||
      n.includes('break') ||
      n.includes('santai') ||
      n.includes('rehat') ||
      n.includes('jeda')
    );
  };

  for (let i = 0; i < timedActivities.length; i++) {
    const act = timedActivities[i];
    const isRest = isRestActivity(act.name);
    if (!isRest) {
      workMinutes += act.duration_minutes;
    }

    const endMin = parseMinutes(act.end);
    if (endMin >= 23 * 60 || (endMin >= 0 && endMin <= 4 * 60)) {
      hasLateNight = true;
    }

    if (i < timedActivities.length - 1) {
      const nextAct = timedActivities[i + 1];
      const nextIsRest = isRestActivity(nextAct.name);
      const currentEnd = parseMinutes(act.end);
      const nextStart = parseMinutes(nextAct.start);
      const gap = nextStart >= currentEnd ? nextStart - currentEnd : (nextStart + 24 * 60) - currentEnd;
      if (gap <= 0 && conflicts.length === 0 && !isRest && !nextIsRest) {
        hasBackToBack = true;
      }
    }
  }

  if (workMinutes >= 9 * 60 || (hasLateNight && workMinutes >= 8 * 60)) {
    risks.push({
      severity: 'high',
      description: `Total durasi aktivitas produktif mencapai ${(workMinutes / 60).toFixed(1)} jam dalam satu hari, sangat berpotensi menyebabkan kelelahan fisik dan mental.`
    });
  } else if (workMinutes >= 7.5 * 60) {
    risks.push({
      severity: 'medium',
      description: `Total durasi aktivitas cukup padat (${(workMinutes / 60).toFixed(1)} jam). Pastikan ada jeda istirahat yang memadai.`
    });
  }

  if (hasLateNight) {
    risks.push({
      severity: 'medium',
      description: 'Aktivitas berlangsung hingga larut malam atau dini hari, berpotensi memotong durasi dan kualitas waktu tidur.'
    });
  }

  if (hasBackToBack) {
    risks.push({
      severity: 'medium',
      description: 'Beberapa aktivitas padat dijadwalkan berturut-turut tanpa jeda transisi atau istirahat singkat.'
    });
  }

  // Missing Information
  const missing_information: string[] = [];
  missing_information.push('Waktu perjalanan (transportasi/mobilitas antar lokasi) belum dicantumkan.');
  missing_information.push('Target jam tidur dan waktu bangun belum dicantumkan secara spesifik.');

  // Status & Score calculation matching RealityCheck specification
  let status: 'realistis' | 'perlu_penyesuaian' | 'berisiko_terlalu_padat' = 'realistis';
  let score = 90;

  if (conflicts.length >= 2 || workMinutes >= 9.5 * 60 || (hasLateNight && workMinutes >= 8 * 60)) {
    status = 'berisiko_terlalu_padat';
    score = Math.max(30, 50 - (conflicts.length * 10));
  } else if (conflicts.length > 0) {
    status = 'perlu_penyesuaian';
    score = 65;
  } else if (hasLateNight || hasBackToBack || workMinutes >= 7.5 * 60) {
    status = 'perlu_penyesuaian';
    score = 75;
  } else {
    status = 'realistis';
    score = 90;
  }

  // Recommendations
  const recommendations: string[] = [];
  if (conflicts.length > 0) {
    recommendations.push('Geser atau jadwalkan ulang salah satu aktivitas yang saling tumpang tindih ke waktu lain.');
  }
  if (hasLateNight) {
    recommendations.push('Pertimbangkan memindahkan aktivitas malam (seperti belajar mandiri atau tugas) ke pagi hari berikutnya agar waktu tidur tetap cukup.');
  }
  if (workMinutes >= 7 * 60) {
    recommendations.push('Batasi durasi pengerjaan tugas atau olahraga agar tubuh tidak terlalu lelah sebelum istirahat.');
  }
  recommendations.push('Sisipkan jeda minimal 15–30 menit setelah setiap sesi aktivitas berat untuk perjalanan dan rehat.');

  let summary = '';
  if (status === 'realistis') {
    summary = 'Rencana jadwal tergolong realistis dan seimbang, dengan beban aktivitas yang proporsional serta tidak terdapat konflik waktu langsung.';
  } else if (status === 'perlu_penyesuaian') {
    summary = conflicts.length > 0
      ? 'Rencana memiliki konflik waktu langsung yang memerlukan penyesuaian jam mulai atau jam selesai.'
      : 'Rencana dapat dijalankan tetapi memerlukan penyesuaian jeda istirahat dan transisi antar aktivitas agar tidak terlalu melelahkan.';
  } else {
    summary = 'Rencana memiliki intensitas sangat tinggi dan padat dari pagi hingga malam/dini hari. Disarankan untuk memprioritaskan aktivitas utama dan memindahkan sebagian kegiatan ke hari lain.';
  }

  return {
    status,
    score,
    summary,
    activities,
    conflicts,
    risks,
    recommendations,
    missing_information
  };
}

function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function capitalize(s: string): string {
  const str = s.trim();
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

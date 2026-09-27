import React, { useState } from 'react';
import { AnalysisResponse } from '@/types/analysis';
import { StatusBadge } from './StatusBadge';
import { Copy, Check, Download } from 'lucide-react';

interface AnalysisResultProps {
  result: AnalysisResponse;
  planText: string;
  contextDate?: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  planText,
  contextDate,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textToCopy = `=== HASIL EVALUASI REALITYCHECK ===
Status: ${result.status.replace(/_/g, ' ').toUpperCase()} (Score: ${result.score}/100)

Ringkasan:
${result.summary}

Timeline Aktivitas:
${result.activities.map((a) => `• ${a.start && a.end ? `${a.start} - ${a.end}` : 'Fleksibel'}: ${a.name} (${a.duration_minutes > 0 ? `${a.duration_minutes}m` : 'durasi fleksibel'})`).join('\n')}

${result.conflicts.length > 0 ? `Konflik Waktu:\n${result.conflicts.map((c) => `• [${c.severity.toUpperCase()}] ${c.description}`).join('\n')}\n` : ''}
${result.risks.length > 0 ? `Potensi Risiko:\n${result.risks.map((r) => `• [${r.severity.toUpperCase()}] ${r.description}`).join('\n')}\n` : ''}
${result.recommendations.length > 0 ? `Rekomendasi:\n${result.recommendations.map((rec) => `• ${rec}`).join('\n')}\n` : ''}
${result.missing_information.length > 0 ? `Informasi Belum Tersedia:\n${result.missing_information.map((m) => `• ${m}`).join('\n')}` : ''}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ planText, contextDate, ...result }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `realitycheck_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="minimal-result-box">
      {/* Header Line: Status & Score */}
      <div className="result-header-row">
        <div className="d-flex align-items-center gap-2.5">
          <StatusBadge status={result.status} size="md" />
          <span className="score-pill">
            Skor: <strong>{result.score}</strong>/100
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={copyToClipboard} className="btn-minimal-action" title="Salin">
            {copied ? <Check size={13} className="text-purple-700" /> : <Copy size={13} />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
          <button onClick={downloadJson} className="btn-minimal-action" title="Download JSON">
            <Download size={13} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 1. Ringkasan */}
      <div className="mb-3">
        <p className="mb-0 text-dark" style={{ fontSize: '0.84rem', lineHeight: '1.6' }}>
          {result.summary}
        </p>
      </div>

      {/* 2. Timeline & Aktivitas */}
      {result.activities && result.activities.length > 0 && (
        <div className="mb-3">
          <div className="fw-bold mb-1.5" style={{ color: '#2e1065', fontSize: '0.8rem' }}>
            Timeline Aktivitas
          </div>
          <div className="d-flex flex-column gap-1">
            {result.activities.map((a, idx) => (
              <div key={idx} className="d-flex flex-wrap align-items-baseline gap-1.5" style={{ fontSize: '0.8rem' }}>
                <span className="fw-semibold text-purple-900" style={{ minWidth: '88px' }}>
                  {a.start && a.end ? `${a.start} – ${a.end}` : 'Fleksibel'}
                </span>
                <span className="text-muted d-none d-sm-inline">•</span>
                <span className="text-dark fw-medium">{a.name}</span>
                {a.duration_minutes > 0 && (
                  <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                    (~{Math.floor(a.duration_minutes / 60) > 0 ? `${Math.floor(a.duration_minutes / 60)}j ` : ''}
                    {a.duration_minutes % 60 > 0 ? `${a.duration_minutes % 60}m` : ''})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Konflik Waktu */}
      {result.conflicts && result.conflicts.length > 0 && (
        <div className="mb-3">
          <div className="fw-bold mb-1.5 text-purple-900" style={{ fontSize: '0.8rem' }}>
            Konflik Waktu
          </div>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            {result.conflicts.map((c, idx) => (
              <li key={idx} className="mb-1 text-dark">
                <span className="fw-semibold text-purple-800">
                  [{c.severity === 'high' ? 'Tinggi' : c.severity === 'medium' ? 'Sedang' : 'Ringan'}]
                </span>{' '}
                {c.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Potensi Risiko & Kepadatan */}
      {result.risks && result.risks.length > 0 && (
        <div className="mb-3">
          <div className="fw-bold mb-1.5 text-purple-900" style={{ fontSize: '0.8rem' }}>
            Potensi Risiko
          </div>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            {result.risks.map((r, idx) => (
              <li key={idx} className="mb-1 text-dark">
                <span className="fw-semibold text-purple-800">
                  [{r.severity === 'high' ? 'Tinggi' : r.severity === 'medium' ? 'Sedang' : 'Perhatian'}]
                </span>{' '}
                {r.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Rekomendasi Penyesuaian */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="mb-3">
          <div className="fw-bold mb-1.5 text-purple-900" style={{ fontSize: '0.8rem' }}>
            Rekomendasi Alternatif
          </div>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="mb-1 text-dark">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Informasi Belum Tersedia */}
      {result.missing_information && result.missing_information.length > 0 && (
        <div>
          <div className="fw-bold mb-1.5 text-purple-900" style={{ fontSize: '0.8rem' }}>
            Informasi yang Belum Tersedia
          </div>
          <ul className="mb-0 ps-3" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
            {result.missing_information.map((m, idx) => (
              <li key={idx} className="mb-1 text-muted">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

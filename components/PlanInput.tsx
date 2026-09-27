import React, { useState } from 'react';
import { Sparkles, Calendar, RotateCcw, Zap, HelpCircle } from 'lucide-react';

interface PlanInputProps {
  initialValue?: string;
  initialDate?: string;
  onAnalyze: (planText: string, contextDate?: string) => void;
  isLoading: boolean;
}

const PRESET_TEST_CASES = [
  {
    id: 'tc1',
    label: 'Test Case 1 — Konflik Jelas',
    tag: 'Konflik',
    date: 'Hari Ini',
    text: 'Kuliah 08.00-12.00.\nKerja 11.00-15.00.',
  },
  {
    id: 'tc2',
    label: 'Test Case 2 — Jadwal Padat',
    tag: 'Padat',
    date: 'Senin',
    text: 'Senin saya kuliah dari jam 08.00 sampai 12.00.\nJam 13.00 sampai 17.00 saya kerja.\nJam 18.00 sampai 20.00 saya ingin gym.\nJam 20.00 sampai 23.00 saya ingin mengerjakan tugas.\nSetelah itu saya ingin belajar bahasa Inggris sampai jam 01.00.',
  },
  {
    id: 'tc3',
    label: 'Test Case 3 — Jadwal Seimbang',
    tag: 'Longgar',
    date: 'Besok',
    text: 'Kuliah 08.00-12.00.\nIstirahat 12.00-13.00.\nMengerjakan tugas 14.00-16.00.\nOlahraga 17.00-18.00.',
  },
];

export const PlanInput: React.FC<PlanInputProps> = ({
  initialValue = '',
  initialDate = 'Besok',
  onAnalyze,
  isLoading,
}) => {
  const [planText, setPlanText] = useState(initialValue);
  const [contextDate, setContextDate] = useState(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planText.trim() || isLoading) return;
    onAnalyze(planText, contextDate);
  };

  const loadPreset = (presetText: string, presetDate: string) => {
    setPlanText(presetText);
    setContextDate(presetDate);
  };

  const handleReset = () => {
    setPlanText('');
  };

  return (
    <div className="plan-input-card card-custom p-4 p-md-5">
      {/* Preset Pills */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-semibold d-inline-flex align-items-center gap-1">
            <Zap size={14} className="text-primary" /> Contoh Rencana / Test Cases:
          </span>
          {planText && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-link text-muted text-decoration-none btn-sm p-0 d-inline-flex align-items-center gap-1"
            >
              <RotateCcw size={12} /> Bersihkan
            </button>
          )}
        </div>

        <div className="d-flex flex-wrap gap-2">
          {PRESET_TEST_CASES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset.text, preset.date)}
              className="preset-btn btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5"
            >
              <span className="preset-tag badge bg-secondary-subtle text-secondary">{preset.tag}</span>
              <span>{preset.label.split('—')[1]?.trim() || preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4 col-lg-3">
            <label className="form-label small fw-semibold text-secondary d-flex align-items-center gap-1 mb-1">
              <Calendar size={14} /> Konteks Hari / Tanggal
            </label>
            <input
              type="text"
              className="form-control form-control-custom"
              placeholder="Contoh: Besok, Senin..."
              value={contextDate}
              onChange={(e) => setContextDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-8 col-lg-9">
            <label className="form-label small fw-semibold text-secondary d-flex align-items-center justify-content-between mb-1">
              <span>Tuliskan Rencana Aktivitasmu</span>
              <span className="text-muted small">{planText.length} karakter</span>
            </label>
            <div className="textarea-wrapper position-relative">
              <textarea
                className="form-control form-control-custom textarea-plan"
                rows={5}
                placeholder="Contoh: Besok saya kuliah jam 8 sampai 12, setelah itu kerja dari jam 1 sampai 5, sore mau gym 1 jam, malam harus mengerjakan tugas sampai selesai..."
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2">
          <div className="d-flex align-items-center gap-1.5 text-muted small">
            <HelpCircle size={15} />
            <span>AI akan mengevaluasi bentrok jam, kepadatan, jeda istirahat, dan waktu tidur.</span>
          </div>

          <button
            type="submit"
            disabled={!planText.trim() || isLoading}
            className="btn btn-primary btn-analyze btn-lg px-4 py-2.5 d-inline-flex align-items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Menganalisis Rencana...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analisis Rencana</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

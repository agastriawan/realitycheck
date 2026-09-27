'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResponse, HistoryItem } from '@/types/analysis';
import { AnalysisResult } from '@/components/AnalysisResult';
import { StatusBadge } from '@/components/StatusBadge';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { getHistory, saveAnalysisToHistory, deleteHistoryItem } from '@/lib/storage';
import {
  Send,
  Plus,
  Settings,
  Calendar,
  Trash2,
  CalendarCheck2,
  Sparkles,
  User,
  RotateCcw,
  ArrowRight,
  X,
  FileText,
  Menu
} from 'lucide-react';

const PRESET_TEST_CASES = [
  {
    id: 'tc1',
    title: 'Test Case 1 — Konflik Jelas',
    tag: 'Konflik',
    date: 'Hari Ini',
    text: 'Kuliah 08.00-12.00.\nKerja 11.00-15.00.',
    desc: 'Mendeteksi tabrakan waktu jam 11.00–12.00.',
  },
  {
    id: 'tc2',
    title: 'Test Case 2 — Jadwal Padat',
    tag: 'Padat',
    date: 'Senin',
    text: 'Senin saya kuliah dari jam 08.00 sampai 12.00.\nJam 13.00 sampai 17.00 saya kerja.\nJam 18.00 sampai 20.00 saya ingin gym.\nJam 20.00 sampai 23.00 saya ingin mengerjakan tugas.\nSetelah itu saya ingin belajar bahasa Inggris sampai jam 01.00.',
    desc: 'Mendeteksi jadwal maraton padat & jam tidur larut malam.',
  },
  {
    id: 'tc3',
    title: 'Test Case 3 — Jadwal Seimbang',
    tag: 'Seimbang',
    date: 'Besok',
    text: 'Kuliah 08.00-12.00.\nIstirahat 12.00-13.00.\nMengerjakan tugas 14.00-16.00.\nOlahraga 17.00-18.00.',
    desc: 'Jadwal proporsional dengan jeda istirahat memadai.',
  },
];

export default function RealityCheckApp() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [inputPlan, setInputPlan] = useState('');
  const [contextDate, setContextDate] = useState('Besok');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Current active chat content
  const [activePlanText, setActivePlanText] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<AnalysisResponse | null>(null);
  const [activeDate, setActiveDate] = useState<string>('Besok');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedHistory();
  }, []);

  const loadSavedHistory = () => {
    const items = getHistory();
    setHistoryItems(items);
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setActivePlanText(null);
    setActiveResult(null);
    setInputPlan('');
    setIsSidebarOpen(false);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setActiveSessionId(item.id);
    setActivePlanText(item.planText);
    setActiveResult(item.result);
    setActiveDate(item.contextDate || 'Besok');
    setIsSidebarOpen(false);
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    loadSavedHistory();
    if (activeSessionId === id) {
      handleNewSession();
    }
  };

  const handleSend = async () => {
    if (!inputPlan.trim() || isLoading) return;

    const planToAnalyze = inputPlan.trim();
    const dateToAnalyze = contextDate.trim() || 'Besok';

    setIsLoading(true);
    setActivePlanText(planToAnalyze);
    setActiveDate(dateToAnalyze);
    setActiveResult(null);
    setInputPlan('');

    let clientApiKey: string | undefined;
    let clientModel: string | undefined;
    let clientBaseUrl: string | undefined;

    if (typeof window !== 'undefined') {
      clientApiKey = localStorage.getItem('rc_user_api_key') || undefined;
      clientModel = localStorage.getItem('rc_user_model') || undefined;
      clientBaseUrl = localStorage.getItem('rc_user_base_url') || undefined;
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planText: planToAnalyze,
          contextDate: dateToAnalyze,
          apiKey: clientApiKey,
          model: clientModel,
          baseUrl: clientBaseUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses analisis.');
      }

      setActiveResult(data);

      // Save to localStorage
      const saved = saveAnalysisToHistory(planToAnalyze, data, dateToAnalyze);
      setActiveSessionId(saved.id);
      loadSavedHistory();

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menganalisis rencana.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoadPreset = (text: string, date: string) => {
    setInputPlan(text);
    setContextDate(date);
    setIsPresetsOpen(false);
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop d-md-none"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`sidebar-panel ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-icon-box">
              <CalendarCheck2 size={21} strokeWidth={2.2} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 brand-title" style={{ color: '#2e1065', fontSize: '1.02rem', lineHeight: '1.2' }}>
                RealityCheck
              </h5>
              <small className="text-muted brand-tagline" style={{ fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>
                Cek dulu sebelum dijalankan
              </small>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="btn-close-custom d-md-none p-1"
            title="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Saved Chats / History List */}
        <div className="sidebar-history-list">
          <div className="small fw-semibold text-muted px-1 pt-1 pb-1">
            Riwayat Analisis ({historyItems.length})
          </div>

          {historyItems.length === 0 ? (
            <div className="text-center py-4 px-2 text-muted small">
              Belum ada analisis tersimpan.
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item)}
                className={`history-item-btn ${activeSessionId === item.id ? 'active' : ''}`}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="text-truncate flex-grow-1">
                    <div className="fw-semibold text-truncate" style={{ fontSize: '0.82rem', color: '#1e1b4b' }}>
                      {item.planText.split('\n')[0]}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {item.contextDate ? ` • ${item.contextDate}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistory(e, item.id)}
                    className="btn-icon-subtle p-1 text-muted flex-shrink-0"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer (+ Rencana Baru) */}
        <div className="sidebar-footer">
          <button onClick={handleNewSession} className="btn-new-chat">
            <Plus size={16} />
            <span>Rencana Baru</span>
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="main-canvas">
        {/* Header */}
        <header className="canvas-header">
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="canvas-btn-icon d-md-none"
              title="Buka Menu & Riwayat"
            >
              <Menu size={16} />
            </button>
            <div>
              <h5 className="fw-bold mb-0 header-title" style={{ color: '#2e1065' }}>
                {activePlanText ? 'Hasil Evaluasi Rencana' : 'Percakapan Baru'}
              </h5>
              <small className="text-muted header-subtitle">
                {activeResult ? '2 pesan (Input Pengguna & Evaluasi AI)' : '0 pesan'}
              </small>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={handleNewSession}
              className="canvas-btn-icon"
              title="Mulai Ulang"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="canvas-btn-icon"
              title="Buka Preset Test Cases"
            >
              <FileText size={15} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="canvas-btn-icon"
              title="Pengaturan Model AI"
            >
              <Settings size={15} />
            </button>
          </div>
        </header>

        {/* Body Content Stream */}
        <div className="canvas-body">
          {!activePlanText && (
            <div className="system-welcome-card my-auto">
              <div className="d-flex align-items-center gap-2 mb-2 text-purple-700">
                <Sparkles size={20} />
                <span className="fw-semibold">System Evaluator</span>
              </div>
              <h5 className="fw-bold mb-1.5" style={{ color: '#1e1136', fontSize: '1.08rem' }}>
                Halo! Masukkan rencana aktivitasmu hari ini.
              </h5>
              <p className="text-secondary small mb-3" style={{ fontSize: '0.8rem' }}>
                RealityCheck akan membaca rencanamu dalam bahasa natural dan mengevaluasi apakah jadwal tersebut realistis berdasarkan bentrok jam, kepadatan aktivitas berlebih, jeda perjalanan, dan durasi istirahat.
              </p>

              <div className="small fw-bold text-purple-900 mb-2.5">
                <span>Pilihan Test Case Cepat:</span>
              </div>

              <div className="row g-2">
                {PRESET_TEST_CASES.map((tc) => (
                  <div key={tc.id} className="col-12 col-md-4">
                    <button
                      onClick={() => handleLoadPreset(tc.text, tc.date)}
                      className="preset-chip-btn h-100 d-flex flex-column justify-content-between p-3"
                    >
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span
                            className="badge rounded-pill fw-semibold"
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: '#ede9fe',
                              color: '#5b21b6',
                              border: '1px solid #c4b5fd',
                              padding: '3px 8px'
                            }}
                          >
                            {tc.tag}
                          </span>
                        </div>
                        <div className="fw-bold small mb-1" style={{ color: '#2e1065' }}>{tc.title.split('—')[1]}</div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{tc.desc}</div>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-purple-700 small mt-3 fw-semibold">
                        <span>Pilih Test Case</span>
                        <ArrowRight size={13} />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePlanText && (
            <>
              {/* User Message Bubble */}
              <div className="message-user-wrap">
                <div className="message-user-bubble">
                  <div className="d-flex align-items-center gap-2 mb-1 opacity-90 small">
                    <User size={13} />
                    <span>Rencana ({activeDate})</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{activePlanText}</div>
                </div>
              </div>

              {/* AI Message Bubble */}
              <div className="message-ai-wrap">
                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <CalendarCheck2 size={16} className="text-purple-600" />
                  <span className="fw-semibold text-purple-950">RealityCheck AI</span>
                </div>

                {isLoading ? (
                  <div className="result-box p-4 text-center">
                    <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
                    <div className="text-secondary small">Mengevaluasi jadwal, mendeteksi konflik waktu & kepadatan...</div>
                  </div>
                ) : activeResult ? (
                  <AnalysisResult
                    result={activeResult}
                    planText={activePlanText}
                    contextDate={activeDate}
                  />
                ) : null}
              </div>
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM INPUT BAR */}
        <footer className="canvas-footer">
          <div className="input-container-box">
            {/* Mini Toolbar */}
            <div className="input-toolbar">
              <div className="d-flex align-items-center gap-2">
                <div className="toolbar-pill">
                  <Calendar size={12} className="text-purple-600" />
                  <select
                    value={contextDate}
                    onChange={(e) => setContextDate(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#2e1065',
                      outline: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      paddingRight: '2px',
                    }}
                  >
                    <option value="Hari Ini">Hari Ini</option>
                    <option value="Besok">Besok</option>
                    <option value="Lusa">Lusa</option>
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Minggu">Minggu</option>
                  </select>
                </div>
              </div>

              <div className="small text-muted d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
                Shift+Enter untuk baris baru
              </div>
            </div>

            {/* Clean Textarea */}
            <textarea
              className="textarea-clean"
              rows={2}
              placeholder="Enter untuk mengirim, Shift + Enter untuk baris baru..."
              value={inputPlan}
              onChange={(e) => setInputPlan(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Send Button */}
            <div className="d-flex justify-content-end pt-1">
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputPlan.trim() || isLoading}
                className="btn-send-purple"
              >
                <Send size={14} />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => { }}
      />

      {/* Preset Picker Modal */}
      {isPresetsOpen && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2.5 border-purple-100">
              <div className="d-flex align-items-center gap-2.5">
                <div className="brand-icon-box" style={{ width: '36px', height: '36px' }}>
                  <ListChecks size={18} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#2e1065', fontSize: '0.98rem' }}>Pilih Contoh Rencana</h6>
                  <small className="text-muted" style={{ fontSize: '0.73rem' }}>Uji kelayakan jadwal dengan skenario nyata</small>
                </div>
              </div>
              <button onClick={() => setIsPresetsOpen(false)} className="btn-close-custom">
                <X size={17} />
              </button>
            </div>

            <div className="modal-body-scroll pe-1 mb-3">
              {PRESET_TEST_CASES.map((tc) => (
                <div
                  key={tc.id}
                  onClick={() => handleLoadPreset(tc.text, tc.date)}
                  className="preset-modal-card"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-bold" style={{ color: '#2e1065', fontSize: '0.85rem' }}>{tc.title}</span>
                    <span
                      className="badge rounded-pill fw-semibold"
                      style={{
                        fontSize: '0.68rem',
                        backgroundColor: '#ede9fe',
                        color: '#5b21b6',
                        border: '1px solid #c4b5fd',
                        padding: '3px 9px'
                      }}
                    >
                      {tc.tag}
                    </span>
                  </div>

                  <div className="preset-quote-box">
                    <span className="text-muted small me-1">Input:</span>
                    <span style={{ whiteSpace: 'pre-line' }}>{tc.text}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-1">
                    <span className="text-muted" style={{ fontSize: '0.73rem' }}>{tc.desc}</span>
                    <span className="text-purple-700 fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.74rem' }}>
                      <span>Gunakan</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end pt-2 border-top border-purple-100">
              <button
                onClick={() => setIsPresetsOpen(false)}
                className="btn btn-light btn-sm border border-purple-200 px-3 fw-semibold text-secondary"
                style={{ fontSize: '0.78rem', borderRadius: '8px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

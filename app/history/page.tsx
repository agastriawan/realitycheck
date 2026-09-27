'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HistoryItem } from '@/types/analysis';
import { getHistory, deleteHistoryItem, clearAllHistory } from '@/lib/storage';
import { HistoryCard } from '@/components/HistoryCard';
import { AnalysisResult } from '@/components/AnalysisResult';
import { History, Trash2, ArrowLeft, Filter, Sparkles, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const items = getHistory();
    setHistoryItems(items);
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    loadItems();
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat analisis?')) {
      clearAllHistory();
      setHistoryItems([]);
      setSelectedItem(null);
    }
  };

  const filtered = historyItems.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.result.status === filterStatus;
  });

  return (
    <div className="container py-4 py-md-5">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link href="/" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
              <ArrowLeft size={14} /> Kembali ke Analyzer
            </Link>
          </div>
          <h1 className="h3 fw-bold mb-0 d-flex align-items-center gap-2">
            <History className="text-primary" size={24} /> Riwayat Analisis
          </h1>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5"
          >
            <Trash2 size={14} /> Hapus Semua
          </button>
        )}
      </div>

      {/* Detail View if an item is selected */}
      {selectedItem ? (
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
            >
              <ArrowLeft size={15} /> Kembali ke Daftar Riwayat
            </button>
          </div>

          <AnalysisResult
            result={selectedItem.result}
            planText={selectedItem.planText}
            contextDate={selectedItem.contextDate}
          />
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          {historyItems.length > 0 && (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
              <div className="d-flex align-items-center gap-2">
                <Filter size={15} className="text-muted" />
                <span className="small text-muted fw-semibold">Filter Status:</span>
                <div className="btn-group btn-group-sm" role="group">
                  <button
                    type="button"
                    className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    Semua ({historyItems.length})
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === 'realistis' ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterStatus('realistis')}
                  >
                    Realistis
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === 'perlu_penyesuaian' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterStatus('perlu_penyesuaian')}
                  >
                    Penyesuaian
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === 'berisiko_terlalu_padat' ? 'btn-danger' : 'btn-outline-secondary'}`}
                    onClick={() => setFilterStatus('berisiko_terlalu_padat')}
                  >
                    Padat
                  </button>
                </div>
              </div>

              <span className="text-muted small">
                Menampilkan {filtered.length} dari {historyItems.length} riwayat
              </span>
            </div>
          )}

          {/* Grid of history cards */}
          {filtered.length > 0 ? (
            <div className="row g-3">
              {filtered.map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <HistoryCard
                    item={item}
                    onSelect={(i) => setSelectedItem(i)}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          ) : historyItems.length > 0 ? (
            <div className="text-center py-5">
              <AlertCircle size={36} className="text-muted mb-2" />
              <p className="text-muted">Tidak ada riwayat dengan filter status yang dipilih.</p>
            </div>
          ) : (
            <div className="text-center py-5 card-custom p-5">
              <History size={48} className="text-muted mb-3 opacity-50" />
              <h4 className="fw-bold mb-2">Belum Ada Riwayat Analisis</h4>
              <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '400px' }}>
                Rencana aktivitas yang kamu analisis akan otomatis tersimpan di sini secara lokal di browsermu.
              </p>
              <Link href="/" className="btn btn-primary d-inline-flex align-items-center gap-2">
                <Sparkles size={16} /> Mulai Analisis Rencana
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

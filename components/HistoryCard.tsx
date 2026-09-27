import React from 'react';
import { HistoryItem } from '@/types/analysis';
import { StatusBadge } from './StatusBadge';
import { Calendar, Trash2, ArrowUpRight, Clock, AlertTriangle } from 'lucide-react';

interface HistoryCardProps {
  item: HistoryItem;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ item, onSelect, onDelete }) => {
  const formattedDate = new Date(item.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="card-custom history-card h-100 d-flex flex-column justify-content-between p-3.5">
      <div>
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <StatusBadge status={item.result.status} size="sm" />
          <div className="d-flex align-items-center gap-1">
            <span className="badge bg-light text-muted border small">
              Score {item.result.score}/100
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="btn btn-icon-subtle text-danger p-1"
              title="Hapus riwayat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="history-meta d-flex align-items-center gap-2 text-muted small mb-2">
          <span className="d-inline-flex align-items-center gap-1">
            <Clock size={12} /> {formattedDate}
          </span>
          {item.contextDate && (
            <span className="badge bg-secondary-subtle text-secondary py-0.5 px-2">
              <Calendar size={11} className="me-1" />
              {item.contextDate}
            </span>
          )}
        </div>

        <p className="history-plan-text text-dark mb-2">
          {item.planText.length > 130 ? `${item.planText.slice(0, 130)}...` : item.planText}
        </p>

        {item.result.conflicts && item.result.conflicts.length > 0 && (
          <div className="d-flex align-items-center gap-1 text-danger small mb-2">
            <AlertTriangle size={13} />
            <span>{item.result.conflicts.length} konflik jadwal</span>
          </div>
        )}
      </div>

      <div className="pt-2 border-top mt-2 d-flex align-items-center justify-content-between">
        <span className="text-muted small">
          {item.result.activities?.length || 0} aktivitas terdeteksi
        </span>
        <button
          onClick={() => onSelect(item)}
          className="btn btn-outline-primary btn-sm py-1 px-2.5 d-inline-flex align-items-center gap-1"
        >
          <span>Lihat Detail</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ConflictItem } from '@/types/analysis';
import { AlertCircle, Zap } from 'lucide-react';

interface ConflictCardProps {
  conflicts: ConflictItem[];
}

export const ConflictCard: React.FC<ConflictCardProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  return (
    <div className="card-feature card-conflict mb-4">
      <div className="card-feature-header">
        <div className="d-flex align-items-center gap-2">
          <div className="icon-wrapper icon-danger">
            <Zap size={18} />
          </div>
          <div>
            <h5 className="card-feature-title mb-0">Konflik Waktu Terdeteksi</h5>
            <small className="text-muted">Aktivitas yang saling bertabrakan atau tumpang tindih</small>
          </div>
        </div>
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">
          {conflicts.length} Konflik
        </span>
      </div>

      <div className="card-feature-body">
        <div className="conflict-list">
          {conflicts.map((conflict, index) => (
            <div key={index} className={`conflict-item severity-${conflict.severity}`}>
              <div className="conflict-icon">
                <AlertCircle size={18} />
              </div>
              <div className="conflict-content">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className={`severity-tag severity-${conflict.severity}`}>
                    {conflict.severity === 'high' ? 'Tingkat Tinggi' : conflict.severity === 'medium' ? 'Tingkat Sedang' : 'Tingkat Ringan'}
                  </span>
                </div>
                <p className="conflict-text mb-0">{conflict.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

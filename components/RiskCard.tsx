import React from 'react';
import { RiskItem } from '@/types/analysis';
import { ShieldAlert, Flame } from 'lucide-react';

interface RiskCardProps {
  risks: RiskItem[];
}

export const RiskCard: React.FC<RiskCardProps> = ({ risks }) => {
  if (!risks || risks.length === 0) {
    return null;
  }

  return (
    <div className="card-feature card-risk mb-4">
      <div className="card-feature-header">
        <div className="d-flex align-items-center gap-2">
          <div className="icon-wrapper icon-warning">
            <Flame size={18} />
          </div>
          <div>
            <h5 className="card-feature-title mb-0">Potensi Risiko & Kepadatan</h5>
            <small className="text-muted">Faktor kelelahan, kurang istirahat, atau jadwal terlalu padat</small>
          </div>
        </div>
        <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1">
          {risks.length} Risiko
        </span>
      </div>

      <div className="card-feature-body">
        <div className="risk-list">
          {risks.map((risk, index) => (
            <div key={index} className={`risk-item severity-${risk.severity}`}>
              <div className="risk-icon">
                <ShieldAlert size={18} />
              </div>
              <div className="risk-content">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className={`severity-tag severity-${risk.severity}`}>
                    {risk.severity === 'high' ? 'Risiko Tinggi' : risk.severity === 'medium' ? 'Risiko Sedang' : 'Perhatian'}
                  </span>
                </div>
                <p className="risk-text mb-0">{risk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

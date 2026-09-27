import React from 'react';
import { FeasibilityStatus } from '@/types/analysis';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: FeasibilityStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 13;

  const getStatusConfig = (s: FeasibilityStatus) => {
    switch (s) {
      case 'realistis':
        return {
          label: 'Realistis',
          className: 'badge-status-realistic',
          icon: <CheckCircle2 size={iconSize} className="flex-shrink-0" />,
        };
      case 'perlu_penyesuaian':
        return {
          label: 'Perlu Penyesuaian',
          className: 'badge-status-warning',
          icon: <AlertTriangle size={iconSize} className="flex-shrink-0" />,
        };
      case 'berisiko_terlalu_padat':
        return {
          label: 'Berisiko Terlalu Padat',
          className: 'badge-status-danger',
          icon: <AlertOctagon size={iconSize} className="flex-shrink-0" />,
        };
      default:
        return {
          label: 'Belum Dianalisis',
          className: 'badge-status-realistic',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`status-badge status-badge-${size} ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

interface RecommendationCardProps {
  recommendations: string[];
  missingInformation: string[];
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendations,
  missingInformation,
}) => {
  return (
    <div className="row g-4 mb-4">
      {recommendations && recommendations.length > 0 && (
        <div className={missingInformation && missingInformation.length > 0 ? 'col-lg-6' : 'col-12'}>
          <div className="card-feature card-recommendation h-100">
            <div className="card-feature-header">
              <div className="d-flex align-items-center gap-2">
                <div className="icon-wrapper icon-primary">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h5 className="card-feature-title mb-0">Rekomendasi Penyesuaian</h5>
                  <small className="text-muted">Alternatif perbaikan yang dapat dipertimbangkan</small>
                </div>
              </div>
            </div>

            <div className="card-feature-body">
              <ul className="recommendation-list">
                {recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">
                    <div className="recommendation-bullet">
                      <span>{index + 1}</span>
                    </div>
                    <div className="recommendation-text">{rec}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {missingInformation && missingInformation.length > 0 && (
        <div className={recommendations && recommendations.length > 0 ? 'col-lg-6' : 'col-12'}>
          <div className="card-feature card-missing h-100">
            <div className="card-feature-header">
              <div className="d-flex align-items-center gap-2">
                <div className="icon-wrapper icon-info">
                  <Info size={18} />
                </div>
                <div>
                  <h5 className="card-feature-title mb-0">Informasi Belum Tersedia</h5>
                  <small className="text-muted">Faktor penting yang belum dicantumkan</small>
                </div>
              </div>
            </div>

            <div className="card-feature-body">
              <ul className="missing-list">
                {missingInformation.map((item, index) => (
                  <li key={index} className="missing-item">
                    <span className="missing-bullet">•</span>
                    <span className="missing-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

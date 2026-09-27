export type FeasibilityStatus = 'realistis' | 'perlu_penyesuaian' | 'berisiko_terlalu_padat';

export type SeverityLevel = 'high' | 'medium' | 'low';

export interface ActivityItem {
  name: string;
  start: string;
  end: string;
  duration_minutes: number;
}

export interface ConflictItem {
  severity: SeverityLevel;
  description: string;
}

export interface RiskItem {
  severity: SeverityLevel;
  description: string;
}

export interface AnalysisResponse {
  status: FeasibilityStatus;
  score: number;
  summary: string;
  activities: ActivityItem[];
  conflicts: ConflictItem[];
  risks: RiskItem[];
  recommendations: string[];
  missing_information: string[];
}

export interface AnalysisRequest {
  planText: string;
  contextDate?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  planText: string;
  contextDate?: string;
  result: AnalysisResponse;
}


export interface RegulatoryUpdate {
  id: string;
  source: 'CBI' | 'EIOPA' | 'Pensions Authority';
  title: string;
  summary: string;
  date: string;
  impactScore: number;
  category: string;
  url: string;
  analysis?: string;
}

export interface ImpactAnalysis {
  overallSentiment: 'Neutral' | 'Positive' | 'Critical';
  keyRisks: string[];
  recommendedActions: string[];
  summary: string;
}

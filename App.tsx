
import React, { useState, useEffect } from 'react';
import { RegulatoryUpdate, ImpactAnalysis } from './types';
import { fetchRegulatoryUpdates, generateAggregatedAnalysis } from './services/geminiService';
import { UpdateCard } from './components/UpdateCard';

export default function App() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { updates: fetched } = await fetchRegulatoryUpdates();
        setUpdates(fetched);
        if (fetched.length > 0) {
          const res = await generateAggregatedAnalysis(fetched);
          setAnalysis(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Regulatory Monitor</h1>
        <p className="text-slate-500">Ireland Insurance & Pensions Intelligence</p>
      </header>
      
      {loading ? (
        <div className="text-center py-20 font-bold text-slate-400">Scanning regulatory portals...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {updates.map(u => <UpdateCard key={u.id} update={u} />)}
          </div>
          <div className="bg-slate-900 text-white p-8 rounded-3xl h-fit sticky top-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6">AI Risk Analysis</h2>
            {analysis && (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-400 uppercase mb-1">Sentiment</div>
                  <div className="text-lg font-bold">{analysis.overallSentiment}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase mb-1">Recommended Actions</div>
                  <ul className="text-sm space-y-2 list-disc pl-4 text-slate-300">
                    {analysis.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

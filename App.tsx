import React, { useState, useEffect } from 'react';
import { RegulatoryUpdate, ImpactAnalysis } from './types';
import { fetchRegulatoryUpdates, generateAggregatedAnalysis } from './services/geminiService';
import { UpdateCard } from './components/UpdateCard';

export default function App() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
  const [grounding, setGrounding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { updates: fetched, groundingMetadata } = await fetchRegulatoryUpdates();
      setUpdates(fetched);
      setGrounding(groundingMetadata);
      
      if (fetched && fetched.length > 0) {
        const res = await generateAggregatedAnalysis(fetched);
        setAnalysis(res);
      }
    } catch (e: any) {
      console.error("Failed to initialize dashboard:", e);
      setError(e.message || "An unexpected error occurred while connecting to the regulatory intelligence engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Regulatory Network Status: {loading ? 'Scanning' : 'Connected'}</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-2 italic">Regulatory Monitor</h1>
            <p className="text-lg text-slate-500 font-medium">Ireland Financial Services Intelligence Dashboard</p>
          </div>
          <div className="md:text-right flex flex-col items-end">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">System Timestamp</p>
            <p className="text-sm font-bold text-slate-600 uppercase mb-4">{new Date().toLocaleDateString('en-IE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <button 
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Refreshing...' : 'Force Refresh'}
              <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          </div>
        </header>
        
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold mb-1">Intelligence Retrieval Failed</h3>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button onClick={loadData} className="px-4 py-2 bg-red-100 rounded-full text-xs font-bold hover:bg-red-200">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Querying Global Regulators</p>
              <p className="text-slate-400 text-sm">Aggregating CBI & EIOPA data streams...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {updates.length > 0 ? (
                  updates.map(u => <UpdateCard key={u.id || Math.random()} update={u} />)
                ) : (
                  <div className="col-span-full p-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                      </div>
                      <p className="font-bold text-slate-900 mb-1">No Active Updates Found</p>
                      <p className="text-sm text-slate-500 mb-6">The search query returned no recent items. This could be due to a lack of recent activity or strict search parameters.</p>
                      <button onClick={loadData} className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Retry Comprehensive Scan</button>
                    </div>
                  </div>
                )}
              </div>
              
              {grounding?.searchEntryPoint && (
                <div className="p-6 bg-slate-100/50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path></svg>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Grounding Citations</p>
                  </div>
                  <div className="text-xs text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: grounding.searchEntryPoint.renderedContent }} />
                </div>
              )}
            </div>

            <div className="lg:col-span-4">
              <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl h-fit sticky top-12 border border-slate-800">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Intelligence Insights</h2>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-blue-400/50 rounded-full"></span>
                    <span className="w-1 h-1 bg-blue-400/20 rounded-full"></span>
                  </div>
                </div>
                
                {analysis ? (
                  <div className="space-y-10">
                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Overall Stance</h3>
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${
                        analysis.overallSentiment.toLowerCase().includes('critical') 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {analysis.overallSentiment}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Summary</h3>
                      <p className="text-sm leading-relaxed text-slate-300 font-medium italic">"{analysis.summary}"</p>
                    </section>

                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Priority Actions</h3>
                      <ul className="space-y-4">
                        {analysis.recommendedActions.map((a, i) => (
                          <li key={i} className="flex gap-4 items-start group">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 group-hover:scale-150 transition-transform"></div>
                            <p className="text-sm text-slate-300 leading-snug">{a}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Awaiting Content</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
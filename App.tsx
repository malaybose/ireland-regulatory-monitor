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
  const [systemLogs, setSystemLogs] = useState<string[]>(["Initializing System..."]);

  const addLog = (msg: string) => setSystemLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      addLog("Starting Regulatory Scan...");
      
      const { updates: fetched, groundingMetadata, log } = await fetchRegulatoryUpdates();
      if (log) addLog(log);
      
      setUpdates(fetched || []);
      setGrounding(groundingMetadata);
      
      if (fetched && fetched.length > 0) {
        addLog("Generating Risk Analysis...");
        const res = await generateAggregatedAnalysis(fetched);
        setAnalysis(res);
        addLog("Analysis complete.");
      } else {
        addLog("No new items found.");
      }
    } catch (e: any) {
      addLog(`Critical Failure: ${e.message}`);
      setError(e.message || "Connection failure.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Network Status: {loading ? 'Scanning' : 'Connected'}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-2 italic uppercase">Monitor v1.0</h1>
            <p className="text-lg text-slate-500 font-medium">Ireland Financial Services Intelligence</p>
          </div>
          <div className="md:text-right flex flex-col items-end">
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1">Last Update</p>
            <p className="text-sm font-bold text-slate-900 uppercase mb-4">{new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            <button 
              onClick={loadData}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              {loading ? 'Rescanning...' : 'Rescan Portals'}
            </button>
          </div>
        </header>

        {loading && updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Synchronizing Streams...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Live Intelligence Stream</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {updates.map(u => <UpdateCard key={u.id} update={u} />)}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl h-fit sticky top-12 border border-slate-800">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-8">AI Risk Vector Analysis</h2>
                
                {analysis ? (
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Market Sentiment</h3>
                      <div className="text-2xl font-black italic">{analysis.overallSentiment}</div>
                    </section>

                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Strategy Summary</h3>
                      <p className="text-sm leading-relaxed text-slate-300 font-medium italic opacity-80">"{analysis.summary}"</p>
                    </section>

                    <section>
                      <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Urgent Actions</h3>
                      <ul className="space-y-3">
                        {analysis.recommendedActions.map((a, i) => (
                          <li key={i} className="flex gap-3 items-start group">
                            <div className="mt-1.5 w-1 h-1 bg-blue-500 rounded-full shrink-0"></div>
                            <p className="text-xs text-slate-400 group-hover:text-white transition-colors">{a}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Processing Context</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Log:</span>
            <div className="flex gap-4">
              {systemLogs.map((log, i) => (
                <span key={i} className={`text-[9px] font-mono ${i === systemLogs.length - 1 ? 'text-blue-600 font-bold' : 'text-slate-300'}`}>
                  {log}
                </span>
              ))}
            </div>
          </div>
          <div className="text-[10px] font-medium text-slate-400">
            &copy; 2025 Regulatory Monitor | Ireland Finance Intelligence
          </div>
        </div>
      </footer>
    </div>
  );
}
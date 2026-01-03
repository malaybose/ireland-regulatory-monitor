
import React from 'react';
import { RegulatoryUpdate } from '../types';

export const UpdateCard: React.FC<{ update: RegulatoryUpdate }> = ({ update }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{update.source}</span>
      <span className="text-xs text-slate-400">{update.date}</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{update.title}</h3>
    <p className="text-sm text-slate-600 mb-4">{update.summary}</p>
    <div className="flex items-center justify-between mt-auto">
      <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded">Impact: {update.impactScore}/10</span>
      <a href={update.url} target="_blank" className="text-sm font-bold text-blue-600 hover:underline">Read More</a>
    </div>
  </div>
);

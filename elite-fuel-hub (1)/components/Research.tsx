
import React, { useState } from 'react';
import { researchTopic } from '../services/geminiService';
import { ResearchResult } from '../types';
import { parseMarkdown } from '../utils/markdown';

const Research: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await researchTopic(query);
    setResult(res);
    setLoading(false);
  };

  const trendingTopics = [
    "Creatine for sprinters",
    "Best budget magnesium sources",
    "Ashwagandha for cortisol",
    "Dorm-friendly high protein snacks",
    "Caffeine timing for max power"
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">🔎 Performance Research</h2>
        <p className="text-slate-500">Grounded search for the latest in athletic science and budget hacks.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
            placeholder="Search supplements, latest studies, or budget tips..."
            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            onClick={handleResearch}
            disabled={loading || !query.trim()}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Analyze'}
          </button>
        </div>

        {!result && !loading && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Trending Topics</p>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingTopics.map(topic => (
                <button 
                  key={topic}
                  onClick={() => { setQuery(topic); }}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 animate-pulse font-medium">Scouring athletic journals and web databases...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {/* Use parseMarkdown instead of manual replacement for better formatting */}
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(result.text) }} />
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Sources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-500 hover:shadow-md transition group"
                    >
                      <span className="text-sm font-medium text-slate-700 truncate mr-2">{source.title}</span>
                      <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;

import React, { useState, useEffect } from 'react';
import { generateGroceryPlan } from '../services/geminiService';
import { AthleteStats, SavedGroceryPlan } from '../types';
import { parseMarkdown } from '../utils/markdown';

interface Props {
  stats: AthleteStats;
}

const GroceryList: React.FC<Props> = ({ stats }) => {
  const [budget, setBudget] = useState('60');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedGroceryPlan[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('elite_fuel_groceries');
    if (saved) setSavedPlans(JSON.parse(saved).slice(0, 4));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generateGroceryPlan({
      stats,
      budget,
      location,
      favoriteFoods: '',
      preferences: ''
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700 pb-12">
      <div className="border-l-8 border-black pl-8 space-y-2">
        <h2 className="text-6xl font-black tracking-tighter uppercase leading-none italic">PROVISIONS <span className="not-italic">🛒</span></h2>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-[0.3em]">Market procurement strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 border-2 border-zinc-100 rounded-[2.5rem] space-y-8 shadow-sm">
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Weekly Budget ($)</label>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-sm font-black italic focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Stores / Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. WALMART / ALDI" className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-xs font-black italic focus:ring-2 focus:ring-black outline-none placeholder:text-zinc-300" />
                </div>
             </div>

             <button onClick={handleGenerate} disabled={loading} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-zinc-800 disabled:opacity-30 shadow-2xl transition-all active:scale-95">
               {loading ? 'CALCULATING COST...' : 'GENERATE STRATEGY'}
             </button>
          </div>

          <div className="bg-zinc-50 p-10 rounded-[2.5rem] space-y-8">
             <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">Budget Hacks</h4>
             <ul className="space-y-4">
                {[
                  { i: '🥚', t: 'Bulk Eggs: Cheapest high-DIAAS protein source.' },
                  { i: '🍚', t: '5lb Rice: Foundation of all performance meals.' },
                  { i: '🥦', t: 'Frozen Greens: Nutrient density at 40% cost.' },
                ].map(hack => (
                  <li key={hack.t} className="flex gap-4 items-start">
                    <span className="text-lg">{hack.i}</span>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed tracking-wider">{hack.t}</p>
                  </li>
                ))}
             </ul>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
           {result ? (
             <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
                <div className="bg-white p-12 border-2 border-zinc-100 rounded-[3rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                  <div className="relative z-10 prose prose-sm max-w-none grocery-output" dangerouslySetInnerHTML={{ __html: parseMarkdown(result.text) }} />
                </div>
                {result.sources.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {result.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="px-6 py-3 bg-white border border-zinc-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-black transition-colors">🔗 {s.title}</a>
                    ))}
                  </div>
                )}
             </div>
           ) : (
             <div className="h-full min-h-[400px] border-2 border-dashed border-zinc-100 rounded-[3.5rem] flex flex-col items-center justify-center opacity-30">
                <span className="text-6xl mb-6">📝</span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Awaiting Provision Protocol</p>
             </div>
           )}
        </div>
      </div>

      <style>{`
        .grocery-output h3 { background: #000; color: #fff; padding: 1rem 2rem; border-radius: 1rem; margin: 2rem 0 1rem 0; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 900; }
        .grocery-output h3:first-of-type { margin-top: 0; }
        .grocery-output ul { padding: 0; margin: 0; }
        .grocery-output li { list-style: none; padding: 1.5rem; border-bottom: 1px solid #f1f1f1; display: flex; align-items: center; gap: 1rem; }
        .grocery-output li:last-child { border-bottom: none; }
      `}</style>
    </div>
  );
};

export default GroceryList;
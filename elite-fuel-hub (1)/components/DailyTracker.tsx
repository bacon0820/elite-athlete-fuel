
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AthleteStats, HistoricalEntry } from '../types';

interface Props {
  stats: AthleteStats;
}

const DailyTracker: React.FC<Props> = ({ stats }) => {
  // Target calculations derived from stats (same logic as FuelLab)
  const targets = useMemo(() => {
    const weightKg = stats.weightLbs / 2.20462;
    const heightCm = ((stats.heightFt * 12) + stats.heightIn) * 2.54;
    let bmr = stats.gender === 'male' 
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * stats.age) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * stats.age) - 161;

    let tdee = Math.round(bmr * (stats.dailyActivity + stats.trainingFreq));
    if (stats.goal === 'loss') tdee = Math.round(tdee * 0.85);
    else if (stats.goal === 'gain') tdee = Math.round(tdee * 1.15);
    
    const proteinG = Math.round(stats.weightLbs * (stats.goal === 'loss' ? 1.1 : 1.0));
    const fatG = Math.round(stats.weightLbs * 0.4);
    const carbG = Math.max(0, Math.round((tdee - (proteinG * 4 + fatG * 9)) / 4));

    return { tdee, proteinG, fatG, carbG };
  }, [stats]);

  const [log, setLog] = useState({
    trained: false,
    water: false,
    stress: 5,
    soreness: 5,
    sleep: 7.5,
    actualProtein: 0,
    actualCarbs: 0,
    actualFats: 0
  });

  const [score, setScore] = useState(0);
  const [fullHistory, setFullHistory] = useState<HistoricalEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('athlete_history');
      if (saved) setFullHistory(JSON.parse(saved));
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  useEffect(() => {
    let s = 0;
    
    // Performance Markers (30 pts)
    if (log.trained) s += 15;
    if (log.water) s += 5;
    if (log.sleep >= 8) s += 10; else if (log.sleep >= 6) s += 5;

    // Subjective Readiness (20 pts)
    s += (11 - log.stress);
    s += (11 - log.soreness);

    // Nutrition Accuracy (50 pts)
    // We award points based on how close the athlete is to their targets (within 10% is ideal)
    const checkTarget = (actual: number, target: number) => {
      if (target === 0) return 0;
      const diff = Math.abs(actual - target) / target;
      if (diff <= 0.05) return 1; // Within 5%
      if (diff <= 0.15) return 0.7; // Within 15%
      if (diff <= 0.25) return 0.3; // Within 25%
      return 0;
    };

    const pScore = checkTarget(log.actualProtein, targets.proteinG) * 20;
    const cScore = checkTarget(log.actualCarbs, targets.carbG) * 20;
    const fScore = checkTarget(log.actualFats, targets.fatG) * 10;

    s += (pScore + cScore + fScore);

    setScore(Math.min(100, Math.round(s)));
  }, [log, targets]);

  const handleSubmitLog = () => {
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    const savedHistory: HistoricalEntry[] = JSON.parse(localStorage.getItem('athlete_history') || '[]');
    const entryIdx = savedHistory.findIndex((h) => h.date === today);
    
    const entry: HistoricalEntry = {
      date: today, 
      weight: stats.weightLbs, 
      calories: log.actualProtein * 4 + log.actualCarbs * 4 + log.actualFats * 9, 
      protein: targets.proteinG, 
      carbs: targets.carbG, 
      fats: targets.fatG, 
      actualProtein: log.actualProtein,
      actualCarbs: log.actualCarbs,
      actualFats: log.actualFats,
      score: score
    };

    if (entryIdx >= 0) savedHistory[entryIdx] = entry;
    else savedHistory.push(entry);

    localStorage.setItem('athlete_history', JSON.stringify(savedHistory.slice(-30)));
    setFullHistory(savedHistory.slice(-30));
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="border-l-[12px] border-black pl-8 space-y-2">
        <h2 className="text-7xl font-black tracking-tighter uppercase leading-none italic">DAILY READINESS <span className="not-italic text-5xl ml-4">⚡</span></h2>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-[0.4em]">{stats.sport} Performance Protocol</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input Controls */}
        <div className="lg:col-span-7 space-y-12">
          {/* Readiness Section */}
          <div className="bg-white border-2 border-zinc-100 p-10 rounded-[3rem] space-y-10 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Morning Check-in
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'trained', label: 'Workout Completed', icon: '🏋️' },
                { id: 'water', label: 'Hydration Target', icon: '💧' }
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setLog(prev => ({...prev, [item.id]: !log[item.id as keyof typeof log]}))}
                  className={`flex items-center justify-between p-6 rounded-2xl transition-all border-2 ${log[item.id as keyof typeof log] ? 'bg-black text-white border-black shadow-lg scale-[1.02]' : 'bg-zinc-50 border-zinc-50 hover:bg-zinc-100 text-zinc-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${log[item.id as keyof typeof log] ? 'border-white' : 'border-zinc-300'}`}>
                    {log[item.id as keyof typeof log] && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Mental Fatigue</label>
                  <span className="text-xs font-black">{log.stress}/10</span>
                </div>
                <input type="range" min="1" max="10" value={log.stress} onChange={(e) => setLog(p => ({...p, stress: parseInt(e.target.value)}))} className="w-full h-1 bg-zinc-100 rounded-full accent-black outline-none" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Body Soreness</label>
                  <span className="text-xs font-black">{log.soreness}/10</span>
                </div>
                <input type="range" min="1" max="10" value={log.soreness} onChange={(e) => setLog(p => ({...p, soreness: parseInt(e.target.value)}))} className="w-full h-1 bg-zinc-100 rounded-full accent-black outline-none" />
              </div>
            </div>
          </div>

          {/* Nutrition Input Section */}
          <div className="bg-white border-2 border-zinc-100 p-10 rounded-[3rem] space-y-10 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Daily Macronutrient Intake
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Use 'as const' to narrow the 'id' type and avoid boolean keys when indexing 'log' */}
              {([
                { id: 'actualProtein', label: 'Protein', target: targets.proteinG, unit: 'g', color: 'text-zinc-900' },
                { id: 'actualCarbs', label: 'Carbs', target: targets.carbG, unit: 'g', color: 'text-zinc-600' },
                { id: 'actualFats', label: 'Fats', target: targets.fatG, unit: 'g', color: 'text-zinc-400' }
              ] as const).map(macro => (
                <div key={macro.id} className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 italic">{macro.label}</label>
                    <span className="text-[8px] font-black text-zinc-300 uppercase">Target: {macro.target}g</span>
                  </div>
                  <div className="relative group">
                    <input 
                      type="number" 
                      // macro.id is now narrowed to numeric keys, fixing the boolean assignment error
                      value={log[macro.id] || ''} 
                      onChange={(e) => setLog(prev => ({...prev, [macro.id]: parseInt(e.target.value) || 0}))}
                      className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-xl font-black italic focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-zinc-200"
                      placeholder="0"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-300">G</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Readiness Score & Submission */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-black rounded-[4rem] p-16 text-white text-center shadow-2xl relative overflow-hidden h-full flex flex-col items-center justify-between">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col items-center py-10">
               <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 border-white/10 mb-8 ${score > 85 ? 'bg-zinc-800' : 'bg-transparent'}`}>
                  <span className="text-3xl">{score > 85 ? '🔋' : score > 60 ? '⚡' : '🪫'}</span>
               </div>
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Readiness Index</p>
               <h4 className="text-[11rem] font-black leading-none tracking-tighter italic">{score}<span className="text-3xl not-italic opacity-20">%</span></h4>
               <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em] mt-8 bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800">
                 {score > 85 ? 'OPTIMIZED' : score > 60 ? 'FUNCTIONAL' : 'RECOVERY REQUIRED'}
               </p>
             </div>

             <button 
              onClick={handleSubmitLog} 
              className={`w-full py-7 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[10px] transition-all relative z-10 active:scale-95 italic ${saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-zinc-100 shadow-2xl shadow-white/5'}`}
             >
               {saveStatus === 'success' ? 'LOG ARCHIVED' : 'COMMIT PERFORMANCE LOG'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;

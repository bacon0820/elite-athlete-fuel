import React, { useMemo, useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, CartesianGrid, XAxis, YAxis 
} from 'recharts';
import { AthleteStats, HistoricalEntry, SavedMeal } from '../types';

const SPORTS_CONFIG: Record<string, string[]> = {
  "Football": ["Wide Receiver", "Running Back", "Lineman", "DB", "QB"],
  "Basketball": ["Guard", "Forward", "Center"],
  "Soccer": ["Forward", "Midfield", "Defense"],
  "Track & Field": ["Sprinter", "Distance", "Thrower"],
  "Combat Sports": ["Striker", "Grappler"],
  "Other": ["General Athlete"]
};

interface Props {
  stats: AthleteStats;
  updateStats: (newStats: Partial<AthleteStats>) => void;
  onSaveProfile: () => void;
}

const FuelLab: React.FC<Props> = ({ stats, updateStats, onSaveProfile }) => {
  const [history, setHistory] = useState<HistoricalEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const calculations = useMemo(() => {
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

  useEffect(() => {
    const savedHistory = localStorage.getItem('athlete_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleSave = () => {
    onSaveProfile();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const MacroRow = ({ label, value, color, icon }: any) => (
    <div className="group space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 group-hover:text-black transition-colors">{icon}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-black">{label}</span>
        </div>
        <span className="text-sm font-black text-black">{value}g</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(100, (value / (label === 'Protein' ? 300 : label === 'Carbs' ? 600 : 150)) * 100)}%` }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="border-l-8 border-black pl-8 space-y-2">
        <h2 className="text-6xl font-black tracking-tighter uppercase leading-none italic">THE LAB <span className="not-italic">🔬</span></h2>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-[0.3em]">Precision biometric configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 border-2 border-zinc-100 rounded-[2.5rem] space-y-8 shadow-sm hover:shadow-xl transition-shadow">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Core Configuration
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Sex</label>
                <select value={stats.gender} onChange={(e) => updateStats({ gender: e.target.value as any })} className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-black outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Age</label>
                <input type="number" value={stats.age} onChange={(e) => updateStats({ age: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-xs font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Primary Sport</label>
              <select value={stats.sport} onChange={(e) => updateStats({ sport: e.target.value })} className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-xs font-bold">
                {Object.keys(SPORTS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-1 italic">Performance Goal</label>
              <select value={stats.goal} onChange={(e) => updateStats({ goal: e.target.value as any })} className="w-full p-4 bg-zinc-50 border-none rounded-2xl text-xs font-bold">
                <option value="maintain">🎯 Maintenance</option>
                <option value="loss">⚡ Shred (Deficit)</option>
                <option value="gain">💪 Bulk (Surplus)</option>
              </select>
            </div>

            <button onClick={handleSave} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-zinc-800'}`}>
              {saveStatus === 'saved' ? 'SYNC SUCCESSFUL' : 'COMMIT BIOMETRICS'}
            </button>
          </div>
        </div>

        {/* Data Display */}
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-black p-14 rounded-[3rem] text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800 rounded-full -mr-48 -mt-48 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-12">
                <div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Daily Energy Expenditure</p>
                  <h4 className="text-8xl font-black mt-4 leading-none tracking-tighter italic">{calculations.tdee}</h4>
                  <p className="text-zinc-500 font-bold uppercase text-xs mt-2 italic tracking-widest">Kilocalories / Day</p>
                </div>

                <div className="space-y-8">
                  <MacroRow label="Protein" value={calculations.proteinG} color="bg-white" icon="🍗" />
                  <MacroRow label="Carbs" value={calculations.carbG} color="bg-zinc-400" icon="🍚" />
                  <MacroRow label="Fats" value={calculations.fatG} color="bg-zinc-700" icon="🥑" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={[
                          { name: 'P', value: calculations.proteinG * 4, fill: '#FFFFFF' },
                          { name: 'C', value: calculations.carbG * 4, fill: '#71717A' },
                          { name: 'F', value: calculations.fatG * 9, fill: '#27272A' },
                        ]} 
                        innerRadius={80} 
                        outerRadius={120} 
                        paddingAngle={10} 
                        dataKey="value" 
                        stroke="none"
                      >
                        <Cell key="p" fill="#FFFFFF" />
                        <Cell key="c" fill="#71717A" />
                        <Cell key="f" fill="#27272A" />
                      </Pie>
                      <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-8 mt-6">
                  {['Protein', 'Carbs', 'Fats'].map((m, i) => (
                    <div key={m} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : i === 1 ? 'bg-zinc-400' : 'bg-zinc-800'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 border-2 border-zinc-100 rounded-[3rem] shadow-sm relative group overflow-hidden">
             <div className="flex items-center justify-between mb-12">
               <h3 className="text-sm font-black text-black uppercase tracking-[0.3em] flex items-center gap-4">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                 Mass Projection
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Current Weight</span>
                  </div>
               </div>
             </div>
             
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={history}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#a1a1aa' }} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="weight" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelLab;
import React, { useState, useMemo, useEffect } from 'react';
import { generateWorkout } from '../services/geminiService';
import { AthleteStats } from '../types';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  rpe: string;
  alt: string;
}

type DayBlock = 
  | { id: string, type: 'header', content: string }
  | { id: string, type: 'exercise', data: Exercise }
  | { id: string, type: 'text', content: string };

interface StructuredDay {
  id: string;
  title: string;
  blocks: DayBlock[];
}

const RPE_SCALE = [
  { level: 10, label: "MAX", emoji: "🔥", desc: "No reps left." },
  { level: 8, label: "HEAVY", emoji: "🏋️", desc: "2 reps left." },
  { level: 6, label: "MODERATE", emoji: "💨", desc: "Speed focus." },
  { level: 4, label: "ACTIVE", emoji: "🚶", desc: "Recovery flow." },
];

interface Props {
  stats: AthleteStats;
}

const TrainingPlans: React.FC<Props> = ({ stats }) => {
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [focus, setFocus] = useState('Hypertrophy & Strength');
  const [loading, setLoading] = useState(false);
  const [structuredDays, setStructuredDays] = useState<StructuredDay[]>([]);
  const [expandedDayIdx, setExpandedDayIdx] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  const parseRawWorkout = (raw: string): StructuredDay[] => {
    const dayRegex = /---DAY_START---([\s\S]*?)---DAY_END---/g;
    const matches = [...raw.matchAll(dayRegex)];
    
    return matches.map((match, i) => {
      const dayRaw = match[1].trim();
      const lines = dayRaw.split('\n');
      const titleLine = lines.find(l => l.startsWith('### Day'));
      const title = titleLine ? titleLine.replace('### ', '') : `Day ${i + 1}`;
      
      const blocks: DayBlock[] = [];
      lines.forEach((line, lineIdx) => {
        if (line.startsWith('### Day')) return; // Skip title as it's extracted
        
        const id = `block-${i}-${lineIdx}`;
        if (line.startsWith('###')) {
          blocks.push({ id, type: 'header', content: line.replace('### ', '') });
        } else if (line.startsWith('- **') || line.startsWith('-**')) {
          // Parse exercise: - **[Name]** | [Sets] x [Reps] | **Rest: [Time]** | RPE: [Number] [ALT_START] Alt: [Alt] [ALT_END]
          const nameMatch = line.match(/\*\*(.*?)\*\*/);
          const parts = line.split('|').map(p => p.trim());
          const setsReps = parts[1]?.split('x').map(p => p.trim()) || ['0', '0'];
          const rest = parts[2]?.replace('**Rest:', '').replace('**', '').trim() || '60s';
          const rpe = parts[3]?.split('[ALT_START]')[0].replace('RPE:', '').trim() || '8';
          const alt = line.match(/\[ALT_START\] Alt: (.*?) \[ALT_END\]/)?.[1] || '';
          
          blocks.push({
            id,
            type: 'exercise',
            data: {
              id: `ex-${id}`,
              name: nameMatch ? nameMatch[1] : 'Unknown Movement',
              sets: setsReps[0] || '3',
              reps: setsReps[1] || '10',
              rest,
              rpe,
              alt
            }
          });
        } else if (line.trim().length > 0) {
          blocks.push({ id, type: 'text', content: line });
        }
      });

      return { id: `day-${i}`, title, blocks };
    });
  };

  const onGenerate = async () => {
    setLoading(true);
    try {
      const workout = await generateWorkout(stats, daysPerWeek, focus);
      const parsed = parseRawWorkout(workout);
      setStructuredDays(parsed);
      setExpandedDayIdx(0);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = (dayIdx: number, blockId: string, field: keyof Exercise, value: string) => {
    setStructuredDays(prev => prev.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        blocks: day.blocks.map(block => {
          if (block.id === blockId && block.type === 'exercise') {
            return { ...block, data: { ...block.data, [field]: value } };
          }
          return block;
        })
      };
    }));
  };

  const addExercise = (dayIdx: number) => {
    const newEx: Exercise = {
      id: `new-ex-${Date.now()}`,
      name: 'New Movement',
      sets: '3',
      reps: '10',
      rest: '60s',
      rpe: '8',
      alt: ''
    };
    setStructuredDays(prev => prev.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return {
        ...day,
        blocks: [...day.blocks, { id: `block-${Date.now()}`, type: 'exercise', data: newEx }]
      };
    }));
  };

  const removeBlock = (dayIdx: number, blockId: string) => {
    setStructuredDays(prev => prev.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      return { ...day, blocks: day.blocks.filter(b => b.id !== blockId) };
    }));
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="text-left border-l-[12px] border-black pl-8 flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-black tracking-tighter uppercase leading-none italic">
            TRAINING HUB <span className="not-italic text-5xl ml-4">🏋️</span>
          </h2>
          <p className="text-zinc-400 font-bold mt-2 uppercase text-xs tracking-[0.4em]">Proprietary S&C Programming</p>
        </div>
        {structuredDays.length > 0 && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${isEditing ? 'bg-black text-white shadow-2xl' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {isEditing ? 'Lock Split' : 'Modify Split'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white border-2 border-zinc-100 p-10 rounded-[3rem] space-y-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Cycle Control
            </h3>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 italic">Weekly Volume</label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map(d => (
                    <button key={d} onClick={() => setDaysPerWeek(d)} className={`py-4 rounded-2xl font-black text-xs transition-all ${daysPerWeek === d ? 'bg-black text-white shadow-xl scale-105' : 'bg-zinc-50 text-zinc-400 hover:text-black'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 italic">Primary Objective</label>
                <select value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full p-5 bg-zinc-50 border-none rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-black">
                  <option>Power & Explosiveness</option>
                  <option>Hypertrophy & Strength</option>
                  <option>In-Season Maintenance</option>
                  <option>GPP & Conditioning</option>
                </select>
              </div>
              <button onClick={onGenerate} disabled={loading} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-95 transition-all disabled:opacity-50 italic">
                {loading ? 'CALCULATING LOADS...' : 'INITIATE DEPLOYMENT'}
              </button>
            </div>
          </div>
          
          <div className="p-10 bg-zinc-50 rounded-[3rem] space-y-8">
             <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">Intensity Matrix</h4>
             <div className="space-y-6">
               {RPE_SCALE.map(r => (
                 <div key={r.level} className="flex items-center gap-4 group">
                   <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform">{r.level}</div>
                   <div>
                     <p className="text-[10px] font-black uppercase leading-none mb-1.5 flex items-center gap-2">
                        {r.label} <span className="opacity-40">{r.emoji}</span>
                     </p>
                     <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{r.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {structuredDays.length > 0 ? (
            <div className="space-y-6">
              {structuredDays.map((day, idx) => (
                <div key={day.id} className="bg-white border-2 border-zinc-100 rounded-[3.5rem] overflow-hidden transition-all shadow-sm">
                  <button 
                    onClick={() => setExpandedDayIdx(expandedDayIdx === idx ? -1 : idx)} 
                    className={`w-full p-10 flex justify-between items-center text-left transition-colors ${expandedDayIdx === idx ? 'bg-zinc-50' : 'hover:bg-zinc-50/50'}`}
                  >
                    <div className="flex items-center gap-8">
                      <span className="text-4xl font-black text-black opacity-5 leading-none italic">{idx + 1}</span>
                      <div>
                        <h4 className="text-2xl font-black text-black uppercase tracking-tighter leading-none italic">{day.title}</h4>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-3">
                          {day.blocks.filter(b => b.type === 'exercise').length} MOVEMENTS SCHEDULED
                        </p>
                      </div>
                    </div>
                    <svg className={`w-6 h-6 text-zinc-300 transition-transform duration-500 ${expandedDayIdx === idx ? 'rotate-180 text-black' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {expandedDayIdx === idx && (
                    <div className="p-12 space-y-10 animate-in slide-in-from-top-4 duration-500">
                      {day.blocks.map((block) => {
                        if (block.type === 'header') {
                          return (
                            <div key={block.id} className="group relative flex items-center gap-6">
                              <h3 className="bg-black text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic inline-block">{block.content}</h3>
                              {isEditing && (
                                <button onClick={() => removeBlock(idx, block.id)} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </div>
                          );
                        }
                        if (block.type === 'exercise') {
                          const ex = block.data;
                          return (
                            <div key={block.id} className="relative group bg-zinc-50 border border-zinc-100 p-8 rounded-[2.5rem] transition-all hover:bg-white hover:border-black hover:shadow-xl">
                              {isEditing && (
                                <button onClick={() => removeBlock(idx, block.id)} className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20">✕</button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                <div className="md:col-span-5 space-y-1">
                                  {isEditing ? (
                                    <input 
                                      value={ex.name} 
                                      onChange={(e) => updateExercise(idx, block.id, 'name', e.target.value)}
                                      className="bg-transparent border-b-2 border-black/10 focus:border-black text-xl font-black uppercase tracking-tighter outline-none w-full italic"
                                    />
                                  ) : (
                                    <h5 className="text-xl font-black uppercase tracking-tighter italic">{ex.name}</h5>
                                  )}
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Primary Movement</p>
                                </div>
                                
                                <div className="md:col-span-7 grid grid-cols-4 gap-4">
                                  {[
                                    { label: 'SETS', field: 'sets' as const, value: ex.sets },
                                    { label: 'REPS', field: 'reps' as const, value: ex.reps },
                                    { label: 'REST', field: 'rest' as const, value: ex.rest },
                                    { label: 'RPE', field: 'rpe' as const, value: ex.rpe },
                                  ].map(f => (
                                    <div key={f.label} className="text-center">
                                      <p className="text-[8px] font-black text-zinc-300 uppercase tracking-widest mb-1.5">{f.label}</p>
                                      {isEditing ? (
                                        <input 
                                          value={f.value} 
                                          onChange={(e) => updateExercise(idx, block.id, f.field, e.target.value)}
                                          className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-1 text-xs font-black text-center outline-none focus:ring-1 focus:ring-black"
                                        />
                                      ) : (
                                        <p className="text-sm font-black italic">{f.value}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {ex.alt && !isEditing && (
                                <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center gap-3">
                                  <span className="text-[9px] font-black bg-zinc-200 text-zinc-500 px-3 py-1 rounded-md uppercase tracking-widest">Alt</span>
                                  <p className="text-[10px] font-bold text-zinc-400 italic">{ex.alt}</p>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return <p key={block.id} className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed border-l-2 border-zinc-100 pl-6">{block.content}</p>;
                      })}
                      
                      {isEditing && (
                        <button 
                          onClick={() => addExercise(idx)}
                          className="w-full py-8 border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-zinc-300 hover:text-black hover:border-black transition-all group"
                        >
                          <span className="text-2xl group-hover:scale-125 transition-transform">+</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Append Movement</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-dashed border-zinc-100 rounded-[4rem] flex flex-col items-center justify-center opacity-30 text-center p-20">
               <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 border-4 border-zinc-100 mb-8 flex items-center justify-center text-5xl">⚡</div>
               <h4 className="text-xl font-black uppercase tracking-[0.3em] italic">Intelligence Required</h4>
               <p className="text-[10px] font-bold mt-4 uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">System awaiting deployment parameters to synthesize elite programming.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlans;
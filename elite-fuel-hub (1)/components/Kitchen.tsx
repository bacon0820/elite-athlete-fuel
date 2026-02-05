import React, { useState, useEffect, useRef } from 'react';
import { analyzeMealImage, analyzeMealText } from '../services/geminiService';
import { SavedMeal, Goal } from '../types';

interface Props {
  goal: Goal;
}

const Kitchen: React.FC<Props> = ({ goal }) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [editableMacros, setEditableMacros] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisOutput, setAnalysisOutput] = useState<string | null>(null);
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('elite_fuel_meals');
    if (saved) setSavedMeals(JSON.parse(saved).slice(0, 4));
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setImagePreview(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const onAnalyze = async () => {
    if (!description && !imagePreview) return;
    setLoading(true);
    try {
      let res = imagePreview 
        ? await analyzeMealImage(imagePreview.split(',')[1], description, goal)
        : await analyzeMealText(description, goal);
      setAnalysisOutput(res);
      const pMatch = res.match(/Protein:\s*(\d+)/i);
      const cMatch = res.match(/Carbs:\s*(\d+)/i);
      const fMatch = res.match(/Fats:\s*(\d+)/i);
      const calMatch = res.match(/Calories:\s*(\d+)/i);
      setEditableMacros({
        protein: pMatch ? parseInt(pMatch[1]) : 0,
        carbs: cMatch ? parseInt(cMatch[1]) : 0,
        fats: fMatch ? parseInt(fMatch[1]) : 0,
        calories: calMatch ? parseInt(calMatch[1]) : 0
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = () => {
    const newMeal: SavedMeal = {
      id: Date.now().toString(), 
      date: new Date().toISOString(),
      analysis: analysisOutput || "Manual entry", 
      ...editableMacros
    };
    const updated = [newMeal, ...savedMeals];
    setSavedMeals(updated.slice(0, 4));
    localStorage.setItem('elite_fuel_meals', JSON.stringify(updated));
    setAnalysisOutput(null);
    setImagePreview(null);
    setDescription('');
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="border-l-8 border-black pl-8 space-y-2">
        <h2 className="text-6xl font-black tracking-tighter uppercase leading-none italic">KITCHEN <span className="not-italic">🍳</span></h2>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-[0.3em]">AI-Powered fuel analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-black p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 transition-opacity group-hover:opacity-60"></div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 italic">Plate Analysis Engine</h3>
                <div className="flex gap-4">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative aspect-square bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-800 flex items-center justify-center">
                  {isCameraActive ? (
                    <div className="relative w-full h-full">
                      <video ref={videoRef} className="w-full h-full object-cover" />
                      <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_infinite_ease-in-out]"></div>
                      </div>
                      <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-zinc-400 active:scale-90 transition-transform shadow-2xl"></button>
                    </div>
                  ) : imagePreview ? (
                    <div className="relative group w-full h-full">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Meal Preview" />
                      <button onClick={() => setImagePreview(null)} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full hover:bg-black transition-colors">✕</button>
                    </div>
                  ) : (
                    <button onClick={startCamera} className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl group-hover:bg-white/10">📸</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Enable Scanner</span>
                    </button>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex flex-col gap-6">
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="DESCRIBE YOUR PROVISIONS (E.G. 8OZ CHICKEN, 1C RICE...)"
                    className="flex-1 bg-zinc-900 border-none rounded-[2rem] p-8 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-700 focus:ring-2 focus:ring-zinc-700 outline-none resize-none"
                  />
                  <button 
                    onClick={onAnalyze} 
                    disabled={loading || (!description && !imagePreview)}
                    className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-zinc-200 disabled:opacity-30 transition-all active:scale-95 shadow-xl"
                  >
                    {loading ? 'CRUNCHING DATA...' : 'INITIATE SCAN'}
                  </button>
                </div>
              </div>

              {analysisOutput && (
                <div className="bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-800 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { l: 'PRO', v: editableMacros.protein, u: 'g', i: '🍗' },
                      { l: 'CARB', v: editableMacros.carbs, u: 'g', i: '🍚' },
                      { l: 'FAT', v: editableMacros.fats, u: 'g', i: '🥑' },
                      { l: 'CAL', v: editableMacros.calories, u: '', i: '⚡' }
                    ].map(macro => (
                      <div key={macro.l} className="text-center group">
                        <div className="text-xl mb-2 opacity-60 group-hover:opacity-100 transition-opacity">{macro.i}</div>
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">{macro.l}</p>
                        <p className="text-xl font-black">{macro.v}{macro.u}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={saveMeal} className="mt-10 w-full py-4 border border-zinc-800 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors">Commit to Fuel Log</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic flex items-center gap-3">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             Recent Intake Log
           </h3>
           <div className="grid grid-cols-1 gap-6">
              {savedMeals.length > 0 ? savedMeals.map(meal => (
                <div key={meal.id} className="bg-white p-8 border-2 border-zinc-100 rounded-[2.5rem] flex items-center justify-between hover:border-black transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform italic font-black">F</div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tighter leading-none">{meal.calories} KC</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2 italic">{new Date(meal.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                       <p className="text-xs font-black italic">{meal.protein}g</p>
                       <p className="text-[8px] font-black text-zinc-400 uppercase">Pro</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-20 border-2 border-dashed border-zinc-100 rounded-[3rem] text-center opacity-30">
                  <span className="text-4xl block mb-4">🍽️</span>
                  <p className="text-[10px] font-black uppercase tracking-widest italic">Vault Empty</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Kitchen;
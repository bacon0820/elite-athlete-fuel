import React, { useState, useRef, useEffect } from 'react';
import { askCoach } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'coach' | 'system';
}

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setInput('');
    setLoading(true);
    try {
      const coachRes = await askCoach(userMsg);
      setMessages(prev => [...prev, { text: coachRes, sender: 'coach' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { text: `System Alert: ${e.message}`, sender: 'system' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div className="text-left border-l-4 border-black pl-6">
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase leading-none">AI COACH</h2>
        <p className="text-zinc-500 font-bold mt-2 uppercase text-xs tracking-widest">Direct Performance Strategy</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col h-[700px]">
        <div className="px-10 py-6 border-b border-zinc-100 flex items-center bg-white z-10">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center font-black text-white mr-4">B</div>
          <div>
            <h4 className="text-black font-black uppercase text-sm leading-none">Coach Bacon</h4>
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">● Strategic Engine Active</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-zinc-50/50 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
               <h4 className="text-xl font-black text-black uppercase tracking-tighter">Ready for deployment</h4>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Precision coaching at your command</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black border border-zinc-100'
              }`}>
                {m.text.split('\n').map((line, j) => (
                  <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-6 py-4 rounded-2xl text-black border border-zinc-100 flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce delay-100"></div>
                  <div className="w-1 h-1 bg-black rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Crunching Data</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-zinc-100 flex gap-4">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="INQUIRE..."
            className="flex-1 bg-zinc-50 border-none rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-1 focus:ring-black focus:outline-none transition-all"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-black text-white px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-zinc-800 disabled:opacity-50 active:scale-95">
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
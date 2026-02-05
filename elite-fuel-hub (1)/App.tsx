import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import FuelLab from './components/FuelLab';
import Kitchen from './components/Kitchen';
import TrainingPlans from './components/TrainingPlans';
import GroceryList from './components/GroceryList';
import AICoach from './components/AICoach';
import Research from './components/Research';
import { AthleteStats } from './types';

const App: React.FC = () => {
  const [stats, setStats] = useState<AthleteStats>(() => {
    const saved = localStorage.getItem('athlete_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    return {
      gender: 'male',
      age: 20,
      weightLbs: 180,
      heightFt: 5,
      heightIn: 10,
      dailyActivity: 1.2,
      trainingFreq: 0.2,
      goal: 'maintain',
      season: 'pre',
      sport: 'Football',
      position: 'Wide Receiver',
      hasKitchen: true
    };
  });

  const [activeTab, setActiveTab] = useState('lab');

  const updateStats = (newStats: Partial<AthleteStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const saveStatsToStorage = () => {
    localStorage.setItem('athlete_profile', JSON.stringify(stats));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-black">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {activeTab === 'lab' && (
          <FuelLab 
            stats={stats} 
            updateStats={updateStats} 
            onSaveProfile={saveStatsToStorage} 
          />
        )}

        {activeTab === 'tracker' && <DailyTracker stats={stats} />}
        
        {activeTab === 'kitchen' && (
          <Kitchen goal={stats.goal} />
        )}
        
        {activeTab === 'training' && (
          <TrainingPlans stats={stats} />
        )}
        
        {activeTab === 'groceries' && (
          <GroceryList stats={stats} />
        )}
        
        {activeTab === 'research' && (
          <Research />
        )}
        
        {activeTab === 'coach' && (
          <AICoach />
        )}
      </main>

      {/* Floating Support Button - Monochrome Theme */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end group">
        <div className="mb-2 bg-black text-white text-[10px] font-bold py-1.5 px-3 rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.2em] hidden sm:block">
          Support
        </div>
        <a 
          href="https://wa.me/13166509934" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all ring-1 ring-zinc-200"
          aria-label="Chat on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-6 h-6 fill-current">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default App;
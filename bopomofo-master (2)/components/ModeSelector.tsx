
import React from 'react';
import { GameMode } from '../types';
import { BookOpenIcon, SoundIcon } from './Icons';

interface ModeSelectorProps {
  onModeSelect: (mode: GameMode) => void;
}

const ModeButton: React.FC<{ mode: GameMode, icon: React.ReactNode, onClick: (mode: GameMode) => void }> = ({ mode, icon, onClick }) => (
    <button
      onClick={() => onClick(mode)}
      className="group flex flex-col items-center justify-center w-full h-48 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-transparent hover:border-teal-400 hover:bg-white dark:hover:bg-slate-700 transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-500"
    >
        {icon}
        <span className="mt-4 text-2xl font-bold text-slate-700 dark:text-slate-200">{mode}</span>
    </button>
);


const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
        <h2 className="text-3xl font-bold mb-8 text-slate-700 dark:text-slate-200">選擇遊戲模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <ModeButton 
                mode={GameMode.CharToPinyin} 
                icon={<BookOpenIcon className="w-16 h-16 text-teal-500 dark:text-teal-400 transition-transform duration-300 group-hover:scale-110"/>} 
                onClick={onModeSelect}
            />
            <ModeButton 
                mode={GameMode.PinyinToChar} 
                icon={<SoundIcon className="w-16 h-16 text-sky-500 dark:text-sky-400 transition-transform duration-300 group-hover:scale-110"/>} 
                onClick={onModeSelect}
            />
        </div>
    </div>
  );
};

export default ModeSelector;

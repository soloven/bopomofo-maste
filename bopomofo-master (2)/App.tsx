
import React, { useState } from 'react';
import { GameMode } from './types';
import GameScreen from './components/GameScreen';
import ModeSelector from './components/ModeSelector';
import { GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleReturnToMenu = () => {
    setGameMode(null);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-500 dark:text-teal-400">
            注音大師 (Bopomofo Master)
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            動態文字遊戲，提升您的注音能力
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 min-h-[400px] flex flex-col">
          {gameMode ? (
            <GameScreen gameMode={gameMode} onReturnToMenu={handleReturnToMenu} />
          ) : (
            <ModeSelector onModeSelect={handleModeSelect} />
          )}
        </main>
        
        <footer className="text-center mt-8">
            <a href="https://github.com/google/genai-js" target="_blank" rel="noopener noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors inline-flex items-center">
                <GithubIcon className="w-5 h-5 mr-2" />
                Powered by Gemini API
            </a>
        </footer>
      </div>
    </div>
  );
};

export default App;

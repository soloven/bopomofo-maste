import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameMode, GameQuestion, GameState } from '../types';
import { generateGameQuestions } from '../services/geminiService';
import { ArrowLeftIcon, LightBulbIcon, RefreshIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface GameScreenProps {
  gameMode: GameMode;
  onReturnToMenu: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameMode, onReturnToMenu }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.Loading);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setGameState(GameState.Loading);
    setSelectedAnswer(null);
    try {
      const newQuestions = await generateGameQuestions(gameMode);
      if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setGameState(GameState.Playing);
      } else {
        throw new Error("No questions generated.");
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      setGameState(GameState.Error);
    }
  }, [gameMode]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (gameState === GameState.Finished && questions.length > 0) {
      const percentage = score / questions.length;
      if (percentage >= 0.7) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
      }
    }
  }, [gameState, score, questions.length]);

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    if (option === questions[currentQuestionIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(GameState.Finished);
    }
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-600";
    }
    const isCorrect = option === questions[currentQuestionIndex].answer;
    const isSelected = selectedAnswer === option;

    if (isCorrect) return "bg-green-500/90 text-white transform scale-105 shadow-lg ring-2 ring-white/50";
    if (isSelected && !isCorrect) return "bg-red-500/90 text-white";
    return "bg-slate-100 dark:bg-slate-700 opacity-50 cursor-not-allowed";
  };

  if (gameState === GameState.Loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <RefreshIcon className="w-16 h-16 text-teal-500 animate-spin" />
        <p className="mt-4 text-xl font-medium">正在為您產生題目... (Generating questions...)</p>
      </div>
    );
  }

  if (gameState === GameState.Error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
        <p className="text-xl font-bold">糟糕！載入題目時發生錯誤。</p>
        <p>可能是 API Key 未設定或網路問題。</p>
        <button onClick={loadQuestions} className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          再試一次 (Retry)
        </button>
         <button onClick={onReturnToMenu} className="mt-4 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors">返回主選單</button>
      </div>
    );
  }

  if (gameState === GameState.Finished) {
    const percentage = questions.length > 0 ? score / questions.length : 0;
    let message = "再接再厲！";
    if (percentage > 0.9) message = "太厲害了，你是注音大師！";
    else if (percentage >= 0.7) message = "做得很好！";

    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <h2 className="text-4xl font-bold mb-2">{message}</h2>
        <p className="text-2xl mb-6">您的分數： {score} / {questions.length}</p>
        <div className="flex space-x-4">
          <button onClick={loadQuestions} className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors">
            再玩一次 (Play Again)
          </button>
          <button onClick={onReturnToMenu} className="px-6 py-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
            返回主選單 (Main Menu)
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full animate-fade-in">
        <div className="flex justify-between items-center mb-2">
            <button onClick={onReturnToMenu} className="flex items-center text-slate-500 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                返回
            </button>
            <div className="text-right">
                <div className="text-lg font-bold text-teal-500 dark:text-teal-400">分數: {score}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{currentQuestionIndex + 1} / {questions.length}</div>
            </div>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900/80 rounded-xl p-6 text-center my-4 flex-grow flex flex-col justify-center shadow-inner">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{gameMode}</p>
            <p className="text-6xl md:text-8xl font-bold tracking-widest" style={{fontFamily: 'Noto Sans TC, sans-serif'}}>{currentQuestion.question}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 my-4">
            {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.answer;
                const isSelected = selectedAnswer === option;
                return (
                    <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedAnswer}
                        className={`relative w-full p-4 rounded-lg text-2xl md:text-3xl font-bold text-center transition-all duration-300 ${getButtonClass(option)}`}
                    >
                        {option}
                        {selectedAnswer && isCorrect && <CheckCircleIcon className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 text-white/80" />}
                        {selectedAnswer && isSelected && !isCorrect && <XCircleIcon className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 text-white/80" />}
                    </button>
                )
            })}
        </div>

        {selectedAnswer ? (
            <div className="text-center mt-4 animate-fade-in">
                <button onClick={handleNextQuestion} className="w-full px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    下一題 (Next)
                </button>
            </div>
        ) : (
            <div className="flex items-center justify-center p-4 mt-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-200 shadow-sm">
                <LightBulbIcon className="w-8 h-8 mr-3 text-amber-500 flex-shrink-0" />
                <p><strong>提示：</strong>{currentQuestion.hint}</p>
            </div>
        )}
    </div>
  );
};

export default GameScreen;
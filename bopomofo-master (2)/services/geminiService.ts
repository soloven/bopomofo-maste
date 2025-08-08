import { GameMode, GameQuestion } from '../types';

const shuffleArray = <T,>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const generateGameQuestions = async (mode: GameMode): Promise<GameQuestion[]> => {
  try {
    const response = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error response from serverless function:", errorBody);
      throw new Error(`伺服器錯誤: ${response.status} ${response.statusText}`);
    }

    let parsedData = await response.json();

    // Ensure parsedData is an array
    if (!Array.isArray(parsedData)) {
      // Some models might wrap the array in an object
      const keys = Object.keys(parsedData);
      if(keys.length === 1 && Array.isArray(parsedData[keys[0]])){
          parsedData = parsedData[keys[0]];
      } else {
           throw new Error("從伺服器收到的資料格式不符預期。");
      }
    }

    const questions: GameQuestion[] = parsedData.map((item: any) => ({
      question: item.question,
      // The answer should be included in the options and then shuffled.
      options: shuffleArray([...item.options, item.answer]),
      answer: item.answer,
      hint: item.hint,
    }));

    return questions;

  } catch (error) {
    console.error("呼叫雲端函式時發生錯誤:", error);
    throw error;
  }
};
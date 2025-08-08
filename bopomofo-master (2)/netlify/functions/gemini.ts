import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// The GameMode enum should match the one in the frontend's types.ts
enum GameMode {
  CharToPinyin = '看字選音',
  PinyinToChar = '看音選字',
}

const getPrompt = (mode: GameMode) => {
    if (mode === GameMode.CharToPinyin) {
        return `請為一個「看字選音」的注音符號學習遊戲產生 5 個多選題。
每個問題都需要包含：
1. 一個常見的繁體中文字 (question)。
2. 這個字的正確注音符號，包含聲調 (answer)。
3. 一個使用該字的簡單提示詞彙 (hint)。
4. 三個發音相似但錯誤的注音符號選項。
請確保選項發音具有迷惑性。`;
    } else { // PinyinToChar
        return `請為一個「看音選字」的注音符號學習遊戲產生 5 個多選題。
每個問題都需要包含：
1. 一個注音符號字串，包含聲調 (question)。
2. 這個發音對應的正確繁體中文字 (answer)。
3. 一個關於該字的簡單提示或定義 (hint)。
4. 三個發音相似或字型相似的錯誤中文字選項。
請確保選項具有迷惑性。`;
    }
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }
  
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "API_KEY is not configured on the server." }),
    };
  }

  try {
    const { mode } = JSON.parse(event.body || '{}') as { mode: GameMode };
    if (!mode || !Object.values(GameMode).includes(mode)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid or missing 'mode' in request body." }),
        }
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const questionFieldName = mode === GameMode.CharToPinyin ? "要猜的繁體中文字" : "要猜的注音符號";
    const optionsFieldName = mode === GameMode.CharToPinyin ? "注音符號選項" : "中文字選項";
    const answerFieldName = mode === GameMode.CharToPinyin ? "正確的注音符號" : "正確的中文字";
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: questionFieldName },
            options: { type: Type.ARRAY, description: optionsFieldName, items: { type: Type.STRING } },
            answer: { type: Type.STRING, description: answerFieldName },
            hint: { type: Type.STRING, description: '一個簡單的提示詞彙或定義' },
          },
          required: ["question", "options", "answer", "hint"]
        },
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: getPrompt(mode),
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.8,
        },
    });
    
    const jsonText = response.text.trim();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonText,
    };

  } catch (error) {
    console.error('Error in serverless function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "An internal error occurred.", details: error.message }),
    };
  }
};

export { handler };
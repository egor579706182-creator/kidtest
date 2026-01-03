
import { GoogleGenAI } from "@google/genai";
import { ChildInfo, Answer, Question, AssessmentResult } from '../types';

export const performClinicalAnalysis = async (
  childInfo: ChildInfo,
  answers: Answer[],
  questions: Question[]
): Promise<AssessmentResult> => {
  // Safe access to process.env to prevent white screen if process is undefined
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const dataString = answers.map(a => {
    const q = questions.find(que => que.id === a.questionId);
    return `${q?.text}: ${a.label}`;
  }).join('\n');

  const prompt = `
    ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА РАЗВИТИЯ КОММУНИКАЦИИ.
    Пациент: ${childInfo.name}, ${childInfo.age} лет.
    Данные тестирования:
    ${dataString}

    ЗАДАЧА:
    Составь профессиональный экспертный отчет на русском языке. 
    Используй научные данные (RU/EN/DE) и МКБ-11.
    
    ПРАВИЛА ОФОРМЛЕНИЯ:
    - НЕ используй цифры для разделов (1., 2. и т.д.).
    - НЕ используй символы ** или #.
    - Разделяй блоки только пустыми строками.
    - Текст должен быть плотным, для листа А4.
    
    СТРУКТУРА:
    ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА (это заголовок)
    
    РЕЗЮМЕ СОСТОЯНИЯ
    (описание дефицитов)
    
    УРОВЕНЬ НАРУШЕНИЯ
    (клинический статус)
    
    РЕКОМЕНДАЦИИ
    (шаги через тире)
    
    ПРОГНОЗ
    (динамика на 1-2 года)
    
    НАУЧНЫЕ ИСТОЧНИКИ
    (конкретные ссылки на статьи и исследования)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "Ошибка генерации текста.";
    const cleanText = text.replace(/[*#]/g, '').trim();
    
    return {
      summary: cleanText,
      severityLevel: "",
      recommendations: [],
      prognosis: "",
      scientificReferences: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || []
    };
  } catch (error) {
    console.error("Clinical Analysis Error:", error);
    throw error;
  }
};

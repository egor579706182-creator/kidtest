
import { GoogleGenAI } from "@google/genai";
import { ChildInfo, Answer, Question, AssessmentResult } from '../types';

export const performClinicalAnalysis = async (
  childInfo: ChildInfo,
  answers: Answer[],
  questions: Question[]
): Promise<AssessmentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const dataString = answers.map(a => {
    const q = questions.find(que => que.id === a.questionId);
    return `${q?.text}: ${a.label}`;
  }).join('\n');

  const prompt = `
    ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА РАЗВИТИЯ КОММУНИКАЦИИ.
    Пациент: ${childInfo.name}, ${childInfo.age} лет.
    Данные теста:
    ${dataString}

    ЗАДАЧА:
    Составь краткий, строго профессиональный отчет на ОДНУ СТРАНИЦУ А4 на РУССКОМ ЯЗЫКЕ.
    Используй поиск Google для подтверждения диагнозов по МКБ-11 и актуальных исследований.
    
    СТРУКТУРА ОТЧЕТА (ОБЯЗАТЕЛЬНО БЕЗ ЦИФР И НУМЕРАЦИИ):
    Заголовок: ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА
    
    РЕЗЮМЕ СОСТОЯНИЯ
    Опиши дефициты или их отсутствие.
    
    УРОВЕНЬ НАРУШЕНИЯ
    Дай четкую клиническую формулировку.
    
    РЕКОМЕНДАЦИИ
    Перечисли конкретные практические шаги через тире.
    
    ПРОГНОЗ
    Опиши развитие на ближайшие 1-2 года.
    
    НАУЧНЫЕ ИСТОЧНИКИ
    Ссылки на исследования (RU/EN/DE).

    ОГРАНИЧЕНИЕ: 
    - НЕ ИСПОЛЬЗУЙ цифры для разделов (никаких 1., 2. и т.д.).
    - НЕ ИСПОЛЬЗУЙ символы ** или #. 
    - Текст должен быть профессиональным и лаконичным.
    - Разделяй блоки двойным переносом строки.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.4,
      },
    });

    const text = response.text || "Ошибка генерации отчета.";
    // Clean up any remaining markdown artifacts just in case
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
    throw new Error("Сбой анализа данных.");
  }
};

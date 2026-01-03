import { GoogleGenAI } from "@google/genai";
import { ChildInfo, Answer, Question, AssessmentResult } from '../types';

export const performClinicalAnalysis = async (
  childInfo: ChildInfo,
  answers: Answer[],
  questions: Question[]
): Promise<AssessmentResult> => {
  // Безопасный доступ к ключам через проверку существования process и env
  const getApiKey = (): string => {
    try {
      return process.env.API_KEY || (process.env as any).VITE_API_KEY || "";
    } catch (e) {
      return (window as any).process?.env?.API_KEY || (window as any).process?.env?.VITE_API_KEY || "";
    }
  };

  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("Ключ API не найден. Убедитесь, что переменная API_KEY или VITE_API_KEY установлена в настройках Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const dataString = answers.map(a => {
    const q = questions.find(que => que.id === a.questionId);
    return `${q?.text}: ${a.label}`;
  }).join('\n');

  const prompt = `
    КЛИНИЧЕСКИЙ ОТЧЕТ ПО РАЗВИТИЮ КОММУНИКАЦИИ.
    Пациент: ${childInfo.name}, ${childInfo.age} лет, пол: ${childInfo.gender === 'Male' ? 'Мужской' : 'Женский'}.
    Результаты анкетирования (30 параметров):
    ${dataString}

    ЗАДАЧА:
    Сгенерируй профессиональное заключение для высококвалифицированных специалистов. 
    Используй последние научные данные (RU, EN, DE), МКБ-11 и DSM-5. 
    
    ВАЖНЫЕ ТРЕБОВАНИЯ К ТЕКСТУ:
    1. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать символы ** (двойные звездочки) и # (решетки).
    2. Используй только обычный текст и пустые строки между абзацами.
    3. Структура должна быть четкой, без нумерованных списков.
    
    СТРУКТУРА ОТЧЕТА:
    ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА
    (основной диагноз или направление дефицита)
    
    КЛИНИЧЕСКИЙ СТАТУС
    (подробный анализ речевых, социальных и когнитивных функций на основе ответов)
    
    ТЕРАПЕВТИЧЕСКИЕ РЕКОМЕНДАЦИИ
    (конкретный план действий для специалистов и родителей)
    
    ПРОГНОСТИЧЕСКАЯ МОДЕЛЬ
    (прогноз развития на основе текущих показателей)
    
    НАУЧНОЕ ОБОСНОВАНИЕ
    (ссылки на современные исследования и стандарты диагностики)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 } // Для минимизации задержки
      },
    });

    // Удаляем любые остаточные маркеры разметки на всякий случай
    const text = (response.text || "").replace(/[*#_]/g, '').trim();
    
    return {
      summary: text,
      severityLevel: "",
      recommendations: [],
      prognosis: "",
      scientificReferences: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || []
    };
  } catch (error: any) {
    console.error("Clinical Analysis Error:", error);
    throw new Error(error.message || "Ошибка генерации отчета. Проверьте соединение и API ключ.");
  }
};
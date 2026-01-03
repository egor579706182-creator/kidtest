
import React, { useState, useMemo } from 'react';
import { ChildInfo, Question, Answer, AssessmentResult } from './types';
import { getQuestionsForAge } from './data/questions';
import { performClinicalAnalysis } from './services/geminiService';
import { Card, Button, InputField } from './components/UI';

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'info' | 'test' | 'loading' | 'result'>('welcome');
  const [childInfo, setChildInfo] = useState<ChildInfo>({ name: '', age: 3, gender: 'Male' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    if (!childInfo.name.trim()) return setError("Укажите имя пациента");
    if (childInfo.age < 1 || childInfo.age > 10) return setError("Возраст: от 1 до 10 лет");
    setQuestions(getQuestionsForAge(childInfo.age));
    setStep('test');
    setError(null);
  };

  const answer = (score: number, label: string) => {
    const nextAnswers = [...answers, { questionId: questions[currentIdx].id, score, label }];
    setAnswers(nextAnswers);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      submit(nextAnswers);
    }
  };

  const submit = async (final: Answer[]) => {
    setStep('loading');
    try {
      const res = await performClinicalAnalysis(childInfo, final, questions);
      setResult(res);
      setStep('result');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Ошибка связи с ИИ. Проверьте настройки API_KEY.");
      setStep('info');
    }
  };

  const handlePrint = () => window.print();

  // Highlight specific professional keywords in the summary
  const formattedSummary = useMemo(() => {
    if (!result?.summary) return null;
    const keywords = [
      "РЕЗЮМЕ СОСТОЯНИЯ", 
      "УРОВЕНЬ НАРУШЕНИЯ", 
      "РЕКОМЕНДАЦИИ", 
      "ПРОГНОЗ", 
      "НАУЧНЫЕ ИСТОЧНИКИ",
      "ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА"
    ];
    
    let text = result.summary;
    const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'g'));
    
    return parts.map((part, i) => 
      keywords.includes(part) ? <strong key={i} className="block mt-6 mb-2 text-indigo-900 border-b border-indigo-50 pb-1 uppercase tracking-wider text-sm">{part}</strong> : part
    );
  }, [result]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl">
        
        {step === 'welcome' && (
          <Card className="text-center py-16">
            <h1 className="text-4xl font-black text-slate-900 mb-6">Диагностика</h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">Профессиональный инструмент скрининга коммуникативных нарушений (1-10 лет).</p>
            <Button onClick={() => setStep('info')} className="px-16 py-5 text-xl rounded-full">Начать</Button>
          </Card>
        )}

        {step === 'info' && (
          <Card className="shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 text-slate-800">Карта пациента</h2>
            <InputField 
              label="Имя и фамилия" 
              value={childInfo.name} 
              onChange={(v) => setChildInfo({...childInfo, name: v})} 
              placeholder="ФИО ребенка"
            />
            <div className="grid grid-cols-2 gap-6 mb-8">
              <InputField 
                label="Возраст" 
                type="number" 
                value={childInfo.age} 
                onChange={(v) => setChildInfo({...childInfo, age: parseInt(v) || 0})} 
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Пол</label>
                <select 
                  value={childInfo.gender} 
                  onChange={(e) => setChildInfo({...childInfo, gender: e.target.value as any})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                >
                  <option value="Male">Мужской</option>
                  <option value="Female">Женский</option>
                </select>
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}
            <div className="flex gap-4">
               <Button onClick={() => setStep('welcome')} variant="outline" className="flex-1">Назад</Button>
               <Button onClick={start} className="flex-[2]">Далее</Button>
            </div>
          </Card>
        )}

        {step === 'test' && questions[currentIdx] && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                Вопрос {currentIdx + 1} / {questions.length}
              </span>
              <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
              </div>
            </div>
            
            <Card className="shadow-2xl border-indigo-50">
              <h3 className="text-2xl font-bold text-slate-900 mb-10 leading-tight">
                {questions[currentIdx].text}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {questions[currentIdx].options?.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => answer(i + 1, opt)} 
                    className="w-full text-center px-6 py-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-bold text-slate-700 text-lg shadow-sm active:scale-[0.98]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {step === 'loading' && (
          <Card className="text-center py-24 shadow-2xl border-none">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Генерация отчета</h2>
            <p className="text-slate-500 text-lg italic">Синхронизация с научными базами данных...</p>
          </Card>
        )}

        {step === 'result' && result && (
          <div className="printable-area animate-in fade-in duration-1000">
            <Card className="border-t-[12px] border-indigo-600 shadow-2xl !p-12 relative print:shadow-none print:border-t-[6px] print:p-0">
              <div className="mb-8 pb-6 border-b-2 border-slate-100 flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Предварительная оценка</h1>
                <div className="flex gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
                  <span>Пациент: {childInfo.name}</span>
                  <span>|</span>
                  <span>{childInfo.age} Л.</span>
                  <span>|</span>
                  <span>{new Date().toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              
              <div className="text-slate-800 leading-[1.7] text-base whitespace-pre-wrap font-serif clinical-text">
                {formattedSummary}
              </div>

              {result.scientificReferences.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-12 print:bg-white print:border-none print:p-0 print:mt-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Научные источники</h4>
                  <ul className="space-y-1">
                    {result.scientificReferences.slice(0, 4).map((ref, idx) => (
                      <li key={idx} className="text-[9px] text-indigo-400 truncate italic">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <div className="no-print mt-10 flex flex-col sm:flex-row gap-4 mb-20">
              <Button onClick={handlePrint} className="flex-1 py-5 shadow-xl shadow-indigo-100">Скачать PDF / Печать</Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 py-5">Новый тест</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;

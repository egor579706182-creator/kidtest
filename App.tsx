
import React, { useState } from 'react';
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
    if (!childInfo.name.trim()) return setError("Введите имя ребенка");
    if (childInfo.age < 1 || childInfo.age > 10) return setError("Возраст должен быть от 1 до 10");
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

  const skip = () => answer(0, "Пропущено");

  const submit = async (final: Answer[]) => {
    setStep('loading');
    try {
      const res = await performClinicalAnalysis(childInfo, final, questions);
      setResult(res);
      setStep('result');
    } catch (e) {
      setError("Ошибка обработки. Попробуйте еще раз.");
      setStep('info');
    }
  };

  const handlePrint = () => {
    // Standard window.print() is used to ensure Cyrillic characters are correctly rendered in the PDF.
    // The browser print dialog allows selecting "Save as PDF".
    window.print();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        
        {step === 'welcome' && (
          <Card className="text-center py-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Диагностическая система</h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">Инструмент профессиональной оценки коммуникативных навыков детей 1-10 лет на базе ИИ.</p>
            <Button onClick={() => setStep('info')} className="w-full sm:w-auto px-16 py-5 text-xl">Начать</Button>
          </Card>
        )}

        {step === 'info' && (
          <Card>
            <h2 className="text-2xl font-bold mb-8">Данные пациента</h2>
            <InputField 
              label="Имя ребенка" 
              value={childInfo.name} 
              onChange={(v) => setChildInfo({...childInfo, name: v})} 
              placeholder="Введите ФИО или имя"
            />
            <div className="grid grid-cols-2 gap-6 mb-8">
              <InputField 
                label="Возраст (лет)" 
                type="number" 
                value={childInfo.age} 
                onChange={(v) => setChildInfo({...childInfo, age: parseInt(v) || 0})} 
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">Пол</label>
                <select 
                  value={childInfo.gender} 
                  onChange={(e) => setChildInfo({...childInfo, gender: e.target.value as any})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 text-slate-900 font-medium appearance-none"
                >
                  <option value="Male">Мужской</option>
                  <option value="Female">Женский</option>
                </select>
              </div>
            </div>
            {error && <p className="text-red-500 mb-6 font-medium text-center">{error}</p>}
            <div className="flex gap-4">
               <Button onClick={() => setStep('welcome')} variant="outline" className="flex-1 py-4">Назад</Button>
               <Button onClick={start} className="flex-[2] py-4">К вопросам</Button>
            </div>
          </Card>
        )}

        {step === 'test' && questions[currentIdx] && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 px-4">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">
                {currentIdx + 1} / {questions.length}
              </span>
              <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]" 
                  style={{ width: `${(currentIdx / questions.length) * 100}%` }}
                />
              </div>
            </div>
            
            <Card className="mb-6 shadow-2xl shadow-indigo-100/50">
              <h3 className="text-2xl font-bold text-slate-900 mb-10 leading-snug">
                {questions[currentIdx].text}
              </h3>
              <div className="flex flex-col gap-4">
                {questions[currentIdx].options?.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => answer(i + 1, opt)} 
                    className="w-full text-center px-6 py-5 rounded-2xl border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50 hover:shadow-lg transition-all font-bold text-slate-700 text-lg shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Card>
            <div className="flex justify-end pr-2">
              <Button onClick={skip} variant="ghost" className="text-xs font-black uppercase tracking-[0.2em] py-2">Пропустить</Button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <Card className="text-center py-24 shadow-2xl border-indigo-100">
            <div className="relative w-20 h-20 mx-auto mb-10">
              <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Формирование отчета</h2>
            <p className="text-slate-500 text-lg animate-pulse">Искусственный интеллект обрабатывает результаты...</p>
          </Card>
        )}

        {step === 'result' && result && (
          <div className="printable-area animate-in fade-in duration-1000">
            <Card className="border-t-[16px] border-indigo-600 shadow-2xl !p-12 relative overflow-hidden">
              {/* Report Header */}
              <div className="mb-12 pb-10 border-b-2 border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Предварительная оценка</h1>
                    <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">Клинический скрининг развития</p>
                  </div>
                  <div className="text-right text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Пациент</span>
                    <span className="text-slate-900 font-bold">{childInfo.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Возраст / Дата</span>
                    <span className="text-slate-900 font-bold">{childInfo.age} л. | {new Date().toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
              
              {/* Report Body */}
              <div className="text-slate-900 leading-[1.8] text-lg whitespace-pre-wrap font-serif mb-12 clinical-text">
                {result.summary}
              </div>

              {/* Scientific Footer */}
              {result.scientificReferences.length > 0 && (
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 mt-auto">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Научное обоснование и источники</h4>
                  <ul className="space-y-2">
                    {result.scientificReferences.slice(0, 5).map((ref, idx) => (
                      <li key={idx} className="text-[10px] text-indigo-600 truncate font-bold hover:underline opacity-80">
                        <a href={ref} target="_blank" rel="noopener noreferrer">● {ref}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Stamp Placeholder for professional look */}
              <div className="absolute bottom-8 right-12 opacity-5 pointer-events-none select-none">
                <div className="w-24 h-24 border-4 border-slate-900 rounded-full flex items-center justify-center font-black text-[10px] uppercase rotate-12">
                  Verified AI
                </div>
              </div>
            </Card>

            <div className="no-print mt-10 flex flex-col sm:flex-row gap-4 mb-20">
              <Button onClick={handlePrint} className="flex-1 shadow-2xl shadow-indigo-200">
                Сохранить отчет (PDF)
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                Новое обследование
              </Button>
            </div>
            
            <p className="no-print text-center text-slate-400 text-xs italic mb-10 px-8">
              * При нажатии "Сохранить отчет", в окне печати выберите "Сохранить как PDF".
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;

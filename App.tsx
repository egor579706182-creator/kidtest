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

  // Use string state for age to allow easy editing without auto-filling zeros
  const [ageInput, setAgeInput] = useState<string>('3');

  const start = () => {
    setError(null);
    const age = parseInt(ageInput);
    if (!childInfo.name.trim()) return setError("Укажите имя пациента");
    if (isNaN(age) || age < 1 || age > 10) return setError("Укажите возраст от 1 до 10 лет");
    
    const ageSpecificQuestions = getQuestionsForAge(age);
    setQuestions(ageSpecificQuestions);
    setChildInfo(prev => ({ ...prev, age }));
    setAnswers([]);
    setCurrentIdx(0);
    setStep('test');
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

  const submit = async (finalAnswers: Answer[]) => {
    setStep('loading');
    setError(null);
    try {
      const res = await performClinicalAnalysis(childInfo, finalAnswers, questions);
      setResult(res);
      setStep('result');
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Непредвиденная ошибка при генерации отчета.");
      setStep('info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
    
    const parts = result.summary.split(new RegExp(`(${keywords.join('|')})`, 'g'));
    
    return parts.map((part, i) => {
      if (keywords.includes(part)) {
        return <strong key={i} className="block mt-8 mb-3 text-indigo-900 border-b border-indigo-100 pb-1 uppercase tracking-widest text-sm">{part}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }, [result]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-indigo-100">
      <div className="w-full max-w-2xl">
        
        {step === 'welcome' && (
          <Card className="text-center py-20 animate-in fade-in zoom-in duration-700">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">CommuniScale Pro</h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">Научный инструмент оценки коммуникативных навыков у детей от 1 до 10 лет на базе ИИ.</p>
            <Button onClick={() => setStep('info')} className="px-12 py-5 text-xl rounded-full transition-transform hover:scale-105">Начать тестирование</Button>
          </Card>
        )}

        {step === 'info' && (
          <Card className="shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">01</span>
              Карта пациента
            </h2>
            
            <InputField 
              label="ФИО пациента" 
              value={childInfo.name} 
              onChange={(v) => setChildInfo({...childInfo, name: v})} 
              placeholder="Введите имя и фамилию"
            />
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2 w-full text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-[10px]">Возраст (1-10 лет)</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={ageInput} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setAgeInput(val);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="Возраст"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-900 font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-[10px]">Пол</label>
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

            {error && (
              <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-sm font-semibold border border-red-100 animate-in shake duration-300">
                {error}
              </div>
            )}

            <div className="flex gap-4">
               <Button onClick={() => setStep('welcome')} variant="outline" className="flex-1">Назад</Button>
               <Button onClick={start} className="flex-[2]">Приступить к тесту</Button>
            </div>
          </Card>
        )}

        {step === 'test' && questions[currentIdx] && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8 px-4">
              <div className="flex flex-col">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Прогресс теста</span>
                <span className="text-slate-900 font-bold text-sm">Вопрос {currentIdx + 1} из {questions.length}</span>
              </div>
              <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            
            <Card className="shadow-2xl border-none ring-1 ring-slate-200/50">
              <div className="mb-4 text-indigo-600 font-bold text-[10px] uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">
                {questions[currentIdx].category}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-10 leading-tight">
                {questions[currentIdx].text}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {questions[currentIdx].options?.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => answer(i + 1, opt)} 
                    className="w-full text-left px-8 py-5 rounded-2xl border-2 border-slate-50 hover:border-indigo-600 hover:bg-indigo-50 transition-all font-bold text-slate-700 text-lg group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex justify-between items-center">
                      {opt}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 text-xs">Выбрать</span>
                    </span>
                    <div className="absolute inset-0 bg-indigo-50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            </Card>
            
            <button 
              onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
              className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2 px-4"
            >
              ← Назад к предыдущему вопросу
            </button>
          </div>
        )}

        {step === 'loading' && (
          <Card className="text-center py-24 shadow-2xl border-none">
            <div className="relative w-24 h-24 mx-auto mb-12">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Формирование отчета</h2>
            <div className="space-y-2">
              <p className="text-slate-500 animate-pulse">Анализ ответов по МКБ-11...</p>
              <p className="text-slate-400 text-sm italic">Поиск научных публикаций (RU, EN, DE)...</p>
            </div>
          </Card>
        )}

        {step === 'result' && result && (
          <div className="printable-area animate-in fade-in duration-1000 mb-20">
            <Card className="border-t-[16px] border-indigo-600 shadow-2xl !p-16 relative print:!p-0 print:border-t-0 print:shadow-none">
              <div className="mb-12 pb-8 border-b-2 border-slate-100 flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">CommuniScale Report</h1>
                  <div className="flex gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    <span>•</span>
                    <span>Дата: {new Date().toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-900 font-black text-xl">{childInfo.name}</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{childInfo.age} ЛЕТ • {childInfo.gender === 'Male' ? 'МУЖ.' : 'ЖЕН.'}</div>
                </div>
              </div>
              
              <div className="text-slate-800 leading-[1.8] text-[15px] whitespace-pre-wrap font-serif clinical-text">
                {formattedSummary}
              </div>

              {result.scientificReferences.length > 0 && (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 mt-16 print:mt-12 print:bg-white print:border-slate-100 print:p-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-200 pb-2">Grounding & Research Sources</h4>
                  <ul className="space-y-3">
                    {result.scientificReferences.slice(0, 5).map((ref, idx) => (
                      <li key={idx} className="text-[11px] text-indigo-500 truncate font-mono">
                        <a href={ref} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          [{idx + 1}] {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-16 pt-8 border-t border-slate-100 text-[10px] text-slate-400 text-center italic print:mt-8">
                Данный отчет сформирован с использованием искусственного интеллекта и поисковых систем на основе предоставленных данных. <br/>
                Не является окончательным диагнозом и требует консультации специалиста.
              </div>
            </Card>

            <div className="no-print mt-10 flex flex-col sm:flex-row gap-4">
              <Button onClick={handlePrint} className="flex-1 py-5 shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H9a2 2 0 00-2 2v4" /></svg>
                Сохранить отчет (PDF)
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 py-5">Новое исследование</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
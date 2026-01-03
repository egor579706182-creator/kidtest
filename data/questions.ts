
import { Question } from '../types';

const freqOptions = ["Никогда", "Редко", "Иногда", "Часто", "Всегда"];
const qualOptions = ["Плохо", "Слабо", "Средне", "Хорошо", "Отлично"];
const quantityOptions = ["Нет", "Мало", "Средне", "Много", "Норма"];

export const questionPool: Question[] = [
  { 
    id: 1, 
    text: "Ребенок отзывается на свое имя, когда его зовут из другой комнаты.", 
    category: 'Receptive', 
    minAge: 1, 
    maxAge: 4,
    options: freqOptions
  },
  { 
    id: 2, 
    text: "Количество слов, которые ребенок использует осознанно в быту.", 
    category: 'Expressive', 
    minAge: 1, 
    maxAge: 2,
    options: quantityOptions
  },
  { 
    id: 3, 
    text: "Использование указательного жеста для демонстрации интереса.", 
    category: 'NonVerbal', 
    minAge: 1, 
    maxAge: 3,
    options: freqOptions
  },
  { 
    id: 4, 
    text: "Качество зрительного контакта при обращении к ребенку.", 
    category: 'Social', 
    minAge: 1, 
    maxAge: 10,
    options: qualOptions
  },
  { 
    id: 10, 
    text: "Длина и сложность предложений в активной речи.", 
    category: 'Expressive', 
    minAge: 3, 
    maxAge: 7,
    options: qualOptions
  },
  { 
    id: 22, 
    text: "Понимание скрытого смысла, шуток или сарказма.", 
    category: 'Social', 
    minAge: 6, 
    maxAge: 10,
    options: qualOptions
  },
  { 
    id: 44, 
    text: "Наличие эхолалии (повторение слов за собеседником без смысла).", 
    category: 'Expressive', 
    minAge: 1, 
    maxAge: 10,
    options: ["Постоянно", "Часто", "Иногда", "Редко", "Нет"]
  },
  { id: 5, text: "Выполнение простых просьб без жестов.", category: 'Receptive', minAge: 1, maxAge: 3, options: freqOptions },
  { id: 6, text: "Ребенок приносит игрушки, чтобы показать их вам.", category: 'Social', minAge: 1, maxAge: 4, options: freqOptions },
  { id: 11, text: "Ребенок может рассказать о событиях дня.", category: 'Expressive', minAge: 4, maxAge: 10, options: qualOptions },
  { id: 12, text: "Ребенок понимает предлоги места (внутри, сверху, под).", category: 'Receptive', minAge: 2, maxAge: 6, options: qualOptions },
  { id: 13, text: "Ребенок играет с другими детьми в общие игры.", category: 'Social', minAge: 3, maxAge: 8, options: freqOptions },
  { id: 14, text: "Ребенок инициирует диалог первым.", category: 'Expressive', minAge: 3, maxAge: 10, options: freqOptions },
  { id: 15, text: "Понятность речи для посторонних людей.", category: 'Expressive', minAge: 3, maxAge: 7, options: qualOptions },
  { id: 20, text: "Использование сложных союзов (потому что, если).", category: 'Expressive', minAge: 5, maxAge: 10, options: freqOptions },
  { id: 21, text: "Выполнение инструкции из трех действий.", category: 'Receptive', minAge: 5, maxAge: 10, options: qualOptions },
  { id: 23, text: "Способность поддерживать одну тему разговора.", category: 'Social', minAge: 6, maxAge: 10, options: qualOptions },
  { id: 24, text: "Соблюдение правил очередности в играх.", category: 'Social', minAge: 5, maxAge: 10, options: freqOptions },
  { id: 25, text: "Логичность при пересказе мультфильма.", category: 'Cognitive', minAge: 6, maxAge: 10, options: qualOptions },
  { id: 26, text: "Решение конфликтов словами.", category: 'Social', minAge: 5, maxAge: 10, options: freqOptions },
  { id: 40, text: "Интерес к другим детям.", category: 'Social', minAge: 1, maxAge: 10, options: freqOptions },
  { id: 41, text: "Адекватная реакция на громкие звуки.", category: 'Receptive', minAge: 1, maxAge: 10, options: freqOptions },
  { id: 42, text: "Правильность произношения звуков.", category: 'Expressive', minAge: 4, maxAge: 10, options: qualOptions },
  { id: 43, text: "Понимание эмоций по лицу.", category: 'Social', minAge: 3, maxAge: 10, options: qualOptions },
  { id: 45, text: "Использование мимики при разговоре.", category: 'NonVerbal', minAge: 1, maxAge: 10, options: freqOptions },
  { id: 46, text: "Способность усидеть на месте.", category: 'Social', minAge: 3, maxAge: 10, options: freqOptions },
  { id: 47, text: "Понимание понятий вчера и завтра.", category: 'Cognitive', minAge: 5, maxAge: 10, options: qualOptions },
  { id: 48, text: "Верные ответы на вопросы Почему.", category: 'Receptive', minAge: 4, maxAge: 10, options: freqOptions },
  { id: 49, text: "Частота истерик из-за непонимания.", category: 'Social', minAge: 1, maxAge: 6, options: ["Постоянно", "Часто", "Иногда", "Редко", "Никогда"] },
  { id: 50, text: "Реакция на объятия близких.", category: 'Social', minAge: 1, maxAge: 10, options: ["Отторжение", "Безразличие", "Терпимо", "Радость", "Восторг"] }
];

export const getQuestionsForAge = (age: number): Question[] => {
  const filtered = questionPool.filter(q => age >= q.minAge && age <= q.maxAge);
  const selected = filtered.sort(() => Math.random() - 0.5).slice(0, 30);
  return selected.map(q => ({
    ...q,
    options: q.options || freqOptions
  }));
};

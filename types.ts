
export type Gender = 'Male' | 'Female' | 'Other';

export interface ChildInfo {
  name: string;
  age: number;
  gender: Gender;
}

export interface Question {
  id: number;
  text: string;
  category: 'Receptive' | 'Expressive' | 'Social' | 'NonVerbal' | 'Cognitive';
  minAge: number;
  maxAge: number;
  options?: string[]; // Custom labels for 1-5 scale
}

export interface Answer {
  questionId: number;
  score: number;
  label: string;
}

export interface AssessmentResult {
  summary: string;
  severityLevel: string;
  recommendations: string[];
  prognosis: string;
  scientificReferences: string[];
}

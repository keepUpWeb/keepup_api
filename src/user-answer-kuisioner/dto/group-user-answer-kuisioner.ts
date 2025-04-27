export interface AnswerKuisionerGroupAll {
  subKuisionerTitle: string;
  questions: QuestionGroupAll[];
}

export interface QuestionGroupAll {
  questionText: string;
  answers: AnswerGroupAll[];
}

export interface AnswerGroupAll {
  answerText: string;
  count: number;
}

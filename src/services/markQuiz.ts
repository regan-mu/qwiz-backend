// Mark a quiz submission
import { QuestionInter } from "../types";

const markQuiz = (
  responses: { id: number; questionId: number }[],
  questions: QuestionInter[]
) => {
  const score = questions.reduce((accumulator: number, question: QuestionInter) => {
    const correctAnswer = question.answers.filter((ans) => ans.isCorrect)[0];
    const response = responses.filter(
      (res) => res.questionId === question.id
    )[0];
    if (correctAnswer.id === response.id) {
      return accumulator + 1;
    }
    return accumulator;
  }, 0);
  return score
};

export default markQuiz;

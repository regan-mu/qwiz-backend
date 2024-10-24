"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const markQuiz = (responses, questions) => {
    const score = questions.reduce((accumulator, question) => {
        const correctAnswer = question.answers.filter((ans) => ans.isCorrect)[0];
        const response = responses.filter((res) => res.questionId === question.id)[0];
        if (correctAnswer.id === response.id) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);
    return score;
};
exports.default = markQuiz;

import { UserAnswerSubKuisioner } from "src/user-answer-sub-kuisioner/entities/user-answer-sub-kuisioner.entity";
import { SymptomResult, Background } from "../../../take-kuisioner/take-kuisioner.model";

export function transformUserAnswerSubKuisioner(userAnswerSubKuisioner: UserAnswerSubKuisioner[]): SymptomResult[] {
    // Transform the input array into the desired output structure
    const transformed = userAnswerSubKuisioner.map((item) => {
        return {
            nameSymtomp: item.subKuisioner.symtompId.name,
            level: item.level,
            score: item.score,
            userAnswerKuisioner: item.userAnswerKuisioners.map((answerItem) => ({
                answer: answerItem.answer.answer,
                question: answerItem.answer.questionId.question,
                score: answerItem.answer.score // Ensure score is included
            }))
        };
    });

    return transformed;
}


export function transformPreKuisionerUserAnswer(preKuisionerUserAnswer: any): Background[] {
    // Group answers by categoryName
    const groupedAnswers = preKuisionerUserAnswer.reduce((acc: any, current: any) => {
        // Destructure the categoryName and answers array
        const { categoryName, preKuisionerAnswer } = current;

        // Extract question-answer pairs from preKuisionerAnswer
        const answers = preKuisionerAnswer.map((element: any) => {
            return {
                question: element.preKuisionerAnswer.preQuestionId?.question,
                answer: element.preKuisionerAnswer.answer
            };
        });

        // Find if category already exists in the accumulator
        const existingCategory = acc.find((item: any) => item.categoryName === categoryName);

        if (existingCategory) {
            // Add new question-answer pairs to the existing category
            existingCategory.preKuisionerAnswer.push(...answers);
        } else {
            // Create a new category entry
            acc.push({
                categoryName,
                preKuisionerAnswer: answers
            });
        }

        return acc;
    }, []);

    return groupedAnswers;
}
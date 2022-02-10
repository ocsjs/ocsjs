import { fromElementLike } from "..";
 
import { singleChoiceHandler } from "./single.choice";
import similarity from "string-similarity";
import { multipleChoiceHandler } from "./multiple.choice";
import { judgmentHandler } from "./judgment";
 
// export async function handleQuestion(container: string | Element, answer: AnswerProvider, question: QuestionProvider) {
//     const element = fromElementLike(container);
    // const type = question.type(element);
    // const title = question.title(element).textContent;
    // if (title) {
    //     const options = question.options(element);
    //     const answers = await answer({ title, options: options.map((option) => option.textContent || ""), type });
    //     if (type === "single_choice") {
    //         return singleChoiceHandler(answers, options);
    //     }
    //     if (type === 'multiple_choice') {
    //         return multipleChoiceHandler(answers, options);
    //     }
    //     if (type === 'judgment') {
    //         return judgmentHandler(answers, options);
    //     }
    //     if (type === 'completion') {
    //         return singleChoiceHandler(answers, options);
    //     }
    // }
// }


export function getOptionSimilarly(answers: string[], options: Element[]) {
    return options.map((option) => {
        if (option.textContent) {
            return similarity.findBestMatch(option.textContent, answers).bestMatch.rating;
        } else {
            return 0;
        }
    });
}
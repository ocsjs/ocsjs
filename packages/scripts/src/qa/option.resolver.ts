import { getQuestionType } from "./question.type.resolver";

/**
 * resolve option string of specify element
 */
export function getOptions(question: HTMLElement, target: string) {
    const options = Array.from(question.querySelectorAll(target));
    const questionType = getQuestionType(question);
    return options.map((option) => {
        return questionType === "completion" ? "" : (option as HTMLDivElement).innerText;
    });
}

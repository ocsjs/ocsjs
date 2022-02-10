import { getOptionSimilarly } from ".";

export function multipleChoiceHandler(answers: string[], options: Element[]) {
    const ratings = getOptionSimilarly(answers, options);
    for (let i = 0; i < ratings.length; i++) {
        if (ratings[i] > 0.6) {
            (options[i] as HTMLElement).click();
        }
    }
}

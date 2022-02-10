import { getOptionSimilarly } from ".";

export function singleChoiceHandler(answers: string[], options: Element[]) {
    const ratings = getOptionSimilarly(answers, options);
    const max = ratings.sort()[ratings.length - 1];

    (options[ratings.findIndex((r) => r === max)] as HTMLElement).click();
}

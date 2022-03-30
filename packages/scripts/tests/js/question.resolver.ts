import { defaultQuestionResolve } from "../../src/browser/core/worker/question.resolver";

const resolvers = defaultQuestionResolve({} as any);

const res = resolvers["judgement"](
    [{ answers: [{ answer: "True", question: "" }] } as any],
    [{ innerText: "√" } as any, { innerText: "×" } as any],
    (type, answer, option, ctx) => {
        console.log({ type, answer, option, ctx });
    }
);

console.log(res);

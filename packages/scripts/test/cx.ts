import { QuestionType } from "./../src/qa/types";
import { QA } from "../src/qa";
import axios from "axios";
const qa = new QA({
    type(container) {
        const typeTitle = container.querySelector(".type_tit");
        const text = typeTitle?.textContent;
        if (text) {
            return RegExp("单选题").test(text)
                ? "single_choice"
                : RegExp("多选题").test(text)
                ? "multiple_choice"
                : RegExp("判断题").test(text)
                ? "judgment"
                : RegExp("填空题").test(text)
                ? "completion"
                : undefined;
        }
    },
    async answer(title, type) {
        const { data } = await axios.get(
            "https://wk.enncy.cn/chati/5ace3900615d11ec887935abef73b31b/0/" +
                encodeURIComponent(
                    title
                        .replace(/\d*\./, "")
                        .replace(/\(.*?题, .*?分\)/, "")
                        .replace(/\n/g, "")
                )
        );

        return {
            question: data.question,
            answers: [data.answer],
        };
    },
    question: {
        container: ".whiteDiv",
        title: "h1,h2,h3,h4,h5,h6",
        single: {
            text: ".answer_p",
            target: ".answerBg",
        },
        multiple: {
            text: ".answer_p",
            target: ".answerBg",
        },
        judgment: {
            text: ".answer_p",
            target: ".answerBg",
        },
        completion: {
            target: "textarea",
        },
    },
});

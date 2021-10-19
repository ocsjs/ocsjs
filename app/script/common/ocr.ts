import axios from "axios";
import { OCROptions } from "./types";

const apiUrl = "http://api.ttshitu.com/predict";

/**
    1 : 纯数字
    1001：纯数字2
    2 : 纯英文
    1002：纯英文2
    3 : 数英混合
 */

// 文字识别
export class OCR {
    static async resolve({ username, password, typeid = "1" }: OCROptions, buffer: string | Buffer) {
        try {
            let base64data = buffer.toString("base64");
            const response: any = await axios.post(apiUrl, {
                username, //用户名
                password, //密码
                typeid,
                image: base64data,
            });

            let d = response.data;
            if (d.success) {
                // handle success
                let { id, result } = d.data;
                return result;
            } else {
                return undefined;
            }
        } catch (__) {
            return undefined;
        }
    }
}

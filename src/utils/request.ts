import { Modal } from "ant-design-vue";

const axios = require("axios");

export async function NetWorkCheck() {
    return new Promise<boolean>((resolve, reject) => {
        request({
            method: "OPTIONS",
            url: "https://baidu.com",
        })
            .then(() => {
                resolve(true);
            })
            .catch((err: any) => {
                console.log(err);

                Modal.error({
                    title: "网络错误",
                    content: "检测到当前的网络已经断开，为了正常使用本软件，请您重新联网或者使用热点。",
                });
                resolve(false);
            });
    });
}

// 添加请求拦截器
axios.interceptors.request.use(
    function (config: any) {
        // 在发送请求之前做些什么
        return config;
    },
    function (error: any) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
axios.interceptors.response.use(
    function (response: any) {
        // 对响应数据做点什么
        return response;
    },
    function (error: any) {
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);

export const AxiosGet = axios.create({
    method: "get",
    timeout: 5 * 60 * 1000,
});

export const AxiosPost = axios.create({
    method: "post",
    timeout: 5 * 60 * 1000,
});
export const request = axios.create({
    timeout: 5 * 60 * 1000,
});

import axios from "axios";
import { logger } from "../types/logger"
const { info, error } = logger("request");

// 添加请求拦截器
axios.interceptors.request.use(
    function (config: any) {
        // 在发送请求之前做些什么
        info("网络请求:", config);
        return config;
    },
    function (error: any) {
        // 对请求错误做些什么
        error("网络失败:", error);
        return Promise.reject(error);
    }
);

// 添加响应拦截器
axios.interceptors.response.use(
    function (response: any) {
        info("网络响应成功:", response);
        // 对响应数据做点什么
        return response;
    },
    function (error: any) {
        info("网络响应错误:", error);
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);

export const AxiosGet = axios.create({
    method: "get",
    timeout: 2 * 60 * 1000,
});

export const AxiosPost = axios.create({
    method: "post",
    timeout: 2 * 60 * 1000,
});
export const request = axios.create({
    timeout: 1 * 60 * 1000,
});

import axios from "axios";
import { OCSNotify } from "../events/ocs.event";
const notify = new OCSNotify("system", "系统通知");
import { log, error } from "electron-log";
process.on("uncaughtException", function (err) {
    error(err.message);
    notify.error("未知错误！");
}); //监听未捕获的异常

process.on("unhandledRejection", function (err, promise) {
    notify.error("网络错误！");
    promise.catch((err) => {
        error(err);
    });
}); //监听Promise没有被捕获的失败函数

// 添加请求拦截器
axios.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
axios.interceptors.response.use(
    function (response) {
        // 对响应数据做点什么
        return response;
    },
    function (error) {
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

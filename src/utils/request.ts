const axios = require("axios");

console.log(axios);

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

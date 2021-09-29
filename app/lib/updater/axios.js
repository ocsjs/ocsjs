"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosPost = exports.AxiosGet = void 0;
var axios_1 = __importDefault(require("axios"));
// 添加请求拦截器
axios_1.default.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});
// 添加响应拦截器
axios_1.default.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});
exports.AxiosGet = axios_1.default.create({
    method: 'get',
    timeout: 60 * 1000
});
exports.AxiosPost = axios_1.default.create({
    method: 'post',
    timeout: 60 * 1000
});

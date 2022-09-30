"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
axios_1.default.defaults.timeout = 6 * 1000; // 设置请求超时 6s
axios_1.default.defaults.baseURL = "https://api.mch.weixin.qq.com";
// 添加请求拦截器
axios_1.default.interceptors.request.use(function (config) {
    // config.headers.Authorization = cookie.get('token');
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
const baseRequest = ({ url, method, data, headers }) => {
    let params = {};
    if (method === 'get') {
        params = data;
    }
    return new Promise((resolve, reject) => {
        (0, axios_1.default)({
            url,
            method,
            headers,
            data,
            params,
        })
            .then(response => {
            const { status, headers, data } = response;
            resolve({ status, headers, data });
        })
            .catch((error) => {
            const { status, headers, data } = error.response;
            reject({ status, headers, data });
        });
    });
};
const get = (url, data, headers) => {
    const method = 'get';
    return baseRequest({ url, method, data, headers });
};
const post = (url, data, headers) => {
    const method = 'post';
    return baseRequest({ url, method, data, headers });
};
const destroy = (url, data, headers) => {
    const method = 'delete';
    return baseRequest({ url, method, data, headers });
};
const put = (url, data, headers) => {
    const method = 'put';
    return baseRequest({ url, method, data, headers });
};
exports.default = {
    get,
    post,
    destroy,
    put,
};

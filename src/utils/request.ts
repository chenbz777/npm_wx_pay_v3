import axios from 'axios';

interface IBaseRequest {
  url: string;
  method: string;
  data?: any;
  headers?: any;
}

interface IRes {
  code?: number;
  msg?: string;
  data?: any;
}

axios.defaults.timeout = 6 * 1000; // 设置请求超时 6s

axios.defaults.baseURL = "https://api.mch.weixin.qq.com";

// 添加请求拦截器
axios.interceptors.request.use(
  function (config: any) {

    // config.headers.Authorization = cookie.get('token');

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

const baseRequest = ({ url, method, data, headers }: IBaseRequest): Promise<any> => {

  let params = {};

  if (method === 'get') {
    params = data;
  }

  return new Promise((resolve, reject) => {
    axios({
      url,
      method,
      headers,
      data,
      params,
    })
      .then(response => {

        resolve(response.data);
      })
      .catch((error) => {

        reject(error.response?.data);
      });
  });
};


const get = (url: string, data?: any, headers?: any) => {
  const method = 'get';

  return baseRequest({ url, method, data, headers });
}

const post = (url: string, data?: any, headers?: any) => {
  const method = 'post';

  return baseRequest({ url, method, data, headers });
}

const destroy = (url: string, data?: any, headers?: any) => {
  const method = 'delete';

  return baseRequest({ url, method, data, headers });
}

const put = (url: string, data?: any, headers?: any) => {
  const method = 'put';

  return baseRequest({ url, method, data, headers });
}


export default {
  get,
  post,
  destroy,
  put,
};

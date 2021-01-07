import axios from 'axios'



const service = axios.create({
  baseURL:'http://localhost:8088',
	timeout: 60 * 1000
})


// 添加请求拦截器
service.interceptors.request.use(function(config) {
	// 在发送请求之前做些什么
	return config;
}, function(error) {
	// 对请求错误做些什么
	return Promise.reject(error);
});

// 添加响应拦截器
service.interceptors.response.use(function(response) {
	// 对响应数据做点什么
  console.log('[response]', response);
	return response;
}, function(error) {
	// 对响应错误做点什么
	return Promise.reject(error);
});


export default service

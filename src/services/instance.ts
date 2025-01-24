import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);

export default instance;

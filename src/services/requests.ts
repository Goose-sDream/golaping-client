import { AxiosHeaders, AxiosInstance, AxiosResponse } from "axios";
import instance from "./instance";

const Request = () => {
  const defaultRequest = async (
    path: string,
    body: (url: string, instance: AxiosInstance) => Promise<AxiosResponse>
  ) => {
    try {
      const response = await body(path, instance);
      return response;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };

  const post = async (path: string, data: unknown, headers?: AxiosHeaders) => {
    return await defaultRequest(path, async (url, instance) => {
      return await instance.post(url, data, { headers });
    });
  };

  const get = async (path: string, params?: unknown, headers?: AxiosHeaders) => {
    return await defaultRequest(path, async (url, instance) => {
      return await instance.get(url, { params: params, headers });
    });
  };

  return { post, get };
};

export default Request;

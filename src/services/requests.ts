import { AxiosHeaders, AxiosInstance } from "axios";
import instance from "./instance";

const Request = () => {
  const defaultRequest = async <T>(
    path: string,
    body: (url: string, instance: AxiosInstance) => Promise<T>
  ): Promise<T> => {
    try {
      const response = await body(path, instance);
      return response;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };

  const post = async <T>(path: string, data: unknown, headers?: AxiosHeaders): Promise<T> => {
    return await defaultRequest(path, async (url, instance) => {
      return await instance.post(url, data, { headers });
    });
  };

  const get = async <T>(path: string, params?: unknown, headers?: AxiosHeaders): Promise<T> => {
    return await defaultRequest(path, async (url, instance) => {
      return await instance.get(url, { params: params, headers });
    });
  };

  return { post, get };
};

export default Request;

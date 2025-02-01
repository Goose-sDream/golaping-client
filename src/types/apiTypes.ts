export interface APIResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  result: T;
}

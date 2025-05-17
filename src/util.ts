import { keyframes } from "styled-components";
import StorageController from "@/storage/storageController";

export const shake = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-5deg); }
  40% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;

export const getStorage = () => {
  const isSharedWorkerSupported = typeof SharedWorker !== "undefined";
  const storage = new StorageController(isSharedWorkerSupported ? "local" : "session");
  return storage;
};

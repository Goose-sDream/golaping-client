import { atom } from "recoil";

export const sessionIdState = atom<string | null>({
  key: "sessionIdState",
  default: null,
});

export const websocketUrlState = atom<string | undefined>({
  key: "websocketUrlState",
  default: "",
});

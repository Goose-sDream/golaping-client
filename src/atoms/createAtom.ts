import { atom } from "recoil";

export const sessionIdState = atom<string | null>({
  key: "sessionIdState",
  default: null,
});

export const websocketUrlAtom = atom<string | null>({
  key: "websocketUrlAtom",
  default: null,
});

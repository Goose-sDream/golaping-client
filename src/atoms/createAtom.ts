import { atom } from "recoil";

export const voteIdState = atom<string>({
  key: "voteIdState",
  default: "",
});

export const websocketUrlState = atom<string | undefined>({
  key: "websocketUrlState",
  default: "",
});

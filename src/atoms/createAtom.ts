import { atom } from "recoil";

export const voteIdState = atom<string | null>({
  key: "voteIdState",
  default: null,
});

export const websocketUrlState = atom<string | undefined>({
  key: "websocketUrlState",
  default: "",
});

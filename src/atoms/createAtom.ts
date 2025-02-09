import { atom } from "recoil";

export const voteIdState = atom<string>({
  key: "voteIdState",
  default: "",
});

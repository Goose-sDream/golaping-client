import { atom } from "recoil";

export const sessionIdState = atom<string | null>({
  key: "sessionIdState",
  default: null,
});

export const websocketUrlState = atom<string | undefined>({
  key: "websocketUrlState",
  default: "",
});

const limitList = ["제한", "무제한"];

export const limitState = atom<{ limitList: string[]; limited: string }>({
  key: "limited",
  default: {
    limitList,
    limited: limitList[0],
  },
});

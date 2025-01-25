import { atom } from "recoil";
import { ModalState } from "@/types/voteTypes";

export const modalState = atom<ModalState>({
  key: "modalState",
  default: {
    elementId: "modal",
    isOpen: false,
    type: "alert",
    title: "",
    content: "",
    onFunc: undefined,
    offFunc: undefined,
  },
});

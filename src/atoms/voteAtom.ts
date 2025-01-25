import { atom } from "recoil";
import { ModalState } from "@/types/voteTypes";

export const modalAtom = atom<ModalState>({
  key: "modalState",
  default: {
    elementId: "root",
    isOpen: false,
    type: "alert",
    title: "",
    content: "",
    onFunc: undefined,
    offFunc: undefined,
  },
});

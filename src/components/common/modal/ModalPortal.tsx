import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { useRecoilState } from "recoil";
import { modalState } from "@/atoms/voteAtom";

const ModalPortal = ({ children }: PropsWithChildren) => {
  const [{ elementId }] = useRecoilState(modalState);
  const element = document.getElementById(elementId);

  return element ? createPortal(children, element) : null;
};

export default ModalPortal;

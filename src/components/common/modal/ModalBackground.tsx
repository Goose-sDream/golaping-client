import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { modalState } from "@/atoms/voteAtom";
import { ZINDEX } from "@/constants/common";

const ModalBackground = () => {
  const [{ offFunc }, setModalState] = useRecoilState(modalState);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  const closeModal = () => {
    if (offFunc) offFunc();
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (!backgroundRef.current) return;
    backgroundRef.current.addEventListener("click", closeModal);

    return () => {
      backgroundRef.current?.removeEventListener("click", closeModal);
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        opacity: 0.5,
        zIndex: `${ZINDEX.modal - 1}`,
      }}
    >
      ModalBackground
    </div>
  );
};

export default ModalBackground;

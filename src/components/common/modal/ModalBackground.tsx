import { useEffect, useRef } from "react";
import { ZINDEX } from "@/constants/common";

type ModalBackground = {
  closeModal: () => void;
};

const ModalBackground = ({ closeModal }: ModalBackground) => {
  const backgroundRef = useRef<HTMLDivElement | null>(null);

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

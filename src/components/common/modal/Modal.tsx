import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import ModalBackground from "./ModalBackground";
import ModalPortal from "./ModalPortal";
import { modalState } from "@/atoms/voteAtom";
import { ZINDEX } from "@/constants/common";
import { LIGHTGRAY } from "@/styles/color";

const Modal = () => {
  const [{ isOpen, type, title, content, offFunc }, setModalState] = useRecoilState(modalState);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalAnimationRef = useRef<number | null>(null);

  const requestModalAnimation = () => {
    if (modalAnimationRef.current) {
      cancelAnimationFrame(modalAnimationRef.current);
    }
    requestAnimationFrame(() => {
      if (!modalRef.current) return;
      if (isOpen) {
        modalRef.current.style.transform = "translate(-50%, -45%)";
        modalRef.current.style.opacity = "1";
        modalRef.current.style.transition = "transform 0.3s ease-in-out";
      }
    });
  };

  const closeModal = () => {
    if (offFunc) offFunc();
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    requestModalAnimation();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <>
      <ModalPortal>
        <ModalBackground closeModal={closeModal} />
        <div
          ref={modalRef}
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-content"
          style={{
            position: "fixed",
            width: "300px",
            height: "300px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: `${LIGHTGRAY}`,
            opacity: "0",
            padding: "10px",
            overflow: "hidden",
            zIndex: `${ZINDEX.modal}`,
            borderRadius: "5%",
          }}
        >
          {type === "alert" && (
            <button
              style={{
                marginLeft: "auto",
                width: "10px",
                height: "10px",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // hover 스타일 추가해야함
              }}
              onClick={closeModal}
            >
              X
            </button>
          )}
          <div id="modal-title" style={{ width: "100%", height: "50px" }}>
            <h1>모달 제목{title}</h1>
          </div>
          <div id="modal-content" style={{ width: "100%", height: "300px" }}>
            모달 컨텐츠{content}
          </div>
        </div>
      </ModalPortal>
    </>
  );
};

export default Modal;

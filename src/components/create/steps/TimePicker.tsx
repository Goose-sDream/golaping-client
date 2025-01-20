import React, { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

// type SwiperProps = {
//   paddingTop?: number;
//   paddingBottom?: number;
//   spacing?: number;
//   threshold?: number;
//   slides: React.ReactNode[];
// };
const TimePicker = () =>
  //   {
  //   paddingTop = 20,
  //   paddingBottom = 20,
  //   spacing = 10,
  //   threshold = 50, // 드래그 최소 거리
  //   slides,
  // }: SwiperProps
  {
    const containerRef = useRef<HTMLDivElement>(null);
    const timeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
    const times = Array.from({ length: 16 }, (_, i) => i);
    const itemAngle = 360 / times.length;

    // 클릭 후에 움직이는 위치 - 시작 위치 만큼 움직여야겠다.

    const [isClicked, setIsClicked] = useState(false); // 클릭 여부
    const [startY, setStartY] = useState(0); // 시작 Y좌표
    const [currentAngle, setCurrentAngle] = useState(0); // 움직일 회전 각도
    const currentTimeIdxRef = useRef({ idx: 0, startPoint: 0, endPoint: 0 }); // 현재 시간 인덱스
    const frameRef = useRef<number | null>(null); // Animation Frame Ref

    const translateSlide = (y: number, animate: boolean = true) => {
      if (!containerRef.current) return;
      containerRef.current.style.transform = `translate(-50%, -50%) rotateX(${-y * 0.1}deg)`;
      containerRef.current.style.transition = animate ? "transform 0.2s ease-out" : "none";
    };

    const handleStart = (idx: number) => (e: React.MouseEvent | React.TouchEvent) => {
      setIsClicked(true);
      const initialY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      console.log("initialY =>", initialY);
      setStartY(initialY);
      currentTimeIdxRef.current.startPoint = initialY;
      currentTimeIdxRef.current.idx = idx;
    };

    const handleMove = () => (e: React.MouseEvent | React.TouchEvent) => {
      if (!isClicked) return;
      const currentY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const deltaY = currentY - startY;
      // 드래그 거리에 따라 움직일 회전 각도 업데이트
      setCurrentAngle((prev) => prev + deltaY);
      // 기존 requestAnimationFrame이 있다면 취소
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        translateSlide(currentAngle + deltaY);
      });
      setStartY(currentY);
    };

    const handleEnd = () => (e: React.MouseEvent | React.TouchEvent) => {
      setIsClicked(false);
      if ("touches" in e) {
        currentTimeIdxRef.current.endPoint = e.changedTouches[0].clientY;
      } else if ("clientY" in e) {
        console.log("마우스 업 e.clientY =>", e.clientY);
        currentTimeIdxRef.current.endPoint = e.clientY;
      }
      // 드래그 종료 시 frame 취소
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };

    console.log("currentAngle =>", currentAngle);

    useEffect(() => {
      if (!isClicked) {
        console.log("startPoint =>", currentTimeIdxRef.current.startPoint);
        console.log("endPoint =>", currentTimeIdxRef.current.endPoint);
        console.log(
          "endPoint - startPoint =>",
          Math.abs(currentTimeIdxRef.current.endPoint - currentTimeIdxRef.current.startPoint)
        );
        console.log("현재 idx =>", currentTimeIdxRef.current.idx);
        const translateDistance = Math.abs(currentTimeIdxRef.current.endPoint - currentTimeIdxRef.current.startPoint);
        // 너무 적게 돌리면 원상태로 백백
        if (Math.abs(translateDistance) < 100) {
          translateSlide(currentAngle - (currentTimeIdxRef.current.endPoint - currentTimeIdxRef.current.startPoint));
        }
        // return;
      }
    }, [isClicked]);

    const getEventHandlers = (idx: number) => ({
      onMouseDown: (e: React.MouseEvent) => handleStart(idx)(e),
      onMouseMove: (e: React.MouseEvent) => handleMove()(e),
      onMouseUp: (e: React.MouseEvent) => handleEnd()(e),
      onMouseLeave: (e: React.MouseEvent) => isClicked && handleEnd()(e),
      onTouchStart: (e: React.TouchEvent) => handleStart(idx)(e),
      onTouchMove: (e: React.TouchEvent) => handleMove()(e),
      onTouchEnd: (e: React.TouchEvent) => handleEnd()(e),
    });

    return (
      <div
        style={{
          width: "200px",
          height: "400px",
          backgroundColor: "lightblue",
          position: "relative",
          gap: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          perspective: "1000px", // 3D 효과를 위한 원근감 추가
          overflow: "hidden", // 경계를 넘어가는 부분 숨김
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transformStyle: "preserve-3d",
            userSelect: "none",
          }}
          ref={containerRef}
        >
          {times.map((time, idx) => {
            return (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "100px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  transform: `rotateX(${idx * itemAngle}deg) translateZ(200px)`, // 3D 회전 및 원형 배치
                  transformOrigin: "center",
                  // backfaceVisibility: "hidden", // 뒷면 숨기기
                  // opacity: visible ? 1 : 0, // 보이는 범위만 opacity 적용
                  transition: "opacity 0.3s ease-out", // 부드러운 전환 효과
                }}
                key={idx}
                ref={(el) => {
                  timeItemsRef.current[idx] = el;
                }}
                {...getEventHandlers(idx)}
              >
                <div>{time}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

export default TimePicker;

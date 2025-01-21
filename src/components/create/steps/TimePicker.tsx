import React, { useEffect, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Vote } from "../../../types/voteTypes";
import { Input } from "../../common/Input";

type TimePickerProps = {
  //   paddingTop?: number;
  //   paddingBottom?: number;
  //   spacing?: number;
  //   threshold?: number;
  //   slides: React.ReactNode[];
  field: ControllerRenderProps<Vote, "time">;
  error?: string | undefined;
  type: string;
  fullAngle: number;
};
const TimePicker = ({ field, error, type = "hour", fullAngle = 360 }: TimePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const times = Array.from({ length: type === "hour" ? 24 : 60 }, (_, i) => i);
  const itemAngle = fullAngle / times.length; // 아이템 하나당 각도
  console.log("itemAngle =>", itemAngle);

  // 클릭 후에 움직이는 위치 - 시작 위치 만큼 움직여야겠다.

  const [isClicked, setIsClicked] = useState(false); // 클릭 여부
  const [startY, setStartY] = useState(0); // 시작 Y좌표
  // const [selectedTime, setSelectedTime] = useState(0);
  const currentAngleRef = useRef(0); // 움직일 회전 각도
  const frameRef = useRef<number | null>(null); // Animation Frame Ref
  const inpurRef = useRef<HTMLDivElement>(null);

  const translateSlide = (y: number, animate: boolean = true) => {
    if (!containerRef.current || !wrapperRef.current) return;
    containerRef.current.style.transform = `translate(-50%, -50%) rotateX(${-y * 0.1}deg)`;
    containerRef.current.style.transition = animate ? "transform 0.5s ease-out" : "none";
  };

  const handleStart = () => (e: React.MouseEvent | React.TouchEvent) => {
    setIsClicked(true);
    const initialY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    setStartY(initialY);
  };

  const handleMove = () => (e: React.MouseEvent | React.TouchEvent) => {
    if (!isClicked) return;
    const currentY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    const deltaY = currentY - startY;
    // 드래그 거리에 따라 움직일 회전 각도 업데이트
    currentAngleRef.current += deltaY;

    // 기존 requestAnimationFrame이 있다면 취소
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      translateSlide(currentAngleRef.current);
    });
    setStartY(currentY);
  };

  const handleEnd = () => () => {
    setIsClicked(false);
    // 드래그 종료 시 frame 취소
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };

  useEffect(() => {
    // 안전장치
    if (!isClicked) {
      if (timeItemsRef.current.every((item) => item !== null) && inpurRef.current) {
        if (timeItemsRef.current[0]?.getBoundingClientRect().top < inpurRef.current?.getBoundingClientRect().top) {
          currentAngleRef.current = 0;
        }
        if (
          timeItemsRef.current[times.length - 1]?.getBoundingClientRect().top >
          inpurRef.current?.getBoundingClientRect().top
        ) {
          currentAngleRef.current = 1200;
        }
        translateSlide(currentAngleRef.current);
      }
    }
  }, [isClicked]);

  useEffect(() => {
    const handleMouseLeave = () => {
      setIsClicked(false);
    };
    if (wrapperRef && wrapperRef.current) {
      wrapperRef.current.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (wrapperRef && wrapperRef.current) {
        wrapperRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  const getEventHandlers = () => ({
    onMouseDown: (e: React.MouseEvent) => handleStart()(e),
    onMouseMove: (e: React.MouseEvent) => handleMove()(e),
    onMouseUp: () => handleEnd()(),
    onTouchStart: (e: React.TouchEvent) => handleStart()(e),
    onTouchMove: (e: React.TouchEvent) => handleMove()(e),
    onTouchEnd: () => handleEnd()(),
  });

  return (
    <div
      style={{
        width: "200px",
        height: "300px",
        backgroundColor: "lightblue",
        position: "relative",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        perspective: "1600px",
        overflow: "hidden",
      }}
      ref={wrapperRef}
    >
      <div
        style={{
          position: "absolute",
          zIndex: 5,
          top: "50%",
          left: "25%",
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
                transform: `rotateX(${idx * itemAngle}deg) translateZ(350px)`,
                transformOrigin: "center",
                transition: "opacity 0.3s ease-out",
              }}
              key={idx}
              ref={(el) => {
                timeItemsRef.current[idx] = el;
              }}
              {...getEventHandlers()}
            >
              {time}
            </div>
          );
        })}
      </div>
      <div
        ref={inpurRef}
        style={{
          position: "absolute",
          zIndex: 10,
          height: "40px",
          pointerEvents: "none",
          top: "50%",
          width: "100%",
          borderTop: "2px solid red",
          borderBottom: "2px solid red",
        }}
      >
        <Input {...field} error={error} />
      </div>
    </div>
  );
};

export default TimePicker;

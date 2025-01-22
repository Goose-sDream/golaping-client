import React, { useEffect, useRef, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Vote } from "../../../types/voteTypes";
import { Input } from "../../common/Input";

type TimePickerProps = {
  field: ControllerRenderProps<Vote, "time">;
  error?: string | undefined;
  type: string;
  threshold: number;
};

const TimePicker2 = ({ field, error, type = "hour" }: TimePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const times = Array.from({ length: type === "hour" ? 24 : 60 }, (_, i) => i);

  const [isClicked, setIsClicked] = useState(false);
  const [startY, setStartY] = useState(0);
  const currentOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const targetIdxRef = useRef(0);

  const translateSlide = (offset: number) => {
    if (!containerRef.current || !wrapperRef.current) return;
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const center = wrapperHeight / 2; // 화면 중간을 기준으로 설정

    timeItemsRef.current.forEach((item, index) => {
      if (!item) return;
      const baseY = offset + index * 40; // 각 요소의 Y 위치
      const distanceFromCenter = Math.abs(baseY - center); // 중심과의 거리
      const scale = Math.max(1 - distanceFromCenter / 200, 0.6); // 중심에서 멀어질수록 축소
      const opacity = Math.max(1 - distanceFromCenter / 300, 0); // 중심에서 멀어질수록 투명도 감소

      item.style.transform = `translateY(${baseY}px) scale(${scale})`;
      item.style.opacity = `${opacity}`;
      item.style.transition = `transform 0.5s ease-out, opacity 0.2s ease-out`;
    });
  };

  const handleAnimation = (offset: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      translateSlide(offset);
    });
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsClicked(true);
    const initialY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    setStartY(initialY);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isClicked) return;
    const currentY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    const deltaY = currentY - startY;

    currentOffsetRef.current += deltaY;
    handleAnimation(currentOffsetRef.current);
    setStartY(currentY);
  };

  const handleEnd = () => {
    setIsClicked(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    if (!isClicked) {
      if (timeItemsRef.current.every((time) => time !== null) && wrapperRef && wrapperRef.current) {
        const centerHeight = wrapperRef.current?.offsetHeight / 2; // 중앙 높이
        // 초기 슬라이드 위치
        if (currentOffsetRef.current === 0) {
          currentOffsetRef.current = centerHeight;
          handleAnimation(currentOffsetRef.current);
          return;
        }

        // 현재 offset 기준으로 목표 index 계산
        // const targetIdx = Math.round(-currentOffsetRef.current / 40);
        console.log("currentOffsetRef =>", currentOffsetRef.current);
        console.log("중앙과의 차이 =>", centerHeight - currentOffsetRef.current);
        const targetIdx =
          currentOffsetRef.current > 0 ? (targetIdxRef.current -= 1) : Math.max(0, (targetIdxRef.current += 1));
        const targetOffset = centerHeight - targetIdx * 40; // 화면 중앙과 targetIdx 간의 차이
        console.log("targetIdx =>", targetIdx);

        // 안전장치
        const maxOffset = centerHeight;
        const minOffset = -((times.length - 1) * 40 - centerHeight);
        currentOffsetRef.current = Math.min(maxOffset, Math.max(minOffset, targetOffset));
      }

      handleAnimation(currentOffsetRef.current);
    }
  }, [isClicked]);

  useEffect(() => {
    const handleMouseLeave = () => {
      setIsClicked(false);
    };
    if (wrapperRef.current) {
      wrapperRef.current.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "200px",
        height: "300px",
        backgroundColor: "lightblue",
        position: "relative",
        overflow: "hidden",
        perspective: "1200px", // 원근법 유지
        userSelect: "none",
      }}
      ref={wrapperRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
        }}
      >
        {times.map((time, idx) => (
          <div
            key={idx}
            ref={(el) => {
              timeItemsRef.current[idx] = el;
            }}
            style={{
              position: "absolute",
              width: "100px",
              height: "40px",
              top: "50%",
              left: "25%",
              transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            {time}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          height: "40px",
          pointerEvents: "none",
          top: "50%", // 선택 기준을 조정
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

export default TimePicker2;

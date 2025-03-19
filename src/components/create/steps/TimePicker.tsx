import React, { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { ZINDEX } from "@/constants/common";
import { ITEMHEIGHT, THRESHOLD } from "@/constants/create";
import { LIGHTGRAY } from "@/styles/color";
import { Vote } from "@/types/voteTypes";

type TimePickerProps = {
  type: string;
  name: keyof Vote;
  value: number;
  setValue: UseFormSetValue<Vote>;
};

const TimePicker = ({ type, name, value, setValue }: TimePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const times = Array.from({ length: type === "hour" ? 24 : 60 }, (_, i) => i);

  const [isClicked, setIsClicked] = useState(false);
  const [startY, setStartY] = useState(0);
  const currentOffsetRef = useRef(0);
  const movigRef = useRef({ start: 0, end: 0, targetIdx: value || 0 });
  const animationFrameRef = useRef<number | null>(null);

  const getCenter = () => {
    let centerHeight;
    if (timeItemsRef.current.every((time) => time !== null) && wrapperRef && wrapperRef.current) {
      centerHeight = wrapperRef.current?.offsetHeight / 2 - THRESHOLD; // 중앙 높이
      return centerHeight;
    }
    return 0;
  };

  const translateSlide = (offset: number) => {
    if (!containerRef.current || !wrapperRef.current) return;
    const center = getCenter(); // 화면 중간을 기준으로 설정

    timeItemsRef.current.forEach((item, index) => {
      if (!item) return;
      const baseY = offset + index * ITEMHEIGHT; // 각 요소의 Y 위치
      const distanceFromCenter = Math.abs(baseY - center); // 중심과의 거리
      const scale = Math.max(1 - distanceFromCenter / 200, 0.6); // 중심에서 멀어질수록 축소
      const opacity = Math.max(1 - distanceFromCenter / 300, 0); // 중심에서 멀어질수록 투명도 감소

      item.style.transform = `translateY(${baseY}px) scale(${scale})`;
      item.style.opacity = `${opacity}`;
      item.style.transition = `transform 0.5s ease-out, opacity 0.2s ease-out`;
    });
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsClicked(true);
    const initialY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    setStartY(initialY);
    movigRef.current.start = currentOffsetRef.current;
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
    movigRef.current.end = currentOffsetRef.current;
    setIsClicked(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleTargetIdx = (center: number) => {
    const movedDistance = movigRef.current.start - movigRef.current.end;
    if (Math.abs(movedDistance) > THRESHOLD) {
      movigRef.current.targetIdx += Math.round((movigRef.current.start - movigRef.current.end) / ITEMHEIGHT);
    }
    setValue(name, Math.max(0, movigRef.current.targetIdx));
    const targetOffset = center - movigRef.current.targetIdx * ITEMHEIGHT; // 화면 중앙과 targetIdx 간의 차이
    return targetOffset;
  };

  const handleSafeDistance = (center: number, targetOffset: number) => {
    //안전장치
    const maxOffset = center;
    const minOffset = -((times.length - 1) * ITEMHEIGHT - center);
    currentOffsetRef.current = Math.min(maxOffset, Math.max(minOffset, targetOffset));
  };

  const handleAnimation = (offset: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      translateSlide(offset);
    });
  };

  const handleSnapToClosestIdx = (center: number) => {
    const targetOffset = handleTargetIdx(center);
    handleSafeDistance(center, targetOffset);
    handleAnimation(currentOffsetRef.current);
  };

  useEffect(() => {
    if (!isClicked) {
      if (timeItemsRef.current.every((time) => time !== null) && wrapperRef && wrapperRef.current) {
        const centerHeight = wrapperRef.current?.offsetHeight / 2 - THRESHOLD; // 중앙 높이
        // 초기 슬라이드 위치
        if (currentOffsetRef.current === 0) {
          currentOffsetRef.current = centerHeight;
          handleAnimation(currentOffsetRef.current);
          return;
        }
        handleSnapToClosestIdx(centerHeight);
      }
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
        width: "80px",
        height: "200px",
        backgroundColor: `${LIGHTGRAY}`,
        borderRadius: "10px",
        position: "relative",
        overflow: "hidden",
        perspective: "1200px",
        userSelect: "none",
        opacity: 0.8,
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
          zIndex: `${ZINDEX.timePicker}`,
          display: "flex",
          justifyContent: "center",
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
              width: "70px",
              height: ITEMHEIGHT,
              top: "50%",
              transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              fontSize: 20,
            }}
          >
            {time}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimePicker;

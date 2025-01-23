import React, { useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { LIGHTGRAY } from "../../../styles/color";
import { Vote } from "../../../types/voteTypes";

type TimePickerProps = {
  type: string;
  threshold?: number;
  itemHeight?: number;
  name: keyof Vote;
  setValue: UseFormSetValue<Vote>;
};

const TimePicker = ({ type, itemHeight = 60, threshold = 5, name, setValue }: TimePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const times = Array.from({ length: type === "hour" ? 24 : 60 }, (_, i) => i);

  const [isClicked, setIsClicked] = useState(false);
  const [startY, setStartY] = useState(0);
  const currentOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const translateSlide = (offset: number) => {
    if (!containerRef.current || !wrapperRef.current) return;
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const center = wrapperHeight / 2; // 화면 중간을 기준으로 설정

    timeItemsRef.current.forEach((item, index) => {
      if (!item) return;
      const baseY = offset + index * itemHeight; // 각 요소의 Y 위치
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

  const handleTargetIdx = (center: number) => {
    // 현재 offset 기준으로 목표 index 계산
    // 1. 1개씩 슬라이드 하는 법
    // const targetIdx =
    //   currentOffsetRef.current > 0 ? (targetIdxRef.current -= 1) : Math.max(0, (targetIdxRef.current += 1));
    // 2. 여러개 쫙..
    let targetIdx = Math.round(-currentOffsetRef.current / itemHeight);
    const gap = -currentOffsetRef.current % itemHeight; // 현재 위치가 가장 가까운 인덱스에서 떨어진 정도
    if (Math.abs(gap) < threshold) {
      targetIdx = Math.floor(-currentOffsetRef.current / itemHeight); // 작은 이동은 가까운 쪽으로 스냅
    }
    console.log("targetIdx =>", targetIdx);
    setValue(name, Math.max(0, targetIdx));
    const targetOffset = center - targetIdx * itemHeight; // 화면 중앙과 targetIdx 간의 차이
    return targetOffset;
  };

  const handleSafeDistance = (center: number, targetOffset: number) => {
    //안전장치
    const maxOffset = center;
    const minOffset = -((times.length - 1) * itemHeight - center);
    currentOffsetRef.current = Math.min(maxOffset, Math.max(minOffset, targetOffset));
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
        const targetOffset = handleTargetIdx(centerHeight);
        handleSafeDistance(centerHeight, targetOffset);
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
        width: "300px",
        height: "300px",
        backgroundColor: `${LIGHTGRAY}`,
        borderRadius: "10px",
        position: "relative",
        overflow: "hidden",
        perspective: "1200px", // 원근법 유지
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
          zIndex: 20,
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
              width: "280px",
              height: itemHeight,
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
      {/* <div
        style={{
          position: "absolute",
          zIndex: 10,
          height: itemHeight,
          pointerEvents: "none",
          top: "50%",
          width: "100%",
          borderTop: "2px solid red",
          borderBottom: "2px solid red",
        }}
      >
        <Input {...field} error={error} />
      </div> */}
    </div>
  );
};

export default TimePicker;

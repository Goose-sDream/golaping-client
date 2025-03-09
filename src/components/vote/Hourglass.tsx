import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { PINK } from "@/styles/color";

interface HourglassProps {
  voteEndTime: string;
  onExpire: () => void;
}

const Hourglass = ({ voteEndTime, onExpire }: HourglassProps) => {
  const [remainingTime, setRemainingTime] = useState<string>("");
  useEffect(() => {
    if (!voteEndTime) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const endTime = new Date(voteEndTime).getTime();
      const timeLeft = Math.max(endTime - now, 0);

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      setRemainingTime(formattedTime);

      if (timeLeft === 0) {
        onExpire();
      }
    };

    updateRemainingTime();
    const intervalId = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(intervalId);
  }, [voteEndTime]);

  return (
    <Container>
      <HourglassContainer>
        <Top>
          <TopBg />
          <TopProgress />
        </Top>
        <Line />
        <Bottom>
          <BottomBg />
          <BottomProgress />
        </Bottom>
      </HourglassContainer>
      <TimeText>{remainingTime}</TimeText>
    </Container>
  );
};

export default Hourglass;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
`;

const TimeText = styled.p`
  font-size: 24px;
  color: ${PINK};
`;

const rotate = keyframes`
  90% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
`;

const topProgress = keyframes`
  3% {
    transform: scale(1) translateY(0);
  }
  90% {
    transform: scale(0) translateY(0);
  }
  100% {
    transform: scale(0) translateY(0);
  }
`;

const lineProgress = keyframes`
  10% { height: 35px; }
  90% { height: 35px; }
  100% { height: 0; }
`;

const bottomProgress = keyframes`
  10% {
    transform: scale(0) translateY(0);
  }
  90% {
    transform: scale(1) translateY(0);
  }
  100% {
    transform: scale(1) translateY(-15px);
  }
`;

export const HourglassContainer = styled.div`
  height: 40px;
  width: 40px;
  margin: 80px auto;
  animation: ${rotate} 60s cubic-bezier(0.7, 0, 0.2, 1) infinite;
`;

export const Top = styled.div`
  position: relative;
`;

export const TopBg = styled.div`
  position: absolute;
  z-index: 0;
  top: -18px;
  width: 100%;
  height: 20px;
  border-top: 5px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    bottom: -20px;
    border-top: 20px solid transparent;
    border-right: 20px solid transparent;
    border-left: 20px solid transparent;
  }
`;

export const TopProgress = styled.div`
  border-top: 20px solid ${PINK};
  border-right: 20px solid transparent;
  border-left: 20px solid transparent;
  height: 0;
  width: 1px;
  transform: scale(1) translateY(0);
  transform-origin: 50% 100%;
  animation: ${topProgress} 60s linear infinite;
`;

export const Line = styled.div`
  position: absolute;
  z-index: 2;
  top: 20px;
  left: 20px;
  height: 0;
  width: 0;
  border-left: 1px solid ${PINK};
  animation: ${lineProgress} 60s linear infinite;
`;

export const Bottom = styled.div`
  position: relative;
`;

export const BottomBg = styled.div`
  position: absolute;
  z-index: 0;
  bottom: -5px;
  width: 100%;
  height: 20px;
  border-bottom: 5px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    top: -20px;
    border-bottom: 20px solid transparent;
    border-right: 20px solid transparent;
    border-left: 20px solid transparent;
  }
`;

export const BottomProgress = styled.div`
  border-right: 20px solid transparent;
  border-bottom: 20px solid ${PINK};
  border-left: 20px solid transparent;
  height: 0;
  width: 1px;
  margin-top: 15px;
  transform: scale(0) translateY(0);
  transform-origin: 50% 100%;
  animation: ${bottomProgress} 60s linear infinite;
`;

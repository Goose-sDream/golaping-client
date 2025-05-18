import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { PINK } from "@/styles/color";

interface HourglassProps {
  voteEndTime: string;
}

const Hourglass = ({ voteEndTime }: HourglassProps) => {
  console.log("voteEndTime =>", voteEndTime);
  const [remainingTime, setRemainingTime] = useState<string>("");
  useEffect(() => {
    if (!voteEndTime) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const endTime = new Date(voteEndTime).getTime();
      const timeLeft = Math.max(endTime - now, 0);

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.ceil((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      setRemainingTime(formattedTime);
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
`;

const TimeText = styled.p`
  font-size: 18px;
  color: white;
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
  10% {
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
  10% { height: 18px; }
  80% { height: 18px; }
  90% { height: 0; }
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
    transform: scale(1) translateY(0);
  }
`;

const HourglassContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 1.5rem;
  width: 1.5rem;
  animation: ${rotate} 60s cubic-bezier(0.7, 0, 0.2, 1) infinite;
`;

const Top = styled.div`
  position: relative;
`;

const TopBg = styled.div`
  position: absolute;
  z-index: 0;
  top: -0.1rem;
  width: 95%;
  border-top: 2px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    bottom: -0.4375rem;
    border-top: 0.625rem solid transparent;
    border-right: 0.625 solid transparent;
    border-left: 0.625rem solid transparent;
  }
`;

const TopProgress = styled.div`
  border-top: 0.625rem solid ${PINK};
  border-right: 0.625rem solid transparent;
  border-left: 0.625rem solid transparent;
  height: 0;
  width: 1px;
  transform: scale(1) translateY(0);
  transform-origin: 50% 100%;
  animation: ${topProgress} 60s linear infinite;
`;

const Line = styled.div`
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translate(-50%, -35%);
  left: 50%;
  width: 0;
  border-left: 1px solid ${PINK};
  animation: ${lineProgress} 60s linear infinite;
`;

const Bottom = styled.div`
  position: relative;
`;

const BottomBg = styled.div`
  position: absolute;
  z-index: 0;
  width: 95%;
  bottom: 0;
  border-bottom: 2px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    top: -0.25rem;
    border-bottom: 0.625rem solid transparent;
    border-right: 0.625rem solid transparent;
    border-left: 0.625rem solid transparent;
  }
`;

const BottomProgress = styled.div`
  border-right: 0.625rem solid transparent;
  border-bottom: 0.625rem solid ${PINK};
  border-left: 0.625rem solid transparent;
  height: 0;
  width: 1px;
  margin-top: 0.625rem;
  transform: scale(0) translateY(0);
  transform-origin: 50% 100%;
  animation: ${bottomProgress} 60s linear infinite;
`;

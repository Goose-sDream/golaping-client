import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { PINK } from "@/styles/color";

interface HourglassProps {
  voteEndTime: string;
}

const Hourglass = ({ voteEndTime }: HourglassProps) => {
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
  font-size: 24px;
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
  10% { height: 25px; }
  90% { height: 25px; }
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
    transform: scale(1) translateY(-5px);
  }
`;

const HourglassContainer = styled.div`
  height: 30px;
  width: 30px;
  animation: ${rotate} 60s cubic-bezier(0.7, 0, 0.2, 1) infinite;
`;

const Top = styled.div`
  position: relative;
`;

const TopBg = styled.div`
  position: absolute;
  z-index: 0;
  top: -10px;
  width: 100%;
  height: 15px;
  border-top: 5px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    border-top: 15px solid transparent;
    border-right: 15px solid transparent;
    border-left: 15px solid transparent;
  }
`;

const TopProgress = styled.div`
  border-top: 15px solid ${PINK};
  border-right: 15px solid transparent;
  border-left: 15px solid transparent;
  height: 0;
  width: 1px;
  transform: scale(1) translateY(0);
  transform-origin: 50% 100%;
  animation: ${topProgress} 60s linear infinite;
`;

const Line = styled.div`
  position: absolute;
  z-index: 2;
  top: 15px;
  left: 15px;
  height: 0;
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
  width: 100%;
  height: 20px;
  border-bottom: 5px solid ${PINK};

  &::after {
    content: "";
    position: absolute;
    z-index: 0;
    top: -5px;
    border-bottom: 15px solid transparent;
    border-right: 15px solid transparent;
    border-left: 15px solid transparent;
  }
`;

const BottomProgress = styled.div`
  border-right: 15px solid transparent;
  border-bottom: 15px solid ${PINK};
  border-left: 15px solid transparent;
  height: 0;
  width: 1px;
  margin-top: 10px;
  transform: scale(0) translateY(0);
  transform-origin: 50% 100%;
  animation: ${bottomProgress} 60s linear infinite;
`;

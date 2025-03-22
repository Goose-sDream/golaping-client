import styled from "styled-components";
import ArrowIcon from "@/assets/Arrow.svg";
import { LIGHTGRAY, PURPLE } from "@/styles/color";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  onPrevClick: () => void;
}

const Stepper = ({ currentStep, totalSteps, onPrevClick }: StepperProps) => {
  return (
    <StepperContainer>
      <ArrowButtonContainer>
        <ArrowButton onClick={onPrevClick}>
          <ArrowIcon />
        </ArrowButton>
      </ArrowButtonContainer>
      <Steps>
        {Array.from({ length: totalSteps }, (_, index) => (
          <BarWrapper key={index}>
            <Bar $isActive={index <= currentStep - 1} />
          </BarWrapper>
        ))}
      </Steps>
    </StepperContainer>
  );
};

const StepperContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
`;

const Steps = styled.div`
  display: flex;
  gap: 10px;
  margin: 15px 0px;
`;

const BarWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Bar = styled.div<{ $isActive: boolean }>`
  width: 130px;
  height: 4px;
  background-color: ${({ $isActive }) => ($isActive ? PURPLE : LIGHTGRAY)};
  border-radius: 10px;
`;

const ArrowButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: -20px;
`;

const ArrowButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default Stepper;

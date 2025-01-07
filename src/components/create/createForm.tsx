import { JSX, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import styled from "styled-components";
import CreateNShareVote from "./CreateNShareVote";
import { BasicForm } from "./steps/BasicForm";
import { LandingForm } from "./steps/LandingForm";
import { Button } from "../common/Button";
import OptionForm from "./steps/OptionForm";

export const CreateForm = () => {
  const methods = useForm();
  const [step, setStep] = useState<number>(1);
  const steps: { [key: number]: JSX.Element } = {
    1: <LandingForm />,
    2: <BasicForm />,
    3: <OptionForm />,
    4: <CreateNShareVote />,
  };

  return (
    <FormProvider {...methods}>
      <form>
        {steps[step]}
        <ButtonContainer>
          {step === 1 && (
            <Button type="button" onClick={() => setStep(step + 1)}>
              투표 생성하기
            </Button>
          )}
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(step - 1)}
              style={{ alignSelf: "flex-start" }}
            >
              이전
            </Button>
          )}
          {step === 2 && (
            <Button type="button" variant="primary" onClick={() => setStep(step + 1)} style={{ marginLeft: "auto" }}>
              다음
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
              variant="primary"
              onClick={methods.handleSubmit(() => {
                setStep(step + 1);
                console.log("생성 완료");
              })}
              style={{ marginLeft: "auto" }}
            >
              생성하기
            </Button>
          )}
        </ButtonContainer>
      </form>
    </FormProvider>
  );
};

const ButtonContainer = styled.div<{ center?: boolean }>`
  position: fixed;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: ${({ center }) => (center ? "center" : "space-between")};
  padding: 0 20px;
  box-sizing: border-box;
`;

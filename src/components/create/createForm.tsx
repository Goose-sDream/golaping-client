import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import styled from "styled-components";
import { BasicForm } from "./steps/BasicForm";
import { LandingForm } from "./steps/LandingForm";
import { Button } from "../common/Button";

export const CreateForm = () => {
  const methods = useForm();
  const [step, setStep] = useState<number>(1);

  return (
    <FormProvider {...methods}>
      <form>
        {step === 1 && <LandingForm />}
        {step === 2 && <BasicForm />}
        <ButtonContainer>
          {step === 1 && (
            <Button type="button" onClick={() => setStep(step + 1)}>
              투표 생성하기
            </Button>
          )}
          {step > 1 && step < 4 && (
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

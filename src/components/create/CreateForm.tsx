import { JSX, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import styled from "styled-components";
import { BasicForm } from "./steps/BasicForm";
import { LandingForm } from "./steps/LandingForm";
import { Button } from "../common/Button";
import OptionForm from "./steps/OptionForm";
import ShareVote from "./steps/ShareVote";
import Stepper from "../common/Stepper";

export const CreateForm = () => {
  const methods = useForm();
  const [step, setStep] = useState<number>(1);
  const steps: { [key: number]: JSX.Element } = {
    1: <LandingForm />,
    2: <BasicForm />,
    3: <OptionForm />,
    4: <ShareVote />,
  };

  return (
    <FormProvider {...methods}>
      {step > 1 && step < 4 && <Stepper currentStep={step - 1} totalSteps={2} onPrevClick={() => setStep(step - 1)} />}
      <FormContainer>
        {steps[step]}
        <ButtonContainer>
          {step === 1 && (
            <Button type="button" onClick={() => setStep(step + 1)}>
              투표 만들기
            </Button>
          )}
          {step === 2 && (
            <Button type="button" onClick={() => setStep(step + 1)}>
              다음
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
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
      </FormContainer>
    </FormProvider>
  );
};

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
`;

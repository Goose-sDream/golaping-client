import { JSX, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { BasicForm } from "./steps/BasicForm";
import { LandingForm } from "./steps/LandingForm";
import { Button } from "../common/Button";
import OptionForm from "./steps/OptionForm";
import ShareVote from "./steps/ShareVote";
import Stepper from "../common/Stepper";

export const CreateForm = () => {
  const methods = useForm();
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [randomLink, setRandomLink] = useState<string>("");

  const generateLink = (): string => {
    const link = `/vote/${uuid()}`;
    setRandomLink(link);
    return link;
  };

  const handleNavigate = () => {
    if (randomLink) {
      navigate(randomLink);
    } else {
      const link = generateLink();
      navigate(link);
    }
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${randomLink || generateLink()}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };

  const steps: { [key: number]: JSX.Element } = {
    1: <LandingForm />,
    2: <BasicForm />,
    3: <OptionForm />,
    4: <ShareVote onCopy={handleCopy} />,
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
            >
              생성하기
            </Button>
          )}
          {step === 4 && (
            <Button type="button" onClick={handleNavigate}>
              투표하러 가기
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
  align-items: center;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 100;
`;

import { JSX, useState } from "react";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { BasicForm, LandingForm, OptionForm, ShareVote } from "./steps";
import { Button, Stepper } from "@/components/common";
import useSessionId from "@/hooks/useSessionId";
import useWebsocketUrl from "@/hooks/useWebsocketUrl";
import Request from "@/services/requests";
import { APIResponse } from "@/types/apiTypes";

export const CreateForm = () => {
  const methods = useForm({
    mode: "onBlur",
  });
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [randomLink, setRandomLink] = useState<string>("");
  const request = Request();
  const { updateSessionId } = useSessionId();
  const { setWebsocketUrl } = useWebsocketUrl();

  const createVote = async (data: FieldValues) => {
    const timeLimit = data.hour * 60 + data.minute;
    const link = `${window.location.origin}${generateLink()}`;
    const response = await request.post<APIResponse<{ websocketUrl: string; sessionId: string }>>("/api/votes", {
      title: data.title,
      nickname: data.nickname,
      type: data.type,
      userVoteLimit: data.userVoteLimit,
      timeLimit,
      link,
    });
    console.log(response);

    if (response.isSuccess) {
      const { sessionId, websocketUrl } = response.result;
      updateSessionId(sessionId);
      setWebsocketUrl(websocketUrl);
      setStep(step + 1);
    } else {
      console.error("Vote creation failed:", response.message);
    }
  };

  const generateLink = () => {
    const link = `/votes/${uuid()}`;
    setRandomLink(link);
    return link;
  };

  const handleNavigate = () => {
    navigate(randomLink);
  };

  const steps: { [key: number]: JSX.Element } = {
    1: <LandingForm />,
    2: <BasicForm />,
    3: <OptionForm />,
    4: <ShareVote randomLink={randomLink} />,
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
              onClick={methods.handleSubmit((data) => {
                createVote(data as FieldValues);
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
  max-width: 400px;
  min-width: 300px;
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

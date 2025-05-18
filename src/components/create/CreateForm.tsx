import { JSX, useState } from "react";
import { useForm, FormProvider, FieldValues } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { BasicForm, LandingForm, OptionForm, ShareVote } from "./steps";
import { limitState } from "@/atoms/createAtom";
import { Button, Stepper } from "@/components/common";
import Request from "@/services/requests";
import { APIResponse } from "@/types/apiTypes";
import { getStorage } from "@/util";

export const CreateForm = () => {
  const storage = getStorage();
  const isSharedWorkerSupported = typeof SharedWorker !== "undefined";
  const methods = useForm({
    mode: "onBlur",
  });
  const { handleSubmit, trigger } = methods;
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [randomLink, setRandomLink] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const { limited } = useRecoilValue(limitState);
  const request = Request();

  const createVote = async (data: FieldValues) => {
    const timeLimit = data.hour * 60 + data.minute;
    const link = `${window.location.origin}${generateLink()}`;
    const response = await request.post<APIResponse<{ voteUuid: string; voteEndTime: string; voteIdx: number }>>(
      "/api/votes",
      {
        title: data.title,
        nickname: data.nickname,
        type: data.type,
        userVoteLimit: data.userVoteLimit,
        timeLimit,
        link,
      }
    );
    console.log(response);

    if (response.isSuccess) {
      const { voteUuid, voteEndTime, voteIdx } = response.result;
      setStep(step + 1);
      storage.setItem("voteUuid", voteUuid);
      storage.setItem("voteEndTime", voteEndTime);
      storage.setItem("voteIdx", String(voteIdx));
      storage.setItem("limited", JSON.stringify(limited));
      storage.setItem("voteTitle", data.title);
      storage.setItem("isSharedWorker", isSharedWorkerSupported ? "true" : "false");
      sessionStorage.setItem("isSharedWorker", isSharedWorkerSupported ? "true" : "false");
      setTitle(data.title);
      // 새로고침 시에도 "제한"/"무제한" 유지되도록 세션스토리지에 저장함
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
    navigate(randomLink + `/${title}`);
  };

  const handleRestrict = () => {
    if (isSharedWorkerSupported && storage.getItem("isSharedWorker")) {
      alert("이미 동일한 브라우저에서 생성한 투표가 있습니다. \n기존 투표로 이동해서 투표를 종료해주세요.");
      const voteUuid = storage.getItem("voteUuid");
      const voteTitle = storage.getItem("voteTitle");
      navigate(`votes/${voteUuid}/${voteTitle}`);
      return;
    }
  };

  const handleNextStep = async (fields?: string[]) => {
    handleRestrict();
    const isValid = fields ? await trigger(fields) : true;

    if (isValid) {
      setStep(step + 1);
    }
  };

  const steps: { [key: number]: JSX.Element } = {
    1: <LandingForm />,
    2: <BasicForm />,
    3: <OptionForm />,
    4: <ShareVote randomLink={randomLink} title={title} />,
  };

  return (
    <FormProvider {...methods}>
      {step > 1 && step < 4 && <Stepper currentStep={step - 1} totalSteps={2} onPrevClick={() => setStep(step - 1)} />}
      <FormContainer>
        {steps[step]}
        <ButtonContainer>
          {step === 1 && (
            <Button type="button" onClick={() => handleNextStep()}>
              투표 만들기
            </Button>
          )}
          {step === 2 && (
            <Button type="button" onClick={() => handleNextStep(["title", "nickname"])}>
              다음
            </Button>
          )}
          {step === 3 && (
            <Button
              type="button"
              onClick={async () => {
                const isValid = await trigger(["hour", "minute"]);
                if (isValid) {
                  handleSubmit((data) => createVote(data as FieldValues))();
                }
              }}
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
  min-width: 300px;
  max-width: 400px;
  width: 100%;
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

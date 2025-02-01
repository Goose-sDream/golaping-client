import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Button } from "../common";
import LogoWithInput from "./LogoWithInput";
import useWebsocketUrl from "@/hooks/useWebsocketUrl";

interface EnterVoteProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const EnterVote = ({ setStep }: EnterVoteProps) => {
  const { websocketUrl } = useWebsocketUrl();
  console.log(websocketUrl);
  const { register, handleSubmit } = useForm();

  const onSubmit = async () => {
    console.log("submit");
    setStep(2);
  };

  return (
    <Wrapper onSubmit={handleSubmit(onSubmit)}>
      <Title>투표 제목</Title>
      <Button type="submit" style={{ position: "absolute", bottom: 20, zIndex: 100 }}>
        투표 입장하기
      </Button>
      <LogoWithInput register={register} />
    </Wrapper>
  );
};

export default EnterVote;

const Wrapper = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  height: 20vh;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

import { Dispatch, SetStateAction } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../common";
import LogoWithInput from "./LogoWithInput";
import useWebSocket from "@/hooks/useWebsocket";
import Request from "@/services/requests";
import { APIResponse } from "@/types/apiTypes";

interface EnterVoteProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const EnterVote = ({ setStep }: EnterVoteProps) => {
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const request = Request();
  const { client, connected, error } = useWebSocket(id!);

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await request.post<APIResponse<{ websocketUrl: string; voteEndTime: string }>>(
        `/api/votes/enter`,
        {
          voteUuid: id,
          nickname: data.nickname,
        }
      );

      if (response.isSuccess) {
        sendWebSocket();
      }
    } catch (error) {
      console.error("Failed to enter vote:", error);
      alert("투표 입장에 실패했습니다.");
    }
  };

  const sendWebSocket = () => {
    if (error) {
      console.error("WebSocket Error:", error);
      return;
    }

    try {
      client!.publish({
        destination: `/app/vote/${id}/connect`,
      });
      setStep(2);
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }

    client!.subscribe("/user/queue/initialResponse", (message: { body: string }) => {
      console.log("Received: ", JSON.parse(message.body));
    });
  };

  return (
    <Wrapper onSubmit={handleSubmit(onSubmit)}>
      <Title>투표 제목</Title>
      <Button type="submit" style={{ position: "absolute", bottom: 20, zIndex: 100 }} disabled={!connected}>
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

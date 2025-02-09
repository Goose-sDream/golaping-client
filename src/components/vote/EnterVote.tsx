import { Dispatch, SetStateAction, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import styled from "styled-components";
import { Button } from "../common";
import LogoWithInput from "./LogoWithInput";
import useCookies from "@/hooks/useCookies";
import useVoteId from "@/hooks/useVoteId";
import { useWebSocket } from "@/hooks/useWebsocket";
import Request from "@/services/requests";
import { APIResponse } from "@/types/apiTypes";

interface EnterVoteProps {
  setStep: Dispatch<SetStateAction<number>>;
}

export interface VoteFormData extends FieldValues {
  nickname: string;
}

const EnterVote = ({ setStep }: EnterVoteProps) => {
  const { register, handleSubmit } = useForm();
  const { voteId } = useVoteId();
  const request = Request();
  const { client, connected, error } = useWebSocket(voteId);
  const { getCookie } = useCookies();
  const sessionId = getCookie("SESSIONID");

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await request.post<APIResponse<{ websocketUrl: string; voteEndTime: string }>>(
        `/api/votes/enter`,
        {
          voteUuid: voteId,
          nickname: data.nickname,
        }
      );

      if (response.isSuccess) {
        sendWebSocket();
      }
    } catch (error) {
      console.error("Failed to enter vote:", error);
    }
  };

  const sendWebSocket = () => {
    if (error) {
      console.error("WebSocket Error:", error);
      return;
    }

    if (!client || !connected) {
      console.warn("WebSocket not connected");
      return;
    }

    try {
      client.publish({
        destination: `/app/vote/connect`,
        body: JSON.stringify({
          voteUuid: voteId,
          sessionId: sessionId,
        }),
      });
      setStep(2);
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }

    client.subscribe("/user/queue/initialResponse", (message: { body: string }) => {
      console.log("Received: ", JSON.parse(message.body));
    });
  };

  useEffect(() => {
    if (sessionId) {
      sendWebSocket();
    }
  }, [sessionId, connected]);

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

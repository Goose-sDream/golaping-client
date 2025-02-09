import { Dispatch, SetStateAction, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../common";
import LogoWithInput from "./LogoWithInput";
import { useWebSocket } from "@/contexts/WebSocketContext";
import Request from "@/services/requests";
import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";

interface EnterVoteProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const storage = new StorageController("session");

const EnterVote = ({ setStep }: EnterVoteProps) => {
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const nickname = storage.getItem("nickname");
  const request = Request();
  const { client, connected, error } = useWebSocket();

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
        storage.setItem("nickname", data.nickname);
        subscribeToMessages();
      }
    } catch (error) {
      console.error("Failed to enter vote:", error);
      alert("투표 입장에 실패했습니다.");
    }
  };

  const subscribeToMessages = () => {
    if (!client || error) {
      console.error("WebSocket not ready:", error || "Client not initialized");
      return;
    }

    try {
      client.publish({
        destination: `/app/vote/${id}/connect`,
      });
      client.subscribe("/user/queue/initialResponse", (message: { body: string }) => {
        console.log("Received: ", JSON.parse(message.body));
      });
      setStep(2);
    } catch (error) {
      console.error("Failed to subscribe to messages:", error);
    }
  };

  useEffect(() => {
    console.log("Connected:", connected, "Client:", client);

    if (!connected || !client) return; // connected가 true이면서 client가 존재할 때만 실행

    if (nickname) {
      subscribeToMessages();
    }
  }, [connected, client]);

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

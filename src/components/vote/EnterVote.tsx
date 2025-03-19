// import { Dispatch, SetStateAction, useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import LogoWithInput from "./LogoWithInput";
import { Button } from "@/components/common";
import { useWebSocket } from "@/contexts/WebSocketContext";
import Request from "@/services/requests";
import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";

// interface EnterVoteProps {
//   setStep: Dispatch<SetStateAction<number>>;
// }

const storage = new StorageController("session");

const EnterVote = () => {
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const request = Request();
  const { connectWebSocket } = useWebSocket();

  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await request.post<APIResponse<{ voteIdx: number; voteEndTime: string }>>(`/api/votes/enter`, {
        voteUuid: id,
        nickname: data.nickname,
      });

      if (response.isSuccess) {
        const { voteIdx, voteEndTime } = response.result;
        storage.setItem("voteUuid", id!);
        storage.setItem("voteEndTime", voteEndTime);
        storage.setItem("voteIdx", String(voteIdx));
        connectWebSocket(); // 새로고침 없이 웹소켓 재연결 실행
      }
    } catch (error) {
      console.error("Failed to enter vote:", error);
      alert("투표 입장에 실패했습니다.");
    }
  };

  // const subscribeToMessages = () => {
  //   if (!client || error) {
  //     console.error("WebSocket not ready:", error || "Client not initialized");
  //     return;
  //   }

  //   try {
  //     client.publish({
  //       destination: `/app/vote/connect`,
  //     });
  //     client.subscribe("/user/queue/initialResponse", (message: { body: string }) => {
  //       console.log("Received: ", JSON.parse(message.body));
  //     });
  //     setStep(2);
  //   } catch (error) {
  //     console.error("Failed to subscribe to messages:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (connected && client) {
  //     subscribeToMessages();
  //   }
  // }, [connected, client]); // connected나 client가 변경될 때 실행

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

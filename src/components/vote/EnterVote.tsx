import { FieldValues, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import LogoWithInput from "./LogoWithInput";
import { Button } from "@/components/common";
import { ZINDEX } from "@/constants/common";
import { useWebSocket } from "@/contexts/WebSocketContext";
import Request from "@/services/requests";
// import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";
import { getStorage } from "@/util";

const storage = getStorage();

const EnterVote = () => {
  const isSharedWorkerSupported = typeof SharedWorker !== "undefined";
  const { id, title } = useParams();
  const { connectWebSocket } = useWebSocket();

  const { register, handleSubmit } = useForm();
  const request = Request();

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
        storage.setItem("voteTitle", String(title));
        storage.setItem("isSharedWorker", isSharedWorkerSupported ? "true" : "false");
        sessionStorage.setItem("isSharedWorker", isSharedWorkerSupported ? "true" : "false");

        if (id) connectWebSocket(id);
        // 새로고침 없이 웹소켓 재연결 실행
      }
    } catch (error) {
      console.error("Failed to enter vote:", error);
      alert("투표 입장에 실패했습니다.");
    }
  };

  return (
    <Wrapper onSubmit={handleSubmit(onSubmit)}>
      <Title>{title}</Title>
      <Button type="submit" style={{ position: "absolute", bottom: 20, zIndex: `${ZINDEX.createBtn}` }}>
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

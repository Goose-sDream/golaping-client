import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import styled from "styled-components";
import { Button } from "../common";
import LogoWithInput from "./LogoWithInput";
import useCookies from "@/hooks/useCookies";
import useWebsocketUrl from "@/hooks/useWebsocketUrl";

interface EnterVoteProps {
  setStep: Dispatch<SetStateAction<number>>;
}

const EnterVote = ({ setStep }: EnterVoteProps) => {
  const { websocketUrl } = useWebsocketUrl();
  console.log(websocketUrl);
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  console.log("id", id);
  const { getCookie } = useCookies();
  const sessionId = getCookie("SESSIONID");
  console.log("sessionId =>", sessionId);
  const stompClientRef = useRef<Client | null>(null);

  const connectWebSocket = () => {
    const stompClient = new Client({
      brokerURL: websocketUrl,
      webSocketFactory: () => {
        const socket = new SockJS(`${process.env.API_URL}/ws/votes`);
        (socket as any).withCredentials = true; // 쿠키 포함 설정
        return socket;
      },
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.warn("STOMP 연결 성공!");

        stompClient.subscribe(`/user/queue/initialResponse`, (message) => {
          const response = JSON.parse(message.body);
          console.warn("초기 응답:", response);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP 오류:", frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  const onSubmit = async () => {
    console.log("submit");
    setStep(2);
  };

  useEffect(() => {
    console.log("sessionId", sessionId);
    if (sessionId) {
      connectWebSocket();
    }
  }, []);

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

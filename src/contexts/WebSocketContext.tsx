import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, IStompSocket } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import StorageController from "@/storage/storageController";

interface WebSocketContextType {
  client: Client | null;
  connected: boolean;
  error: string | null;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);
const storage = new StorageController("session");

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const voteUuid = storage.getItem("voteUuid");
  const nickname = storage.getItem("nickname");

  useEffect(() => {
    // 기존 연결 상태 확인 (sessionStorage에서 가져옴)
    const storedConnected = storage.getItem("wsConnected") === "true";
    if (storedConnected && clientRef.current) {
      console.log("Reusing existing WebSocket connection");
      setConnected(true); // 이미 연결되어 있으면 연결 재사용
      return;
    }

    // WebSocket 연결을 새로 설정
    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = `${process.env.API_URL}/ws/votes`; // 동일한 URL 사용
        const socket = new SockJS(wsUrl, null, { transports: ["websocket"] }) as IStompSocket;
        (socket as any).withCredentials = true;

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          setError("Connection error occurred.");
          storage.removeItem("wsConnected");
        };

        return socket;
      },
      connectHeaders: {
        voteUuid: voteUuid!, // voteUuid를 헤더로 전달하여 각 투표를 구별
        nickname: nickname!,
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setConnected(true);
        setError(null);
        storage.setItem("wsConnected", "true"); // 연결이 성공하면 상태를 저장
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        setError(`STOMP Error: ${frame.headers?.message || "Unknown error"}`);
      },
      onWebSocketClose: () => {
        console.log("WebSocket connection closed");
        setConnected(false);
      },
    });

    try {
      client.activate(); // 연결 시도
      clientRef.current = client;
    } catch (error) {
      console.error("Failed to activate STOMP client:", error);
      setError("Failed to initialize WebSocket");
      storage.removeItem("wsConnected");
    }

    // 연결 해제는 컴포넌트가 언마운트될 때가 아니라, 필요할 때만 호출하도록 수정
    // return () => {}; // 언마운트 시 연결 해제하지 않음
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  const disconnect = () => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      setError(null);
      storage.removeItem("wsConnected");
    }
  };

  const value = {
    client: clientRef.current,
    connected,
    error,
    disconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

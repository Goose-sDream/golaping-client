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
    // 기존 연결이 있으면 닫아주기
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = `${process.env.API_URL}/ws/votes`;
        const socket = new SockJS(wsUrl, null, { transports: ["websocket"] }) as IStompSocket;
        (socket as any).withCredentials = true;

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          setError("Connection error occurred.");
        };

        return socket;
      },
      connectHeaders: {
        voteUuid: voteUuid!,
        nickname: nickname!,
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setConnected(true);
        setError(null);
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
      client.activate(); // 연결 시작
      clientRef.current = client;
    } catch (error) {
      console.error("Failed to activate STOMP client:", error);
      setError("Failed to initialize WebSocket");
    }

    // 언마운트될 때 기존 연결 해제 (다음 마운트 시 새로 연결)
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []); // 마운트될 때 실행

  const disconnect = () => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      setError(null);
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

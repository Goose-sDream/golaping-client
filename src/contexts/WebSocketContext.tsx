import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import StorageController from "@/storage/storageController";
import { isVoteExpired } from "@/utils/sessionUtils";

interface WebSocketContextType {
  client: Client | null;
  connected: boolean;
  error: string | null;
  disconnect: () => void;
  connectWebSocket: () => void; // 새로고침 없이 WebSocket 연결하는 함수 추가
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);
const storage = new StorageController("session");

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  const initializeWebSocket = () => {
    if (isVoteExpired()) {
      console.log("Vote has expired, skipping WebSocket connection.");
      return;
    }
    const voteUuid = storage.getItem("voteUuid");

    if (!voteUuid) {
      console.log("No voteUuid found, skipping WebSocket connection.");
      return;
    }

    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const client = new Client({
      brokerURL: `wss://${process.env.API_URL}/ws/votes`,
      debug: (msg) => console.log(msg),
      reconnectDelay: 500000,
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setConnected(true);
        setError(null);
      },
      onWebSocketClose: () => {
        console.log("WebSocket closed");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        setError(`STOMP Error: ${frame.headers?.message || "Unknown error"}`);
      },
    });

    console.log("activating client", client);

    try {
      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error("WebSocket activation failed:", error);
      setError("Failed to initialize WebSocket");
    }
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []); // 처음 마운트될 때 한 번만 실행

  const connectWebSocket = () => {
    initializeWebSocket(); // 수동으로 WebSocket을 연결할 수 있도록 추가
  };

  const disconnect = () => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      setError(null);
    }
  };

  return (
    <WebSocketContext.Provider value={{ client: clientRef.current, connected, error, disconnect, connectWebSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

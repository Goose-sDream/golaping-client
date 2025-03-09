import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import StorageController from "@/storage/storageController";
import { isVoteExpired } from "@/utils/sessionUtils";

interface WebSocketContextType {
  step: number;
  setStep: any;
  prevVotes: PrevVotes[];
  voteLimit: number | null;
  voteUuid: string | null;
  client: Client | null;
  connected: boolean;
  error: string | null;
  disconnect: () => void;
  connectWebSocket: () => void; // 새로고침 없이 WebSocket 연결하는 함수 추가
}
type PrevVotes = {
  optionId: number;
  optionName: string;
  voteCount: number;
  voteColor: string;
  isVotedByUser: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);
const storage = new StorageController("session");

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(0);
  const [prevVotes, setPrevVotes] = useState<PrevVotes[]>([]);
  const [voteLimit, setVoteLimit] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteUuid, setVoteUuid] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  const initializeWebSocket = () => {
    if (isVoteExpired()) {
      console.log("Vote has expired, skipping WebSocket connection.");
      setStep(1);
      return;
    }

    const storedVoteUuid = storage.getItem("voteUuid");
    if (!storedVoteUuid) {
      console.log("No voteUuid found, skipping WebSocket connection.");
      setStep(1);
      return;
    }

    setVoteUuid(storedVoteUuid); // Set voteUuid state

    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    const client = new Client({
      brokerURL: `wss://${process.env.API_URL}/ws/votes`,
      debug: (msg) => console.log(msg),
      reconnectDelay: 500000000,
      onConnect: () => {
        console.log("WebSocket connected successfully");
        subscribeWebsocket(client);
        setStep(2);
        setConnected(true);
        setError(null);
        clientRef.current = client;
        console.log("client.connected =>", client.connected);
        console.log("프로바이더 내부 clientRef.current =>", clientRef.current.connected);
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
    } catch (error) {
      console.error("WebSocket activation failed:", error);
      setError("Failed to initialize WebSocket");
    }
  };

  const subscribeWebsocket = (client: Client) => {
    const storedVoteUuid = storage.getItem("voteUuid");
    client.publish({
      destination: `/app/vote/connect`,
    });
    client.subscribe(`/user/queue/${storedVoteUuid}/initialResponse`, (message: { body: string }) => {
      console.log("Received: 프로바이더 내부에서 ", JSON.parse(message.body));
      const received = JSON.parse(message.body).previousVotes;
      // console.log("received =>", received);
      setPrevVotes([...received]);
      setVoteLimit(JSON.parse(message.body).voteLimit);
    });
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      console.log("끝??");
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
    <WebSocketContext.Provider
      value={{
        step,
        setStep,
        voteLimit,
        prevVotes,
        voteUuid,
        client: clientRef.current,
        connected,
        error,
        disconnect,
        connectWebSocket,
      }}
    >
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

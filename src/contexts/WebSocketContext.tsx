import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import StorageController from "@/storage/storageController";
import { isVoteExpired } from "@/utils/sessionUtils";

const WebSocketContext = createContext<WebSocketContextType | null>(null);
const storage = new StorageController("session");
export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(0);
  const [prevVotes, setPrevVotes] = useState<PrevVotes[]>([]);
  // const [voteLimit, setVoteLimit] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteUuid, setVoteUuid] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const workerRef = useRef<SharedWorker | null>(null);
  const listenersRef = useRef<ListenersRef>({});
  const voteLimitRef = useRef<number | null>(null);

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

    // const isSharedWorkerSupported = typeof SharedWorker !== "undefined";
    const isSharedWorkerSupported = false;

    if (isSharedWorkerSupported) {
      console.log("sharedWorker 실행");
      const worker = new SharedWorker(new URL("../worker/sharedWorker.js", import.meta.url), { type: "module" });
      worker.port.start();

      worker.port.postMessage({
        type: "INIT",
        payload: {
          apiUrl: process.env.API_URL,
          voteUuid: storedVoteUuid,
        },
      });

      worker.port.onmessage = (e) => {
        const { type, payload } = e.data as BroadcastMsg;

        switch (type) {
          case "CONNECTED":
            setConnected(true);
            setError(null);
            setStep(2);
            console.log("CONNECTED Message received from worker");
            break;
          case "DISCONNECTED":
            setConnected(false);
            break;
          case "INITIAL_RESPONSE":
            setPrevVotes(payload.previousVotes);
            console.log("payload.voteLimit =>", payload.voteLimit);
            voteLimitRef.current = payload.voteLimit;
            // setVoteLimit(payload.voteLimit);
            // setLimited((prev) => ({ ...prev, limited: payload.voteLimit ? "제한" : "무제한" }));
            break;
          case "ERROR":
            setError(payload);
            break;
          case "NEW_OPTION_RECEIVED":
            console.log("새로 추가");
            listenersRef.current.onNewOption?.(payload);
            break;
          case "SOMEONE_VOTED":
            listenersRef.current.onSomeoneVoted?.(payload);
            break;
          case "MY_VOTE_RESULT":
            listenersRef.current.onMyVoteResult?.(payload);
            break;
          case "VOTE_CLOSED":
            listenersRef.current.onVoteClosed?.(payload);
            break;
          case "VOTE_ERROR":
            listenersRef.current.onVoteError?.(payload);
            break;
          default:
            console.warn("Unknown message type:", type);
        }
      };

      workerRef.current = worker;

      return () => {
        worker.port.close();
      };
    } else {
      console.log("sharedWorker 실행 안 됌");
      const client = new Client({
        brokerURL: `wss://${process.env.API_URL}/ws/votes`,
        debug: (msg) => console.log(msg),
        reconnectDelay: 500000000,
        onConnect: () => {
          console.log("WebSocket 연결 완!");
          console.log("voteUuid (세션스토리지)", storage.getItem("voteUuid"));
          subscribeWebsocket(client);
          setStep(2);
          setConnected(true);
          setError(null);
          clientRef.current = client;
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
    }
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      console.log("끝??");
      disconnect();
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

  const subscribeWebsocket = (client: Client) => {
    const storedVoteUuid = storage.getItem("voteUuid");
    client.publish({
      destination: `/app/vote/connect`,
    });
    client.subscribe(`/user/queue/${storedVoteUuid}/initialResponse`, (message: { body: string }) => {
      console.log("Received: 프로바이더 내부에서 ", JSON.parse(message.body));
      const payload: InitialResponse = JSON.parse(message.body);
      // setPrevVotes([...payload.previousVotes]);
      // setVoteLimit(payload.voteLimit);
      voteLimitRef.current = payload.voteLimit;
      listenersRef.current.initialResponse?.(payload);
    });
  };

  const registerListener = <T extends keyof typeof listenersRef.current>(type: T, fn: (payload?: any) => void) => {
    listenersRef.current[type] = fn;
  };

  const contextValue = useMemo(
    () => ({
      step,
      setStep,
      voteLimit: voteLimitRef.current,
      prevVotes,
      voteUuid,
      client: clientRef.current,
      connected,
      error,
      connectWebSocket,
      // sendMessageToWorker,
      workerRef,
      registerListener,
    }),
    [step, prevVotes, voteUuid, connected, error]
  );

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketContextType {
  step: number;
  setStep: any;
  prevVotes: PrevVotes[];
  voteLimit: number | null;
  voteUuid: string | null;
  client: Client | null;
  connected: boolean;
  error: string | null;
  connectWebSocket: () => void; // 새로고침 없이 WebSocket 연결하는 함수 추가
  // sendMessageToWorker: any;
  registerListener?: any;
  workerRef?: React.RefObject<SharedWorker | null>;
}

export type InitialResponse = {
  voteLimit: number;
  voteEndTime: string;
  webSocketSessionId: string;
  previousVotes: PrevVotes[];
};

export type PrevVotes = {
  optionId: number;
  optionName: string;
  voteCount: number;
  voteColor: string;
  isVotedByUser: boolean;
};
export type BroadcastMsg = {
  type: string;
  payload?: any;
};

type ListenersRef = {
  initialResponse?: (payload: InitialResponse) => void;
  onNewOption?: (payload: any) => void;
  onSomeoneVoted?: (payload: any) => void;
  onMyVoteResult?: (payload: any) => void;
  onVoteClosed?: (payload: any) => void;
  onVoteError?: (payload: any) => void;
};

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import StorageController from "@/storage/storageController";
import { isVoteExpired } from "@/utils/sessionUtils";

const WebSocketContext = createContext<WebSocketContextType | null>(null);
const storage = new StorageController("session");

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(0);
  const [voteLimit, setVoteLimit] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const workerRef = useRef<SharedWorker | null>(null);
  const listenersRef = useRef<ListenersRef>({});
  const [eventQueue, setEventQueue] = useState<SubDataUnion[]>([]);
  const [client, setClient] = useState<Client | null | undefined>(null);

  const voteUuid = storage.getItem("voteUuid");
  if (!voteUuid) {
    console.log("No voteUuid found, skipping WebSocket connection.");
    setStep(1);
    return;
  }

  const initializeWebSocket = () => {
    if (isVoteExpired()) {
      console.log("Vote has expired, skipping WebSocket connection.");
      setStep(1);
      return;
    }

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
          voteUuid: voteUuid,
        },
      });

      worker.port.onmessage = (e) => {
        subscribeSharedWebsocket(e.data, {
          onEvent: (event) => setEventQueue((prev) => [...prev, event]),
          onVoteLimit: (limit) => setVoteLimit(limit),
          debug: (label, payload) => console.log(`[${label}]`, payload),
        });
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
          clientRef.current = client;
          setClient(client);
          subscribeGeneralWebSocket(client, {
            onEvent: (event) => setEventQueue((prev) => [...prev, event]),
            onVoteLimit: (limit) => setVoteLimit(limit),
            debug: (label, payload) => console.log(`[${label}]`, payload),
          });
          setStep(2);
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
      } catch (error) {
        console.error("WebSocket activation failed:", error);
        setError("Failed to initialize WebSocket");
      }
    }
  };

  const subscribeSharedWebsocket = (data: BroadcastMsg, handlers: SubscribeHandlers) => {
    const { type, payload } = data;
    const { onEvent, onVoteLimit, debug } = handlers;
    switch (type) {
      case "CONNECTED":
        setStep(2);
        setConnected(true);
        setError(null);
        break;
      case "INITIAL_RESPONSE":
        debug?.("INITIAL_RESPONSE", payload);
        onEvent({ type: "INITIAL_RESPONSE", payload });
        onVoteLimit(payload.voteLimit);
        break;
      case "NEW_OPTION_RECEIVED":
        debug?.("NEW_OPTION_RECEIVED", payload);
        onEvent({ type: "NEW_OPTION_RECEIVED", payload });
        break;
      case "I_VOTED":
        debug?.("I_VOTED", payload);
        onEvent({ type: "I_VOTED", payload });
        break;
      case "SOMEONE_VOTED":
        debug?.("SOMEONE_VOTED", payload);
        onEvent({ type: "SOMEONE_VOTED", payload });
        break;
      case "VOTE_CLOSED":
        debug?.("VOTE_CLOSED", payload);
        onEvent({ type: "VOTE_CLOSED", payload });
        break;
      case "VOTE_ERROR":
        debug?.("VOTE_ERROR", payload);
        onEvent({ type: "VOTE_ERROR", payload });
        break;
      case "DISCONNECTED":
        setConnected(false);
        break;
      case "ERROR":
        setError(payload);
        console.error("STOMP Error:", payload);
        break;
      default:
        console.warn("Unknown message type:", type);
    }
  };

  const subscribeGeneralWebSocket = (client: Client, handlers: SubscribeHandlers) => {
    const { onEvent, onVoteLimit, debug } = handlers;
    client.publish({
      destination: `/app/vote/connect`,
    });
    client.subscribe(`/user/queue/${voteUuid}/initialResponse`, (message: { body: string }) => {
      const payload: InitialResponse = JSON.parse(message.body);
      debug?.("INITIAL_RESPONSE", payload);
      onEvent({ type: "INITIAL_RESPONSE", payload });
      onVoteLimit(payload.voteLimit);
    });
    client.subscribe(`/topic/vote/${voteUuid}/addOption`, (message: { body: string }) => {
      const payload: RecievedMsg = JSON.parse(message.body);
      debug?.("NEW_OPTION_RECEIVED", payload);
      onEvent({ type: "NEW_OPTION_RECEIVED", payload });
    });
    client.subscribe(`/user/queue/vote/${voteUuid}`, (message: { body: string }) => {
      const payload: VotedEvent<"me"> = JSON.parse(message.body);
      debug?.("I_VOTED", payload);
      onEvent({ type: "I_VOTED", payload });
    });
    client.subscribe(`/topic/vote/${voteUuid}`, (message: { body: string }) => {
      const payload: VotedEvent<"someone"> = JSON.parse(message.body);
      debug?.("SOMEONE_VOTED", payload);
      onEvent({ type: "SOMEONE_VOTED", payload });
    });
    client.subscribe(`/user/queue/errors`, (message: { body: string }) => {
      const payload = JSON.parse(message.body);
      debug?.("VOTE_ERROR", payload);
      onEvent({ type: "VOTE_ERROR", payload });
    });
    client.subscribe(`/topic/vote/${voteUuid}/closed`, (message: { body: string }) => {
      const payload = JSON.parse(message.body);
      debug?.("VOTE_CLOSED", payload);
      onEvent({ type: "VOTE_CLOSED", payload });
    });
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      console.log("끝??");
      disconnect();
    };
  }, []); // 처음 마운트될 때 한 번만 실행

  const disconnect = () => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
      setError(null);
    }
  };

  const registerListener = <T extends keyof typeof listenersRef.current>(type: T, fn: (payload?: any) => void) => {
    listenersRef.current[type] = fn;
  };

  const contextValue = useMemo(
    () => ({
      step,
      setStep,
      eventQueue,
      setEventQueue,
      voteLimit,
      voteUuid,
      client: client,
      connected,
      error,
      connectWebSocket: initializeWebSocket,
      // sendMessageToWorker,
      workerRef,
      registerListener,
    }),
    [step, connected, error, voteLimit, eventQueue]
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
  eventQueue: SubDataUnion[];
  setEventQueue: React.Dispatch<React.SetStateAction<SubDataUnion[]>>;
  voteLimit: number | null;
  voteUuid: string | null;
  client: Client | null | undefined;
  connected: boolean;
  error: string | null;
  connectWebSocket: () => void; // 새로고침 없이 WebSocket 연결하는 함수 추가
  // sendMessageToWorker: any;
  registerListener?: any;
  workerRef?: React.RefObject<SharedWorker | null>;
}

type SubscribeHandlers = {
  onEvent: (event: SubDataUnion) => void;
  onVoteLimit: (limit: number | null) => void;
  debug?: (label: string, payload: any) => void;
};

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

export type RecievedMsg = {
  optionId: number;
  optionName: string;
  voteColor: string;
};

export type VotedByMe = {
  type: "me";
  isSuccess: boolean;
  message: string;
  result: {
    isCreator: boolean;
    totalVoteCount: number;
    changedOption: ChangedOption;
  };
};

export type VotedBySomeone = {
  type: "someone";
  changedOption: ChangedOption;
};

type ChangedOption = {
  optionId: string;
  optionName: string;
  voteCount: number;
  voteColor: string;
  isVotedByUser?: boolean;
};

export type VotedEvent<T extends "me" | "someone"> = T extends "me"
  ? VotedByMe & { changedOption: never }
  : VotedBySomeone & { result: never };

export type BroadcastMsg = {
  type: string;
  payload?: any;
};

export type SubType =
  | "INITIAL_RESPONSE"
  | "NEW_OPTION_RECEIVED"
  | "I_VOTED"
  | "SOMEONE_VOTED"
  | "VOTE_CLOSED"
  | "VOTE_ERROR";

type SubPayloadMap = {
  INITIAL_RESPONSE: InitialResponse;
  NEW_OPTION_RECEIVED: RecievedMsg;
  I_VOTED: VotedEvent<"me">;
  SOMEONE_VOTED: VotedEvent<"someone">;
  VOTE_CLOSED: any;
  VOTE_ERROR: any;
};

export type SubData<T extends SubType> = {
  type: T;
  payload: SubPayloadMap[T];
};

export type SubDataUnion = {
  [K in SubType]: SubData<K>;
}[SubType];

type ListenersRef = {
  initialResponse?: (payload: InitialResponse) => void;
  onNewOption?: (payload: any) => void;
  onSomeoneVoted?: (payload: any) => void;
  onMyVoteResult?: (payload: any) => void;
  onVoteClosed?: (payload: any) => void;
  onVoteError?: (payload: any) => void;
};

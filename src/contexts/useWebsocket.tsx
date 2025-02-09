import { useEffect, useRef, createContext, useContext } from "react";
import { Client, IStompSocket } from "@stomp/stompjs";
import { atom, useRecoilState } from "recoil";
import SockJS from "sockjs-client";
import useVoteId from "@/hooks/useVoteId";
import StorageController from "@/storage/storageController";

const webSocketState = atom({
  key: "webSocketState",
  default: {
    client: null as Client | null,
    connected: false,
    error: null as string | null,
  },
});

const storage = new StorageController("session");
const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useRecoilState(webSocketState);
  const stompClientRef = useRef<Client | null>(null);
  const { voteId } = useVoteId();

  useEffect(() => {
    const storedConnected = storage.getItem("wsConnected");

    if (storedConnected === "true" && state.connected) {
      console.log("✅ WebSocket already connected. Skipping reconnection.");
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = `${process.env.API_URL}/ws/votes`;
        return new SockJS(wsUrl, null, { transports: ["websocket"] }) as IStompSocket;
      },
      reconnectDelay: 100000,
      connectHeaders: {
        voteUuid: String(voteId),
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("✅ WebSocket connected successfully");
        storage.setItem("wsConnected", "true");
        setState((prev) => ({ ...prev, client, connected: true, error: null }));
      },
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame);
        setState((prev) => ({ ...prev, error: `STOMP Error: ${frame.headers?.message || "Unknown error"}` }));
      },
      onWebSocketClose: () => {
        console.log("⚠️ WebSocket connection closed.");
        storage.removeItem("wsConnected");
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
        stompClientRef.current = null;
        storage.removeItem("wsConnected");
        setState((prev) => ({ ...prev, client: null, connected: false }));
      }
    };
  }, []);

  const disconnect = () => {
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      storage.removeItem("wsConnected");
      setState((prev) => ({ ...prev, client: null, connected: false }));
    }
  };

  return <WebSocketContext.Provider value={{ ...state, disconnect }}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
};

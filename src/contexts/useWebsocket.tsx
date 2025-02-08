import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { Client, IStompSocket } from "@stomp/stompjs";
import { useParams } from "react-router-dom";
import SockJS from "sockjs-client";

interface WebSocketState {
  client: Client | null;
  connected: boolean;
  error: string | null;
  disconnect: () => void;
}

type WebSocketAction =
  | { type: "CONNECT"; client: Client }
  | { type: "DISCONNECT" }
  | { type: "SET_ERROR"; error: string };

const WebSocketContext = createContext<WebSocketState | null>(null);

const webSocketReducer = (state: WebSocketState, action: WebSocketAction): WebSocketState => {
  switch (action.type) {
    case "CONNECT":
      return { ...state, client: action.client, connected: true, error: null };
    case "DISCONNECT":
      return { ...state, client: null, connected: false };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(webSocketReducer, {
    client: null,
    connected: false,
    error: null,
    disconnect: () => {},
  });

  const stompClientRef = useRef<Client | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = `${process.env.API_URL}/ws/votes`;
        const socket = new SockJS(wsUrl, null, {
          transports: ["websocket"],
        }) as IStompSocket;

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          dispatch({ type: "SET_ERROR", error: "Connection error occurred. Attempting to reconnect..." });
        };

        return socket;
      },

      reconnectDelay: 100000,
      connectHeaders: {
        voteUuid: String(id),
      },
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.log(str);
        }
      },
      onConnect: () => {
        console.log("WebSocket connected successfully");
        dispatch({ type: "CONNECT", client });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        dispatch({ type: "SET_ERROR", error: `STOMP Error: ${frame.headers?.message || "Unknown error"}` });
      },
      onWebSocketClose: () => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
      },
    });

    try {
      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("Failed to activate STOMP client:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to initialize WebSocket connection" });
    }

    return () => {
      if (client.active) {
        client.deactivate();
        stompClientRef.current = null;
        dispatch({ type: "DISCONNECT" });
      }
    };
  }, []);

  const disconnect = () => {
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      dispatch({ type: "DISCONNECT" });
    }
  };

  return <WebSocketContext.Provider value={{ ...state, disconnect }}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return {
    client: context.client,
    connected: context.connected,
    error: context.error,
    disconnect: context.disconnect,
  };
};

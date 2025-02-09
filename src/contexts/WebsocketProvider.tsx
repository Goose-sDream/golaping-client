import { createContext, useContext } from "react";
import { Client } from "@stomp/stompjs";
import useWebSocket from "@/hooks/useWebsocket";

interface WebSocketContextType {
  client: Client | null;
  connected: boolean;
  error: string | null;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const webSocket = useWebSocket();

  return <WebSocketContext.Provider value={webSocket}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

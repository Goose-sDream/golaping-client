import { useEffect, useRef } from "react";
import { Client, IStompSocket } from "@stomp/stompjs";
import { useRecoilState } from "recoil";
import SockJS from "sockjs-client";
import { webSocketState } from "@/atoms/websocketAtom";
import StorageController from "@/storage/storageController";

const storage = new StorageController("session");

export const useWebSocket = (voteId: string) => {
  const [state, setState] = useRecoilState(webSocketState);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (storage.getItem("wsConnected") === "true") {
      console.log("Already connected, skipping initialization");
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = `${process.env.API_URL}/ws/votes`;
        const socket = new SockJS(wsUrl, null, { transports: ["websocket"] }) as IStompSocket;

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          setState((prev) => ({ ...prev, error: "Connection error occurred." }));
        };

        return socket;
      },
      reconnectDelay: 100000,
      connectHeaders: { voteUuid: voteId },
      debug: (str) => process.env.NODE_ENV === "development" && console.log(str),
      onConnect: () => {
        console.log("WebSocket connected successfully");
        setState({ client, connected: true, error: null });
        storage.setItem("wsConnected", "true");
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
        setState((prev) => ({ ...prev, error: `STOMP Error: ${frame.headers?.message || "Unknown error"}` }));
      },
      onWebSocketClose: () => {
        console.log("WebSocket connection closed.");
        storage.removeItem("wsConnected");
      },
    });

    try {
      client.activate();
      stompClientRef.current = client;
    } catch (error) {
      console.error("Failed to activate STOMP client:", error);
      setState((prev) => ({ ...prev, error: "Failed to initialize WebSocket" }));
    }

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setState({ client: null, connected: false, error: null });
      storage.removeItem("wsConnected");
    };
  }, [voteId]);

  const disconnect = () => {
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setState({ client: null, connected: false, error: null });
      storage.removeItem("wsConnected");
    }
  };

  return { client: state.client, connected: state.connected, error: state.error, disconnect };
};

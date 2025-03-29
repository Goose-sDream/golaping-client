import { Client } from "@stomp/stompjs";

const globalSelf = self as unknown as SharedWorkerGlobalScope;

let client: Client | null = null;
const ports: MessagePort[] = [];

globalSelf.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  ports.push(port);
  port.start();

  port.onmessage = (e) => {
    const { type, payload } = e.data;

    if (type === "INIT") {
      connectStomp(payload.apiUrl, payload.voteUuid);
    }

    if (type === "SEND") {
      client?.publish({
        destination: payload.destination,
        body: JSON.stringify(payload.body),
      });
    }
  };
};

const connectStomp = (apiUrl: string, voteUuid: string) => {
  if (client) return;

  client = new Client({
    brokerURL: `wss://${apiUrl}/ws/votes`,
    reconnectDelay: 5000,

    onConnect: () => {
      broadcast({ type: "CONNECTED" });

      client?.subscribe(`user/queue/${voteUuid}/initialResponse`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({
          type: "VOTE_DATA",
          payload: {
            previousVotes: body.previousVotes,
            voteLimit: body.voteLimit,
          },
        });
      });
      client?.publish({
        destination: `app/vote/connect`,
      });
    },

    onWebSocketClose: () => {
      broadcast({ type: "DISCONNECTED" });
      client = null;
    },

    onStompError: (frame) => {
      broadcast({ type: "ERROR", payload: frame.headers["message"] });
    },
  });

  client.activate();
};

const broadcast = (messageObj: BroadcastMsg) => {
  ports.forEach((port) => port.postMessage(messageObj));
};

export type BroadcastMsg = {
  type: string;
  payload?: any;
};

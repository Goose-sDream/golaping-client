/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js");
let client = null;
const ports = [];

self.onconnect = (e) => {
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

const connectStomp = (apiUrl, voteUuid) => {
  if (client) return;

  client = new self.StompJs.Client({
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
  console.log("STOMP client created:", client);

  client.activate();
};

const broadcast = (messageObj) => {
  ports.forEach((port) => port.postMessage(messageObj));
};

// self.onconnect = function (e) {
//   const port = e.ports[0];
//   port.start();

//   port.postMessage({ type: "CONNECTED" });
// };

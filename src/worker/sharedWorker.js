/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js");
let client = null;
const ports = [];
let isConnected = false;

console.log("[SharedWorker] New instance created!", Date.now());

self.onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);
  port.start();

  port.onmessage = (e) => {
    const { type, payload } = e.data;
    console.log("[Worker] Received message:", type, payload);
    switch (type) {
      case "INIT":
        connectStomp(payload.apiUrl, payload.voteUuid);
        break;
      case "SEND":
        if (!isConnected) {
          console.log("WebSocket not connected yet, dropping message");
          return;
        }
        client?.publish({
          destination: payload.destination,
          body: JSON.stringify(payload.body),
        });
        break;
      case "VOTE":
        if (!isConnected) {
          console.log("WebSocket not connected yet, dropping message");
          return;
        }
        client.publish({
          destination: payload.destination,
          body: JSON.stringify(payload.body),
        });
        break;
      case "CLOSE":
        if (!isConnected) {
          console.log("WebSocket not connected yet, dropping message");
          return;
        }
        client.publish({
          destination: payload.destination,
        });
        break;
    }
  };
};

const connectStomp = (apiUrl, voteUuid) => {
  if (client) return;

  client = new self.StompJs.Client({
    brokerURL: `wss://${apiUrl}/ws/votes`,
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true;

      broadcast({ type: "CONNECTED" });

      console.log("voteUuid =>", voteUuid);

      // ✅ 서버에 연결 알림
      client?.publish({
        destination: `/app/vote/connect`,
      });
      // ✅ 1. 초기 투표 데이터 구독
      client?.subscribe(`/user/queue/${voteUuid}/initialResponse`, (message) => {
        const body = JSON.parse(message.body);
        console.log("초기데이터 body =>", body);
        broadcast({
          type: "INITIAL_RESPONSE",
          payload: {
            previousVotes: body.previousVotes,
            voteLimit: body.voteLimit,
          },
        });
      });

      // ✅ 2. 새 옵션 추가 이벤트 구독
      client?.subscribe(`/topic/vote/${voteUuid}/addOption`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({
          type: "NEW_OPTION_RECEIVED",
          payload: body,
        });
      });

      // 3. 누가 투표했을 때
      client?.subscribe(`/topic/vote/${voteUuid}`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "SOMEONE_VOTED", payload: body });
      });

      // 4. 내가 투표했을 때 결과
      client?.subscribe(`/user/queue/vote/${voteUuid}`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "MY_VOTE_RESULT", payload: body });
      });

      // 5. 에러 응답
      client?.subscribe(`/user/queue/errors`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "VOTE_ERROR", payload: body });
      });

      // 6. 투표 종료
      client?.subscribe(`/topic/vote/${voteUuid}/closed`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "VOTE_CLOSED", payload: body });
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

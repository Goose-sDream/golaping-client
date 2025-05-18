/* eslint-disable no-undef */
importScripts("https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js");
let client = null;
const ports = [];
let isConnected = false;
let previousVotes,
  votedOptions = [];

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
  commonVoteUuid = voteUuid;
  console.log("안들어오나");
  if (client) return;

  console.log("들어오나");
  client = new self.StompJs.Client({
    brokerURL: `wss://${apiUrl}/ws/votes`,
    reconnectDelay: 5000,

    onConnect: () => {
      isConnected = true;
      broadcast({ type: "CONNECTED" });
      console.log("[Worker] WebSocket connected");
      // ✅ 서버에 연결 알림
      client.publish({
        destination: `/app/vote/connect`,
      });
      console.log("[Worker] Publishing /app/vote/connect...", voteUuid);

      // ✅ 1. 초기 투표 데이터 구독
      client.subscribe(`/user/queue/${voteUuid}/initialResponse`, (message) => {
        const body = JSON.parse(message.body);
        console.log("왜 안나와");
        voteLimit = body.voteLimit;
        previousVotes = body.previousVotes;
        broadcast({
          type: "INITIAL_RESPONSE",
          payload: {
            previousVotes: body.previousVotes,
            voteLimit: body.voteLimit,
          },
        });
      });

      // ✅ 2. 새 옵션 추가 이벤트 구독
      client.subscribe(`/topic/vote/${voteUuid}/addOption`, (message) => {
        const body = JSON.parse(message.body);
        previousVotes.push({
          optionId: body.optionId,
          optionName: body.optionName,
          voteColor: body.voteColor,
          voteCount: 0,
          isVotedByUser: false,
        });
        console.log("<쉐어드> 새로 추가된 prev =>", previousVotes);
        broadcast({
          type: "NEW_OPTION_RECEIVED",
          payload: body,
        });
      });

      // 3. 누가 투표했을 때 구독
      client.subscribe(`/topic/vote/${voteUuid}`, (message) => {
        const body = JSON.parse(message.body);
        previousVotes = previousVotes.map((prev) => {
          return prev.optionId === body.changedOption.optionId
            ? { ...prev, voteCount: body.changedOption.voteCount }
            : prev;
        });
        console.log("<쉐어드> 누가 투표하고 난 뒤 prev =>", previousVotes);
        broadcast({ type: "SOMEONE_VOTED", payload: body });
      });

      // 4. 내가 투표했을 때 결과 구독
      client.subscribe(`/user/queue/vote/${voteUuid}`, (message) => {
        const body = JSON.parse(message.body);
        votedOptions = [...new Set([...votedOptions, body.result.changedOption.optionId])];
        console.log("<쉐어드> 내가 투표한 optionId들 =>", votedOptions);
        broadcast({ type: "I_VOTED", payload: body });
      });

      // 5. 에러 응답 구독
      client.subscribe(`/user/queue/errors`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "VOTE_ERROR", payload: body });
      });

      // 6. 투표 종료 구독
      client.subscribe(`/topic/vote/${voteUuid}/closed`, (message) => {
        const body = JSON.parse(message.body);
        broadcast({ type: "VOTE_CLOSED", payload: body });
        previousVotes = [];
        votedOptions = [];
        if (isConnected && client) {
          console.log("이전 client 있어");
          // 기존 client를 먼저 종료
          client.deactivate(); // or client.forceDisconnect(), depending on your STOMP version
          client = null;
          isConnected = false;
        }
      });
    },

    onWebSocketClose: () => {
      broadcast({ type: "DISCONNECTED" });
      isConnected = false;
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

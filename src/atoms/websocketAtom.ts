import { Client } from "@stomp/stompjs";
import { atom } from "recoil";

export const webSocketState = atom<{ client: Client | null; connected: boolean; error: string | null }>({
  key: "webSocketState",
  default: { client: null, connected: false, error: null },
});

export interface Vote {
  title: string;
  nickname: string;
  type: "MAJORITY" | "RANDOM";
  hour: number;
  minute: number;
  userVoteLimit: number;
  link: string;
}

export type ModalState = {
  elementId: string;
  isOpen: boolean;
  type: string;
  title: "";
  content: "";
  onFunc: undefined;
  offFunc: undefined;
};

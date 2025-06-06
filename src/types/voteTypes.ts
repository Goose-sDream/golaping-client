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
  title: any;
  content: any;

  onFunc?: (() => void) | undefined; // 모달이 열리기 전에 선행될 함수
  offFunc?: (() => void) | undefined; // 모달 닫을 때 선행될 함수
};

export interface InputStyleProps {
  width?: string;
  textAlign?: string;
  pointerEvents?: string;
  padding?: string;
  flexDirection?: string;
  fontSize?: string;
  fontWeight?: string;
  minHeight?: string;
  labelDisplay?: string;
  labelMarginBottom?: string;
  labelAlignItems?: string;

  errMsgMarginTop?: string;
}

export interface ShareVoteProps {
  randomLink: string;
  title: string;
}

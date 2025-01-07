export interface Vote {
  title: string;
  nickname: string;
  options: "majority" | "random" | "lottery";
  // 시간, 횟수
}

export interface Vote {
  title: string;
  nickname: string;
  options: "majority" | "random" | "lottery";
  hour: number;
  minute: number;
  voteNums: number;
  // 시간, 횟수
}

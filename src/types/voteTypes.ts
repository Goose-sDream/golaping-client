export interface Vote {
  title: string;
  nickname: string;
  options: "majority" | "random" | "lottery";
  time: number;
  voteNums: number;
  // 시간, 횟수
}

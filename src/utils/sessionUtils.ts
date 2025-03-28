import StorageController from "@/storage/storageController";

const storage = new StorageController("session");

const removeItems = (keys: string[]) => {
  keys.forEach((key) => storage.removeItem(key));
};

export const getVoteEndTime = (): number | null => {
  const voteEndTime = storage.getItem("voteEndTime");
  return voteEndTime ? new Date(voteEndTime).getTime() : null;
};

export const isVoteExpired = (): boolean => {
  const endTime = getVoteEndTime();
  return endTime ? (Date.now() >= endTime ? true : false) : true;
};

// 세션 초기화 로직 (투표 시간 만료 여부에 따라)
export const clearSession = (onPurpose: boolean = false) => {
  const voteEndTime = storage.getItem("voteEndTime");

  // 만약 투표 시간이 없으면 바로 종료
  if (!voteEndTime) {
    return;
  }

  const endTime = new Date(voteEndTime).getTime();
  if (onPurpose || Date.now() >= endTime) {
    // 투표 시간이 만료되었거나 사용자가 의도적으로 초기화한 경우
    removeItems(["voteUuid", "voteEndTime"]);
    console.log("세션을 초기화했습니다.");

    // 만약 시간 만료 후 초기화하는 경우, 시간을 기다리는 로직
    if (!onPurpose && Date.now() < endTime) {
      setTimeout(() => {
        removeItems(["voteUuid", "voteEndTime"]);
        console.log("투표 시간이 만료되어 세션을 초기화했습니다.");
      }, endTime - Date.now());
    }
  }
};

import StorageController from "@/storage/storageController";

const storage = new StorageController("session");

const removeItems = (keys: string[]) => {
  keys.forEach((key) => {
    storage.removeItem(key);
  });
};

export const clearSessionOnRefresh = () => {
  const voteEndTime = storage.getItem("voteEndTime");
  if (voteEndTime) {
    const endTime = new Date(voteEndTime).getTime();
    if (Date.now() >= endTime) {
      removeItems(["nickname", "voteUuid", "voteEndTime"]);
      console.log("투표 시간이 만료되어 세션을 초기화했습니다.");
    } else {
      setTimeout(() => {
        removeItems(["nickname", "voteUuid", "voteEndTime"]);
        console.log("투표 시간이 만료되어 세션을 초기화했습니다.");
      }, endTime - Date.now());
    }
  }
};

export const clearSessionOnPurpose = () => {
  removeItems(["nickname", "voteUuid", "voteEndTime"]);
  console.log("사용자가 세션을 초기화했습니다.");
};

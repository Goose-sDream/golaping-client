import StorageController from "@/storage/storageController";

const storage = new StorageController("session");

export const clearSessionOnRefresh = () => {
  const voteEndTime = storage.getItem("voteEndTime");
  if (voteEndTime) {
    const endTime = new Date(voteEndTime).getTime();
    if (Date.now() >= endTime) {
      storage.clear();
      console.log("투표 시간이 만료되어 세션을 초기화했습니다.");
    } else {
      setTimeout(() => {
        storage.clear();
        console.log("투표 시간이 종료되어 세션을 초기화했습니다.");
      }, endTime - Date.now());
    }
  }
};

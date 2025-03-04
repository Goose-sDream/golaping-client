import MakeCandidate from "@/components/vote/MakeCandidate";

const TestPage = () => {
  // const setModalState = useSetRecoilState(modalState);
  // const openModal = () => {
  //   setModalState({
  //     elementId: "modal",
  //     isOpen: true,
  //     type: "alert",
  //     title: "알림",
  //     content: "투표가 종료되었습니다.",
  //     offFunc: () => console.log("모달이 닫혔습니다."),
  //   });
  // };
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <MakeCandidate />
    </div>
  );
};

export default TestPage;

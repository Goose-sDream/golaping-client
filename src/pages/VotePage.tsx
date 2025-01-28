import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { modalState } from "@/atoms/voteAtom";
import useSessionId from "@/hooks/useSessionId";
import useWebsocketUrl from "@/hooks/useWebsocketUrl";

const VotePage = () => {
  const { id } = useParams();
  const [{ isOpen }, setModalState] = useRecoilState(modalState);
  const { websocketUrl } = useWebsocketUrl();
  const { sessionId } = useSessionId();

  console.log("websocket", websocketUrl, "sessionid", sessionId);

  console.log("isOpen =>", isOpen);
  return (
    <div>
      <h2>투표 id: {id}</h2>
      <button onClick={() => setModalState((prev) => ({ ...prev, isOpen: true }))}>테스트</button>
    </div>
  );
};

export default VotePage;

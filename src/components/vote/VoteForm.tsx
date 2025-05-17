import { JSX, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import DoVote from "./DoVote";
import EnterVote from "./EnterVote";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { getStorage } from "@/util";
import { clearSession, isVoteExpired } from "@/utils/sessionUtils";

const VoteForm = () => {
  const { step } = useWebSocket();
  const navigate = useNavigate();
  const storage = getStorage();
  const voteUuid = storage.getItem("voteUuid");

  useEffect(() => {
    if (voteUuid) {
      const intervalId = setInterval(() => {
        if (isVoteExpired()) {
          clearSession();
          clearInterval(intervalId); // 한 번 실행된 후 더 이상 체크할 필요 없으므로 정리
          navigate(`/votes/${voteUuid}/results`);
        }
        console.log("check vote expired");
      }, 1000); // 1초마다 실행

      return () => {
        clearInterval(intervalId);
      }; // 컴포넌트 언마운트 시 정리
    }
  }, []);

  const steps: { [key: number]: JSX.Element } = {
    1: <EnterVote />,
    2: <DoVote />,
  };
  return <Wrapper>{steps[step]}</Wrapper>;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default VoteForm;

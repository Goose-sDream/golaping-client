import { JSX, useEffect } from "react";
import styled from "styled-components";
import EnterVote from "./EnterVote";
import MakeCandidate from "./MakeCandidate";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { clearSessionOnRefresh } from "@/utils/sessionUtils";

const VoteForm = () => {
  const { step } = useWebSocket();

  useEffect(() => {
    clearSessionOnRefresh();
  }, []);

  const steps: { [key: number]: JSX.Element } = {
    1: <EnterVote />,
    2: <MakeCandidate />,
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

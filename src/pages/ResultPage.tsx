import styled from "styled-components";
import VoteResults from "@/components/vote/VoteResults";

const ResultPage = () => {
  return (
    <ResultContainer>
      <VoteResults />
    </ResultContainer>
  );
};

export default ResultPage;

const ResultContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

import styled from "styled-components";
import Hourglass from "./Hourglass";
import VoteIcon from "@/assets/Vote.svg";

interface VoteInfoProps {
  voteEndTime: string;
  totalVoteCount: number | null;
  voteLimit: number | null;
}

const VoteInfo = ({ voteEndTime, totalVoteCount, voteLimit }: VoteInfoProps) => {
  return (
    <Container>
      <VoteIcon width="1.3rem" height="1.7rem" />
      {voteLimit ? (
        <Title>
          {totalVoteCount}/{voteLimit}
        </Title>
      ) : (
        <Title>무제한</Title>
      )}
      <Hourglass voteEndTime={voteEndTime} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: black;
  padding: 10px;
  border-radius: 15px;
  width: fit-content;
  gap: 6px;
`;

const Title = styled.h1`
  font-size: 18px;
  color: white;
`;

export default VoteInfo;

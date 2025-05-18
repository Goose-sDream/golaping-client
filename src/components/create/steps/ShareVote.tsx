import styled from "styled-components";
import GreenLogo from "@/assets/GreenLogo.svg";
import CopyButton from "@/components/common/CopyButton";
import { ShareVoteProps } from "@/types/voteTypes";

const ShareVote = ({ randomLink, title }: ShareVoteProps) => {
  return (
    <Wrapper>
      <Title>투표가 생성되었습니다!{"\n"}투표를 공유해보세요!</Title>
      <CopyButton randomLink={randomLink} title={title} />
      <GreenLogo />
    </Wrapper>
  );
};

export default ShareVote;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  height: 30vh;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: pre-line;
`;

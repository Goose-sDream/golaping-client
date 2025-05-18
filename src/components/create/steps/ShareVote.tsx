import styled from "styled-components";
import GreenLogo from "@/assets/GreenLogo.svg";
import LinkIcon from "@/assets/Link.svg";

interface ShareVoteProps {
  randomLink: string;
  title: string;
}

const ShareVote = ({ randomLink, title }: ShareVoteProps) => {
  const handleCopy = () => {
    const fullUrl = `${window.location.origin}/${randomLink}/${title}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };

  return (
    <Wrapper>
      <Title>투표가 생성되었습니다!{"\n"}투표를 공유해보세요!</Title>
      <LinkButton type="button" onClick={handleCopy}>
        <LinkIcon />
      </LinkButton>
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

const LinkButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

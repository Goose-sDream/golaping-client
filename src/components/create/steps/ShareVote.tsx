import styled from "styled-components";
import GreenLogo from "@/assets/GreenLogo.svg";
import LinkIcon from "@/assets/Link.svg";

interface ShareVoteProps {
  randomLink: string;
}

const ShareVote = ({ randomLink }: ShareVoteProps) => {
  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${randomLink}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };

  return (
    <RedirectForm>
      <header>
        <h2 style={{ whiteSpace: "pre-line", textAlign: "center" }}>
          투표가 생성되었습니다!{"\n"}투표를 공유해보세요!
        </h2>
        <LinkButton type="button" onClick={handleCopy}>
          <LinkIcon />
        </LinkButton>
      </header>

      <main>
        <LogoWrapper>
          <GreenLogo />
        </LogoWrapper>
      </main>
    </RedirectForm>
  );
};

export default ShareVote;

const RedirectForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 100%;
  overflow: hidden;

  header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    min-height: 40%;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 60%;
  }
`;

const LinkButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LogoWrapper = styled.div`
  overflow: hidden;

  svg {
    object-fit: cover;
  }
`;

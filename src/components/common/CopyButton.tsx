import styled from "styled-components";
import LinkIcon from "@/assets/Link.svg";
import { ShareVoteProps } from "@/types/voteTypes";

const CopyButton = ({ randomLink, title }: ShareVoteProps) => {
  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${randomLink}/${title}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };
  return (
    <LinkButton type="button" onClick={handleCopy}>
      <LinkIcon />
    </LinkButton>
  );
};

export default CopyButton;

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

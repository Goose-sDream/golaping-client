import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const CreateNShareVote = () => {
  const [randomLink, setRandomLink] = useState("");
  const navigate = useNavigate();

  const generateLink = () => {
    const randomId = uuid();
    const link = `/vote/${randomId}`;
    setRandomLink(link);
    return link;
  };

  const handleNavigate = () => {
    const link = generateLink();
    navigate(link);
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${randomLink}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };

  return (
    <div>
      <h2 style={{ whiteSpace: "pre-line" }}>투표 생성이 완료되었습니다. {"\n"}투표를 공유해보세요!</h2>
      <button onClick={handleNavigate}>투표화면으로 이동하기</button>
      <button onClick={handleCopy}>공유하기</button>
    </div>
  );
};

export default CreateNShareVote;

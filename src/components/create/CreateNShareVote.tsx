import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

const CreateNShareVote = () => {
  const [randomLink, setRandomLink] = useState("");
  const navigate = useNavigate();

  const generateLink = () => {
    const link = `/vote/${uuid()}`;
    setRandomLink(link);
    return link;
  };

  const handleNavigate = () => {
    if (randomLink) {
      navigate(randomLink);
    } else {
      const link = generateLink();
      navigate(link);
    }
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${generateLink()}`;
    console.log("fullUrl =>", fullUrl);
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => alert("링크가 클립보드에 복사되었습니다!"))
      .catch((err) => alert(`복사 실패! ${err}`));
  };

  return (
    <div>
      <h2 style={{ whiteSpace: "pre-line" }}>투표생성이 완료되었습니다. {"\n"}투표를 공유해보세요!</h2>
      {/* 스타일 변경 예정이라 styled-component 미완 */}
      <button onClick={handleNavigate}>투표화면으로 이동하기</button>
      <button onClick={handleCopy}>공유하기</button>
    </div>
  );
};

export default CreateNShareVote;

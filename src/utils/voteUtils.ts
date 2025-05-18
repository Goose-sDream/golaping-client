export const handleCopy = () => {
  const fullUrl = `${window.location.href}`;
  console.log("fullUrl =>", fullUrl);
  navigator.clipboard
    .writeText(fullUrl)
    .then(() => alert("링크가 클립보드에 복사되었습니다!"))
    .catch((err) => alert(`복사 실패! ${err}`));
};

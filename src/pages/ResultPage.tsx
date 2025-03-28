import VoteResults from "@/components/vote/VoteResults";

const ResultPage = () => {
  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <VoteResults />
    </div>
  );
};

export default ResultPage;

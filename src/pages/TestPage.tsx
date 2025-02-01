import DoVote from "@/components/vote/DoVote";

const TestPage = () => {
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
      <DoVote />
    </div>
  );
};

export default TestPage;

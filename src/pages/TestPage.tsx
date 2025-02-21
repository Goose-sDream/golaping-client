import MakeCandidate from "@/components/vote/MakeCandidate";

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
      <MakeCandidate />
    </div>
  );
};

export default TestPage;

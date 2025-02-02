// import DoVote from "@/components/vote/DoVote";
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
      {/* <DoVote /> */}
      <MakeCandidate />
    </div>
  );
};

export default TestPage;

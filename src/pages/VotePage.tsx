import VoteForm from "@/components/vote/VoteForm";

const VotePage = () => {
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
      <VoteForm />
    </div>
  );
};

export default VotePage;

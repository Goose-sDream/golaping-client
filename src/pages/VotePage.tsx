import VoteForm from "@/components/vote/VoteForm";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

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
      <WebSocketProvider>
        <VoteForm />
      </WebSocketProvider>
    </div>
  );
};

export default VotePage;

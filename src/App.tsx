import React from "react";
import CreateNShareVote from "./components/create/CreateNShareVote";
import VoteOptions from "./components/create/VoteOptions";

const App: React.FC = () => {
  return (
    <div>
      <VoteOptions />
      <CreateNShareVote />
    </div>
  );
};

export default App;

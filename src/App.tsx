import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateNShareVote from "./components/create/CreateNShareVote";
import VoteOptions from "./components/create/VoteOptions";
import VotePage from "./pages/VotePage";

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <div>
          <VoteOptions />
        </div>
        <Routes>
          <Route path="/" element={<CreateNShareVote />}></Route>
          <Route path="/vote/:id" element={<VotePage />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

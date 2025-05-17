import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Modal from "./components/common/modal/Modal";
import CreatePage from "./pages/CreatePage";
import ResultPage from "./pages/ResultPage";
import VotePage from "./pages/VotePage";
import GlobalStyle from "./styles/GlobalStyle";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <div id="modal"></div>
      <Modal />
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CreatePage />}></Route>
          <Route path="/votes/:id/:title" element={<VotePage />}></Route>
          <Route path="/votes/:id/results" element={<ResultPage />}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;

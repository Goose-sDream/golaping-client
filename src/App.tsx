import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Modal from "./components/common/modal/Modal";
import CreatePage from "./pages/CreatePage";
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
          <Route path="/votes/:id" element={<VotePage />}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;

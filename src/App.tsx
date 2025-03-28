import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Modal from "./components/common/modal/Modal";
import CreatePage from "./pages/CreatePage";
import ResultPage from "./pages/ResultPage";
import TestPage from "./pages/TestPage";
import VotePage from "./pages/VotePage";
import GlobalStyle from "./styles/GlobalStyle";

const App: React.FC = () => {
  console.log("API URL:", process.env.API_URL);
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
          <Route path="/test" element={<TestPage />}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default App;

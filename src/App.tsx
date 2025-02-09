import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Modal from "./components/common/modal/Modal";
import CreatePage from "./pages/CreatePage";
import TestPage from "./pages/TestPage";
import VotePage from "./pages/VotePage";
import GlobalStyle from "./styles/GlobalStyle";
import { WebSocketProvider } from "@/contexts/WebSocketContext";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <div id="modal"></div>
      <Modal />
      <GlobalStyle />
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CreatePage />}></Route>
            <Route path="/votes/:id" element={<VotePage />}></Route>
            <Route path="/test" element={<TestPage />}></Route>
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </RecoilRoot>
  );
};

export default App;

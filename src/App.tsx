import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RecoilRoot } from "recoil";
import CreatePage from "./pages/CreatePage";
import VotePage from "./pages/VotePage";
import GlobalStyle from "./styles/GlobalStyle";

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <GlobalStyle />
      <div id="root"></div>
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

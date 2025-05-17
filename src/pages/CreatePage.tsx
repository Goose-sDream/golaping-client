import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CreateForm } from "@/components/create/CreateForm";
import { getStorage } from "@/util";

const CreatePage = () => {
  const isSharedWorkerSupported = typeof SharedWorker !== "undefined";
  const storage = getStorage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSharedWorkerSupported) {
      const voteUuid = storage.getItem("voteUuid");
      const title = storage.getItem("voteTitle");
      navigate(`votes/${voteUuid}/${title}`);
    }
  }, []);

  return (
    <CreateFormContainer>
      <CreateForm />
    </CreateFormContainer>
  );
};

export default CreatePage;

const CreateFormContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

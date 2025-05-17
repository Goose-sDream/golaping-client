import styled from "styled-components";
import { CreateForm } from "@/components/create/CreateForm";

const CreatePage = () => {
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

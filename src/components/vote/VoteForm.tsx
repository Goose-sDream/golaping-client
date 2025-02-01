import { JSX, useState } from "react";
import styled from "styled-components";
import EnterVote from "./EnterVote";

const VoteForm = () => {
  const [step, setStep] = useState<number>(1);

  const steps: { [key: number]: JSX.Element } = {
    1: <EnterVote setStep={setStep} />,
  };
  return <Wrapper>{steps[step]}</Wrapper>;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default VoteForm;

import { JSX, useEffect, useState } from "react";
import styled from "styled-components";
import EnterVote from "./EnterVote";
import { clearSessionOnRefresh } from "@/utils/sessionUtils";

const VoteForm = () => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    clearSessionOnRefresh();
  }, []);

  const steps: { [key: number]: JSX.Element } = {
    1: <EnterVote setStep={setStep} />,
    2: <div>Step 2</div>,
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

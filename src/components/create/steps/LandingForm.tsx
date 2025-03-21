import styled from "styled-components";
import LogoWithText from "./LogoWithText";

const LandingForm = () => {
  return (
    <Wrapper>
      <Title>골라핑</Title>
      <LogoContainer>
        <LogoWithText text={`골라핑은 여러분의${"\n"}선택을 도와주는${"\n"}투표 서비스입니다`} />
      </LogoContainer>
    </Wrapper>
  );
};

export default LandingForm;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  height: 20vh;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoContainer = styled.div`
  flex: 1;
  width: 100%;
`;

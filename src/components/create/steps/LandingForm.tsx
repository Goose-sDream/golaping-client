import styled from "styled-components";
import PurpleLogo from "@/assets/PurpleLogo.svg";

const LandingForm = () => {
  return (
    <Wrapper>
      <header>
        <h1>골라핑</h1>
      </header>
      <main>
        <LogoWrapper>
          <LogoText>
            골라핑은 여러분의<br></br>선택을 도와주는<br></br>투표 서비스입니다
          </LogoText>
          <PurpleLogo />
        </LogoWrapper>
      </main>
    </Wrapper>
  );
};

export default LandingForm;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    min-height: 25%;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 75%;
  }
`;

const LogoText = styled.p`
  position: fixed;
  font-size: 24px;
  color: black;
  text-align: center;
  width: 200px;
  height: auto;
  left: 60%;
  top: 34%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;
`;

const LogoWrapper = styled.div`
  overflow: hidden;

  svg {
    object-fit: cover;
  }
`;

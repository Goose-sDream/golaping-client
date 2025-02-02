import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, Mouse, World, Bodies, MouseConstraint, Runner, Events, Body } from "matter-js";
import styled, { keyframes } from "styled-components";
import { LIGHTGRAY } from "@/styles/color";

const MakeCandidate = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef(Engine.create());
  const world = engineRef.current.world;
  const renderRef = useRef<Render | null>(null);
  const candidatesRef = useRef<Body[]>([]);
  const textDataRef = useRef<{ [key: string]: string }>({}); // ✅ 텍스트 데이터를 useRef로 변경
  const inputRef = useRef<HTMLInputElement | null>(null);
  // const currentEditBallRef = useRef<Body | null>(null); // ✅ 현재 편집 중인 원 관리

  const [inputText, setInputText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

  const smallRadius = 80;

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = engineRef.current;
    engine.gravity.y = 0;

    const runner = Runner.create();
    const render = Render.create({
      element: containerRef.current,
      engine,
      options: {
        width: 800,
        height: 600,
        background: "#fff",
        wireframes: false,
      },
    });

    renderRef.current = render;

    const walls = [
      Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
      Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
      Bodies.rectangle(0, 300, 50, 600, { isStatic: true }),
      Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    ];
    World.add(world, walls);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.02, damping: 0.1, render: { visible: false } },
    });

    World.add(world, mouseConstraint);

    // ✅ 빈 공간을 클릭하면 모달 표시 + 클릭 위치 저장
    Events.on(mouseConstraint, "mousedown", (event) => {
      const { mouse } = event.source;
      const clickX = mouse.position.x;
      const clickY = mouse.position.y;

      // ✅ 기존 원과 겹치는지 확인
      const isOverlapping = candidatesRef.current.some((ball) => {
        const dx = clickX - ball.position.x;
        const dy = clickY - ball.position.y;
        return Math.sqrt(dx * dx + dy * dy) < smallRadius;
      });

      if (!isOverlapping) {
        setPendingPosition({ x: clickX, y: clickY });
        setModalVisible(true);
      }
    });

    Events.on(mouseConstraint, "mouseup", () => {
      if (mouseConstraint.constraint.bodyB) {
        mouseConstraint.constraint.bodyB = null;
      }
    });

    // ✅ Matter.js의 afterRender를 활용하여 원 위에 텍스트를 지속적으로 업데이트
    Events.on(render, "afterRender", () => {
      if (!renderRef.current) return;
      const context = renderRef.current.context;

      context.font = "16px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";

      candidatesRef.current.forEach((ball) => {
        const text = textDataRef.current[ball.id.toString()] || "";
        if (text) {
          context.fillText(text, ball.position.x, ball.position.y);
        }
      });
    });

    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  // ✅ 입력한 텍스트를 원과 함께 생성하는 함수
  const createBallWithText = () => {
    if (!pendingPosition || inputText.trim() === "" || inputText.length > 5) {
      inputRef.current?.classList.add("shake");
      setTimeout(() => inputRef.current?.classList.remove("shake"), 400); // 0.4초 후 제거
      return;
    }

    console.log("생성할 위치:", pendingPosition, "입력된 텍스트:", inputText);

    const { x, y } = pendingPosition;
    const newBall = Bodies.circle(x, y, smallRadius, {
      restitution: 0.8,
      frictionAir: 0.02,
      render: { fillStyle: LIGHTGRAY },
    });

    World.add(world, newBall);
    candidatesRef.current.push(newBall);

    // ✅ 원의 ID를 키로 텍스트 저장 (useRef 사용)
    textDataRef.current[newBall.id.toString()] = inputText;

    // ✅ 입력 후 초기화
    setInputText("");
    setModalVisible(false);
    setPendingPosition(null);
  };

  const closeCandidateModal = () => {
    setModalVisible(false);
  };

  const candidateModalRef = useRef<HTMLDivElement | null>(null);
  const modalAnimationRef = useRef<number | null>(null);

  const requestModalAnimation = () => {
    if (modalAnimationRef.current) {
      cancelAnimationFrame(modalAnimationRef.current);
    }
    requestAnimationFrame(() => {
      if (!candidateModalRef.current) return;
      if (modalVisible) {
        candidateModalRef.current.style.transform = "translate(-50%, -80%)";
        candidateModalRef.current.style.opacity = "1";
        candidateModalRef.current.style.transition = "transform 0.5s ease-in-out";
      }
    });
  };

  useEffect(() => {
    requestModalAnimation();
  }, [modalVisible]);

  return (
    <StyledSection ref={containerRef}>
      {/* ✅ 모달 UI */}
      {modalVisible && (
        <ModalWrapper ref={candidateModalRef}>
          <ModalContent>
            <h3>텍스트 입력</h3>
            <StyledInput
              autoFocus
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="텍스트를 입력하세요"
            />
            {inputText.trim().length < 1 ? (
              <p style={{ fontSize: "10px", color: "red" }}>최소 1글자 이상이어야 합니다.</p>
            ) : inputText.trim().length > 5 ? (
              <p style={{ fontSize: "10px", color: "red" }}>5글자 이하여야 합니다.</p>
            ) : null}
            <ButtonContainer>
              <Button onClick={createBallWithText}>확인</Button>
              <Button onClick={closeCandidateModal}>취소</Button>
            </ButtonContainer>
          </ModalContent>
        </ModalWrapper>
      )}
    </StyledSection>
  );
};

export default MakeCandidate;

const shake = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-5deg); }
  40% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  80% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;

const StyledSection = styled.section`
  width: 800px;
  height: 600px;
  border: 5px solid black;
  position: relative;
`;

/* ✅ 모달 스타일 */
const ModalWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%); /* 초기 상태: 위쪽 */
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  opacity: 0;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StyledInput = styled.input`
  width: 200px;
  height: 30px;
  font-size: 16px;
  text-align: center;
  border: 1px solid black;
  background-color: #fff;
  &.shake {
    animation: ${shake} 0.4s ease-in-out;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  transition: 0.2s;
  &:hover {
    background-color: #0056b3;
  }
`;

import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, Mouse, World, Bodies, MouseConstraint, Runner, Events, Body } from "matter-js";
import styled, { keyframes } from "styled-components";
import { LIGHTGRAY } from "@/styles/color";

const DoVote = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef(Engine.create());
  const world = engineRef.current.world;
  const candidatesRef = useRef<Body[]>([]);
  const currentEditBallRef = useRef<Body | null>(null); // ✅ 현재 편집 중인 원 관리

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState<{ [key: string]: string }>({});

  const smallRadius = 80;
  const largeRadius = 160;

  // console.log("현재까지 후보들 =>", candidatesRef && candidatesRef.current);
  // console.log("현재 후보 =>", currentEditBallRef && currentEditBallRef.current);
  // console.log("inputVisible =>", inputVisible);

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

    Events.on(mouseConstraint, "mousedown", (event) => {
      const { mouse } = event.source;
      const clickX = mouse.position.x;
      const clickY = mouse.position.y;

      if (currentEditBallRef.current !== null) return; // ✅ 편집 중이면 새로운 원 생성 방지

      const isOverlapping = candidatesRef.current.some((ball) => {
        const dx = clickX - ball.position.x;
        const dy = clickY - ball.position.y;
        return Math.sqrt(dx * dx + dy * dy) < smallRadius;
      });

      if (!isOverlapping) {
        const newCandidate = Bodies.circle(clickX, clickY, smallRadius, {
          restitution: 0.8,
          frictionAir: 0.02,
          render: { fillStyle: LIGHTGRAY },
        });

        World.add(world, newCandidate);
        candidatesRef.current.push(newCandidate);

        Body.scale(newCandidate, largeRadius / smallRadius, largeRadius / smallRadius);

        setInputPosition({ x: clickX, y: clickY });
        setInputVisible(true);
        currentEditBallRef.current = newCandidate;

        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 0);
      }
    });

    Events.on(mouseConstraint, "mouseup", () => {
      if (mouseConstraint.constraint.bodyB) {
        mouseConstraint.constraint.bodyB = null;
      }
    });

    // ✅ Matter.js 렌더링 직전에 텍스트를 그리도록 beforeRender 사용
    Events.on(render, "beforeRender", () => {
      const context = render.context;
      context.clearRect(0, 0, 800, 600); // 캔버스를 지우고 다시 그림
      context.font = "16px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";

      candidatesRef.current.forEach((ball) => {
        const text = inputText[ball.id.toString()] || "";
        context.fillText(text, ball.position.x, ball.position.y);
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

  // // ✅ 원의 위치 변화 감지하여 텍스트도 함께 이동하도록 설정
  // useEffect(() => {
  //   const updatePosition = () => {
  //     if (currentEditBallRef.current) {
  //       setInputPosition((prev) => {
  //         const newX = currentEditBallRef.current!.position.x;
  //         const newY = currentEditBallRef.current!.position.y;
  //         if (prev.x === newX && prev.y === newY) return prev; // 위치 변화 없으면 업데이트 안 함
  //         return { x: newX, y: newY };
  //       });
  //     }

  //     // ✅ 모든 원의 위치를 지속적으로 업데이트하여 입력된 텍스트가 함께 움직이도록 함
  //     candidatesRef.current.forEach((ball) => {
  //       setInputText((prev) => ({
  //         ...prev,
  //         [ball.id.toString()]: prev[ball.id.toString()] || "",
  //       }));
  //     });

  //     animationFrameRef.current = requestAnimationFrame(updatePosition);
  //   };

  //   animationFrameRef.current = requestAnimationFrame(updatePosition);

  //   return () => {
  //     if (animationFrameRef.current !== null) {
  //       cancelAnimationFrame(animationFrameRef.current);
  //     }
  //   };
  // }, []);

  const handleBlur = () => {
    if (currentEditBallRef.current) {
      // if (
      //   (inputRef.current && inputText[currentEditBallRef.current.id.toString()].length < 1) ||
      //   (inputRef.current && inputText[currentEditBallRef.current.id.toString()].length > 5)
      // ) {
      //   inputRef.current.classList.add("shake");
      //   setTimeout(() => inputRef.current?.classList.remove("shake"), 400); // 0.4초 후 제거
      //   return;
      // }

      const id = currentEditBallRef.current.id.toString();
      setInputText((prev) => ({
        ...prev,
        [id]: inputRef.current?.value || "",
      }));

      Body.scale(currentEditBallRef.current, smallRadius / largeRadius, smallRadius / largeRadius);
      setInputVisible(false);
      currentEditBallRef.current = null;
    }
  };

  const handleCancel = () => {
    candidatesRef.current.pop();
    currentEditBallRef.current = null;
    setInputVisible(false);
  };

  return (
    <StyledSection ref={containerRef}>
      {inputVisible && currentEditBallRef.current && (
        <Wrapper $positionx={inputPosition.x} $positiony={inputPosition.y}>
          <InputWrapper>
            <StyledInput
              ref={inputRef}
              value={inputText[currentEditBallRef.current.id.toString()] || ""}
              onChange={(e) => {
                setInputText((prev) => ({
                  ...prev,
                  [currentEditBallRef.current!.id.toString()]: e.target.value,
                }));
              }}
              autoFocus
            />
            <DoneButton onClick={handleBlur}>완료</DoneButton>
            <DoneButton onClick={handleCancel}>취소</DoneButton>
          </InputWrapper>
          {/* {inputText[currentEditBallRef.current.id.toString()].length > 5 && (
            <p style={{ fontSize: "10px", color: "red" }}>5글자 이하여야 합니다.</p>
          )} */}
        </Wrapper>
      )}
      {candidatesRef.current.map((ball) => (
        <Candidates
          key={ball.id}
          $ballx={ball.position.x}
          $bally={ball.position.y}
          $display={currentEditBallRef.current?.id === ball.id}
        >
          {inputText[ball.id.toString()]}
        </Candidates>
      ))}
    </StyledSection>
  );
};

export default DoVote;

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

const Wrapper = styled.div.attrs<{ $positionx: number; $positiony: number }>(({ $positionx, $positiony }) => ({
  style: {
    left: `${$positionx - 100}px`,
    top: `${$positiony - 20}px`,
  },
}))`
  position: absolute;
  height: 40px;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledInput = styled.input`
  width: 100px;
  height: 20px;
  text-align: center;
  font-size: 16px;
  border: 1px solid black;
  background-color: #fff;
  transition: all 0.2s ease;
  &.shake {
    animation: ${shake} 0.4s ease-in-out;
  }
`;

const DoneButton = styled.button`
  padding: 3px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
  }
`;

const Candidates = styled.div.attrs<{ $ballx: number; $bally: number; $display: boolean }>(({ $ballx, $bally }) => ({
  style: {
    left: `${$ballx - 50}px`,
    top: `${$bally - 10}px`,
  },
}))`
  position: absolute;
  width: 100px;
  text-align: center;
  font-size: 16px;
  display: ${({ $display }) => ($display ? "none" : "block")};
  pointer-events: none;
  /* max-height: 50px; // 👈 높이 제한
  overflow: auto; // 👈 넘칠 경우 스크롤 추가
  word-wrap: break-word; // 긴 단어가 있으면 줄바꿈
  white-space: pre-wrap; // 개행 유지 + 자동 줄바꿈 */
  background: rgba(255, 255, 255, 0.8); // 가독성을 위해 반투명 배경 추가
  padding: 5px;
  border-radius: 5px;
`;

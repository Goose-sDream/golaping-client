import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, Mouse, World, Bodies, MouseConstraint, Runner, Events, Body } from "matter-js";
import { useRecoilValue } from "recoil";
import styled, { keyframes } from "styled-components";
import { limitState } from "@/atoms/createAtom";
import {
  BASEGROWTHRATE,
  BASERADIUS,
  MAXRADIUS,
  MINRADIUS,
  SHRINKFACTOR,
  SHRINKTERM,
  SHRINKTHRESHOLD,
} from "@/constants/vote";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { borderMap, optionColorMap, optionColors } from "@/styles/color";

type TargetBall = { count: number; ball: Body; text: string };
type NewBall = { coordinates: { x: number; y: number }; count: number; color: string; text: string };
type UsedPercentage = { percentage: number; time: number; count: number };

type OptionObj = {
  optionText: string;
  optionColor: string;
};

const MakeCandidate = () => {
  const { client, prevVotes, voteUuid, connected, connectWebSocket } = useWebSocket();
  const { limited } = useRecoilValue(limitState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef(Engine.create());
  const world = engineRef.current.world;
  const renderRef = useRef<Render | null>(null);
  const candidatesRef = useRef<TargetBall[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mouseConstraintRef = useRef<MouseConstraint | null>(null);
  const usedPercentageRef = useRef<UsedPercentage>({
    percentage: 0,
    time: 0,
    count: 0,
  });
  const usedColorRef = useRef<string[]>([]);
  const selectedOptionRef = useRef<Body[]>([]);

  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isAnimating = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("connected =>", connected);
    if (!connected) {
      console.log("재연결");
      connectWebSocket();
    }
    subscribeNewOption();
  }, [connected]);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = engineRef.current;
    engine.gravity.y = 0;

    const runner = Runner.create();
    const render = Render.create({
      element: containerRef.current,
      engine,
      options: {
        background: "#fff",
        wireframes: false,
      },
    });

    // 벽 세우기
    const walls = [
      Bodies.rectangle(400, 0, 800, 50, {
        isStatic: true,
        ...(limited === "무제한" && { collisionFilter: { category: 0x0008 } }),
      }),
      Bodies.rectangle(400, 600, 800, 50, {
        isStatic: true,
        ...(limited === "무제한" && { collisionFilter: { category: 0x0008 } }),
      }),
      Bodies.rectangle(0, 300, 50, 600, {
        isStatic: true,
        ...(limited === "무제한" && { collisionFilter: { category: 0x0008 } }),
      }),
      Bodies.rectangle(800, 300, 50, 600, {
        isStatic: true,
        ...(limited === "무제한" && { collisionFilter: { category: 0x0008 } }),
      }),
    ];
    World.add(world, walls);

    if (prevVotes.length > 0) {
      renderPrevBalls();
    }

    renderRef.current = render;
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.02, damping: 0.1, render: { visible: false } },
    });

    World.add(world, mouseConstraint);
    mouseConstraintRef.current = mouseConstraint;

    console.log("candidatesRef =>", candidatesRef.current);
    // ✅ 빈 공간을 클릭하면 모달 표시 + 클릭 위치 저장
    Events.on(mouseConstraint, "mousedown", (event) => {
      const { mouse } = event.source;
      const clickX = mouse.position.x;
      const clickY = mouse.position.y;

      // 기존 원과 겹치는지 확인
      const overlapInfo = candidatesRef.current.reduce<{ isOverLapping: boolean; targetId: number | null }>(
        (acc, cur, i) => {
          const dx = clickX - cur.ball.position.x;
          const dy = clickY - cur.ball.position.y;
          if (Math.sqrt(dx * dx + dy * dy) < BASERADIUS) {
            acc.isOverLapping = true;
            acc.targetId = i;
          }
          return acc;
        },
        { isOverLapping: false, targetId: null }
      );

      const { isOverLapping, targetId } = overlapInfo;
      if (!isOverLapping || targetId === null) {
        setPendingPosition({ x: clickX, y: clickY });
        setModalVisible(true);
      } else {
        // 원 클릭하면
        const targetBall = candidatesRef.current[targetId];
        updateCount(targetBall);
        chooseBorderColor(targetBall.ball);
        updateBallBorder(targetBall.ball);
        updateBallsize();
        updateZoom();
        // console.log("candidatesRef.current =>", candidatesRef.current);
      }
    });

    // ✅ 마우스가 벽을 벗어나면 드래그 중지
    Events.on(mouseConstraint, "mousemove", (event) => {
      const { mouse } = event.source;
      const { x, y } = mouse.position;
      // 벽 안쪽 범위 (조정 가능)
      const minX = 50,
        maxX = 750;
      const minY = 50,
        maxY = 550;
      if (x < minX || x > maxX || y < minY || y > maxY) {
        if (mouseConstraint.constraint.bodyB) {
          mouseConstraint.constraint.bodyB = null; // 드래그 해제
        }
        mouseConstraint.mouse.button = -1; // 마우스 버튼 해제 상태로 변경
      }
    });

    // ✅ Matter.js의 afterRender를 활용하여 원 위에 텍스트를 지속적으로 업데이트
    // Matter.js는 본래 물리 객체들만 그리는데, 현재 각 원에 텍스트를 추가하고 싶기에 afterRender로 따로 관리해줘야
    Events.on(render, "afterRender", () => {
      if (!renderRef.current) return;
      const context = renderRef.current.context;

      context.font = "16px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.textBaseline = "middle";

      candidatesRef.current.forEach((candidate) => {
        const text = candidate.text || "";
        const count = candidate.count.toString();
        if (text) {
          context.fillText(`${text} [ ${count} ]`, candidate.ball.position.x, candidate.ball.position.y);
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
  }, [prevVotes]);

  const makeNewBall = (newBallObj: NewBall, ballId?: number) => {
    console.log("생성");
    const {
      coordinates: { x, y },
      count,
      color,
      text,
    } = newBallObj;
    const newBall = Bodies.circle(x, y, BASERADIUS, {
      restitution: 0.8,
      frictionAir: 0.02,
      render: { fillStyle: color },
      ...(limited === "무제한" && {
        // 움직일 수 없게
        collisionFilter: {
          category: 0x0002, // 사용자 정의 원 카테고리 설정
          mask: 0x0002 | 0x0008, // 다른 물체들(벽)과 충돌 가능
        },
      }),
    });
    if (ballId) newBall.id = ballId;
    console.log("newBall =>", newBall);
    World.add(world, newBall);

    candidatesRef.current.push({ count, ball: newBall, text: text });
    return newBall;
  };

  // prevBalls
  const getRandomCoordinates = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const boxWidth = containerRef.current.clientWidth;
    const boxTop = containerRef.current.clientHeight;
    const x = Math.floor(Math.random() * boxWidth);
    const y = Math.floor(Math.random() * boxTop);
    return { x, y };
  };

  const organizeBalls = () => {
    if (!candidatesRef.current) return;
    console.log("prevVotes =>", prevVotes);
    prevVotes.forEach((prev) => {
      if (!candidatesRef.current.some((candidate) => candidate.ball.id === prev.optionId)) {
        console.log("어디보자");
        makeNewBall(
          {
            coordinates: getRandomCoordinates(),
            count: prev.voteCount,
            color: prev.voteColor,
            text: prev.optionName,
          },
          prev.optionId
        );
      }
    });
  };

  const renderPrevBalls = () => {
    organizeBalls();
    updateBallsize();
    updateUsedPercentage();
    updateZoom();
  };

  // ✅ newBall + send
  // 웹소켓으로 생성할 때마다 요청 보내야 함
  const makeNewOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPosition || !inputRef.current) return;
    const inputText = inputRef.current.value.trim();
    if (inputText.trim() === "" || inputText.length > 5) {
      inputRef.current?.classList.add("shake");
      setTimeout(() => inputRef.current?.classList.remove("shake"), 400);
      return;
    }
    // console.log("생성할 위치:", pendingPosition, "입력된 텍스트:", inputText);
    const randomColor = chooseColor();
    const newOptionObj = {
      optionText: inputText,
      optionColor: randomColor,
    };
    // console.log("newOptionObj =>", newOptionObj);
    sendNewOption(newOptionObj);
    if (mouseConstraintRef.current) {
      // "현재 마우스 버튼이 눌려있지 않도록" 인식하게 함
      mouseConstraintRef.current.mouse.button = -1;
    }
    // 입력 후 초기화
    setModalVisible(false);
    setPendingPosition(null);
    updateUsedPercentage();
    updateZoom();
  };

  const sendNewOption = (optionObj: OptionObj) => {
    if (!client?.connected) {
      console.log("websocket is not connected");
      return;
    }
    try {
      client.publish({
        destination: "/app/vote/addOption",
        body: JSON.stringify(optionObj),
      });
    } catch (error) {
      console.error("Failed to send a new message:", error);
    }
  };

  const subscribeNewOption = () => {
    if (!client?.connected) {
      console.log("websocket is not connected");
      return;
    }
    try {
      if (voteUuid) {
        client.subscribe(`/topic/vote/${voteUuid}/addOption`, (message: { body: string }) => {
          console.log("Received: 추가한 뒤 응답", JSON.parse(message.body));
          const { optionId, optionName, voteColor } = JSON.parse(message.body);
          const newBall = {
            coordinates: pendingPosition ?? getRandomCoordinates(),
            color: voteColor,
            count: 0,
            text: optionName,
          };
          makeNewBall(newBall, optionId);
        });
      }
    } catch (error) {
      console.error("Failed to subscribe a new message:", error);
    }
  };

  // "제한"일 때, 클릭 취소 시 count-- 함수
  const updateCount = (targetBall: TargetBall) => {
    if (limited === "제한") {
      if (selectedOptionRef.current.includes(targetBall.ball)) {
        targetBall.count = Math.max(targetBall.count - 1, 0);
        usedPercentageRef.current.count = Math.max(usedPercentageRef.current.count - 1, 0);
      } else {
        targetBall.count++;
      }
    } else {
      targetBall.count++;
    }
  };

  const updateBallsize = () => {
    let totalCircleArea = 0;
    // console.log("candidatesRef =>", candidatesRef.current);
    candidatesRef.current.forEach((candidate) => {
      // console.log("candidate.count =>", candidate.count);
      // console.log("usedPercentageRef.current.count =>", usedPercentageRef.current.count);
      let growthRate = BASEGROWTHRATE; // 투표 수당 증가량
      // 축소 횟수에 따라 성장률 점진적 감소
      growthRate *= Math.pow(SHRINKFACTOR, usedPercentageRef.current.count);
      // console.log("growthRate =>", growthRate);
      const r = candidate.ball.circleRadius || 0;
      // 투표 수에 비례한 반지름
      const newRadius = Math.min(BASERADIUS + candidate.count * growthRate, MAXRADIUS);
      if (candidate.ball.circleRadius !== newRadius) {
        const scaleFactor = newRadius / (candidate.ball.circleRadius || BASERADIUS);
        Body.scale(candidate.ball, scaleFactor, scaleFactor);
      }
      totalCircleArea += r * r * Math.PI;
    });
    updateUsedPercentage(totalCircleArea);
  };

  const updateBallBorder = (targetBall: Body) => {
    if (!selectedOptionRef.current.some((ball) => ball.id === targetBall.id)) {
      selectedOptionRef.current.push(targetBall);
      targetBall.render.lineWidth = 8;
      targetBall.render.strokeStyle = chooseBorderColor(targetBall) || "black";
    } else {
      if (limited === "제한") {
        targetBall.render.lineWidth = 0; // 선택 해제 시 테두리 제거
        selectedOptionRef.current = selectedOptionRef.current.filter((option) => option.id !== targetBall.id);
      }
    }
  };

  const updateUsedPercentage = (totalCircleArea?: number) => {
    if (!renderRef.current) return;
    const render = renderRef.current;
    const canvasWidth = render.options.width || 0;
    const canvasHeight = render.options.height || 0;
    const canvasArea = canvasWidth * canvasHeight;
    const computedTotalCircleArea =
      totalCircleArea ??
      candidatesRef.current.reduce((acc, cur) => {
        const r = cur.ball.circleRadius || 0;
        return acc + Math.PI * r * r;
      }, 0);
    usedPercentageRef.current.percentage = computedTotalCircleArea / canvasArea;
    console.log("사용된 면적 비율=>", usedPercentageRef.current.percentage.toFixed(2));
  };

  const updateZoom = () => {
    const now = Date.now();
    if (now - usedPercentageRef.current.time < SHRINKTERM) return;
    if (usedPercentageRef.current.percentage > SHRINKTHRESHOLD) {
      // console.log("면적 비율 초과! 축소 실행");
      candidatesRef.current.forEach((candidate) => {
        if (candidate.ball.circleRadius && candidate.ball.circleRadius > MINRADIUS) {
          Body.scale(candidate.ball, SHRINKFACTOR, SHRINKFACTOR);
        }
      });
      updateUsedPercentage();
      usedPercentageRef.current.count += 1;
      usedPercentageRef.current.time = now;
    }
  };

  const chooseColor = () => {
    if (!usedColorRef.current) return "black";
    // 모든 색이 사용된 경우, 더 이상 선택할 색이 없음
    if (usedColorRef.current.length >= optionColors.length) {
      usedColorRef.current = [];
    }
    let randomIdx;
    do {
      randomIdx = Math.floor(Math.random() * optionColors.length);
    } while (usedColorRef.current.includes(optionColors[randomIdx]));

    usedColorRef.current.push(optionColors[randomIdx]);
    return optionColors[randomIdx];
  };

  const chooseBorderColor = (targetBall: Body) => {
    const targetColor = targetBall.render.fillStyle;
    if (!targetColor) return;
    for (const [key, value] of optionColorMap) {
      if (value.includes(targetColor)) {
        return borderMap.get(key);
      }
    }
  };

  // 모달
  const candidateModalRef = useRef<HTMLDivElement | null>(null);
  const modalAnimationRef = useRef<number | null>(null);

  const closeCandidateModal = () => {
    if (!candidateModalRef.current || isAnimating.current) return;

    isAnimating.current = true;
    let opacity = 1;

    const fadeOut = () => {
      if (!candidateModalRef.current) return;
      if (modalAnimationRef.current) {
        cancelAnimationFrame(modalAnimationRef.current);
      }
      opacity -= 0.05;
      candidateModalRef.current.style.opacity = `${opacity}`;
      candidateModalRef.current.style.transform = `translate(-50%, ${-30 + opacity * 20}%)`;

      if (opacity > 0) {
        modalAnimationRef.current = requestAnimationFrame(fadeOut);
      } else {
        isAnimating.current = false;
        setModalVisible(false);
        setError(null);
      }
    };

    modalAnimationRef.current = requestAnimationFrame(fadeOut);
  };

  const requestModalAnimation = () => {
    if (modalAnimationRef.current) {
      cancelAnimationFrame(modalAnimationRef.current);
    }
    modalAnimationRef.current = requestAnimationFrame(() => {
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
      {modalVisible && (
        <ModalWrapper ref={candidateModalRef}>
          <ModalContent>
            <h3>텍스트 입력</h3>
            <StyledForm onSubmit={makeNewOption}>
              <StyledInput ref={inputRef} autoFocus placeholder="텍스트를 입력하세요" />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <ButtonContainer>
                <Button type="submit">확인</Button>
                <Button type="button" onClick={closeCandidateModal}>
                  취소
                </Button>
              </ButtonContainer>
            </StyledForm>
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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
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
  justify-content: center;
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
const ErrorMessage = styled.p`
  font-size: 10px;
  color: red;
  margin-top: 5px;
`;

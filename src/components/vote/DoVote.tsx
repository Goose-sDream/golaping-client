import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, Mouse, World, Bodies, MouseConstraint, Runner, Events, Body } from "matter-js";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import VoteInfo from "./VoteInfo";
import {
  BASEGROWTHRATE,
  BASERADIUS,
  MAXRADIUS,
  MINRADIUS,
  SHRINKFACTOR,
  SHRINKTERM,
  SHRINKTHRESHOLD,
} from "@/constants/vote";
import { InitialResponse, RecievedMsg, SubDataUnion, useWebSocket, VotedEvent } from "@/contexts/WebSocketContext";
import StorageController from "@/storage/storageController";
import { borderMap, optionColorMap, optionColors, PURPLE } from "@/styles/color";

const storage = new StorageController("session");
const voteEndTime = storage.getItem("voteEndTime");

const DoVote = () => {
  const navigate = useNavigate();

  const {
    client,
    eventQueue,
    setEventQueue,
    voteLimit,
    voteUuid,
    connected,
    connectWebSocket,
    workerRef,
    // registerListener,
  } = useWebSocket();
  const afterUpdateHandlerRef = useRef<((e: Matter.IEvent<Engine>) => void) | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef(Engine.create());
  const world = engineRef.current.world;
  const renderRef = useRef<Render | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const candidatesRef = useRef<TargetBall[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mouseConstraintRef = useRef<MouseConstraint | null>(null);
  const usedPercentageRef = useRef<UsedPercentage>({
    percentage: 0,
    time: 0,
    count: 0,
  });
  const usedColorRef = useRef<string[]>([]);
  const [totalVoteCount, setTotalVoteCount] = useState(0);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isAnimating = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workerRef?.current) return;
    console.log("connected =>", connected);
    console.log("client.connected =>", client?.connected);

    if (!connected) {
      console.log("재연결");
      connectWebSocket();
    }
  }, [connected]);

  // useEffect(() => {
  //   if (!workerRef?.current) return;
  //   // sharedWorker 사용 시
  //   console.log("connected =>", connected);
  //   console.log("client.connected =>", client?.connected);
  //   if (!connected) {
  //     console.log("재연결");
  //     connectWebSocket();
  //   }

  //   if (workerRef?.current && connected && containerRef.current) {
  //     console.log("[SAFE] subscribeAll 호출!");
  //     subscribeAll();
  //   }
  // }, [workerRef?.current, connected, containerRef.current]);
  useEffect(() => {
    if (eventQueue.length === 0) return;
    console.log("구독액션 시작!!");
    onSubscribeAction();
    setEventQueue((prev) => prev.slice(1));
  }, [eventQueue]);

  const setMatterJs = (initialResponse: InitialResponse) => {
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

    runnerRef.current = runner;
    renderRef.current = render;

    initMatterJsEngine(initialResponse);

    return () => {
      cleanupMatterJsEngine(runner);
    };
  };

  const initMatterJsEngine = (payload: InitialResponse) => {
    const { previousVotes } = payload;
    if (renderRef.current && runnerRef.current) {
      World.add(world, makeWalls());

      const mouse = Mouse.create(renderRef.current.canvas);
      const mouseConstraint = MouseConstraint.create(engineRef.current, {
        mouse,
        constraint: { stiffness: 0.02, damping: 0.1, render: { visible: false } },
      });

      World.add(world, mouseConstraint);
      mouseConstraintRef.current = mouseConstraint;

      // ✅ 빈 공간을 클릭하면 모달 표시 + 클릭 위치 저장
      Events.on(mouseConstraint, "mousedown", (event) => {
        const { mouse } = event.source;
        checkOverLapping(mouse.position.x, mouse.position.y, makeOrVote);
      });

      // ✅ 마우스가 벽을 벗어나면 드래그 중지
      Events.on(mouseConstraint, "mousemove", (event) => {
        handleMouseConstraints(mouseConstraint, event);
      });

      // ✅ Matter.js의 afterRender를 활용하여 원 위에 텍스트를 지속적으로 업데이트
      // Matter.js는 본래 물리 객체들만 그리는데, 현재 각 원에 텍스트를 추가하고 싶기에 afterRender로 따로 관리해줘야
      Events.on(renderRef.current, "afterRender", () => {
        handleFillText();
      });

      Runner.run(runnerRef.current, engineRef.current);
      Render.run(renderRef.current);
      afterUpdateHandler(payload);

      afterUpdateHandlerRef.current = () => {
        renderPrevBalls(payload);
        setTotalVoteCount(previousVotes.reduce((count, item) => (item.isVotedByUser ? count + 1 : count), 0));
        Events.off(engineRef.current, "afterUpdate", afterUpdateHandlerRef.current!);
      };

      Events.on(engineRef.current, "afterUpdate", afterUpdateHandlerRef.current!);
    }
  };

  const afterUpdateHandler = (payload: InitialResponse) => {
    const { previousVotes } = payload;
    if (previousVotes.length > 0) {
      console.log("afterUpdate 타이밍, prevVotes 렌더 시작");
      renderPrevBalls(payload);
      setTotalVoteCount(previousVotes.reduce((count, item) => (item.isVotedByUser ? count + 1 : count), 0));
    }
    // ✅ 딱 한 번만 실행하고, 핸들러 등록 해제
    Events.off(engineRef.current, "afterUpdate", afterUpdateHandler);
  };

  const cleanupMatterJsEngine = (runner: Runner) => {
    if (renderRef.current) {
      Render.stop(renderRef.current);
      renderRef.current.canvas.remove();
      renderRef.current.textures = {};
    }

    if (engineRef.current) {
      Runner.stop(runner ?? Runner.create()); // 혹시라도 runner 참조가 없다면
      Engine.clear(engineRef.current);
    }

    // 이벤트 해제
    Events.off(engineRef.current, "afterUpdate"); // 핸들러 직접 넘기지 않아도 전체 해제 가능
  };

  const makeWalls = () => {
    const rentangleInfo = [
      [400, 0, 800, 20],
      [400, 600, 800, 20],
      [0, 300, 20, 600],
      [800, 300, 20, 600],
    ];

    return rentangleInfo.map((info) => {
      const [x, y, width, height] = info;
      return makeSingleWall(x, y, width, height);
    });
  };

  const makeSingleWall = (x: number, y: number, width: number, height: number) => {
    return Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      render: {
        fillStyle: PURPLE, // 빨간색
        strokeStyle: PURPLE, // 테두리 색 (선택)
        lineWidth: 2, // 테두리 두께 (선택)
      },
      collisionFilter: {
        category: 0x0008, // ✅ 벽은 무조건 0x0008
        mask: 0x0001 | 0x0002, // ✅ Ball 제한/무제한 둘 다와 충돌 가능
      },
    });
  };

  const checkOverLapping = (
    clickX: number,
    clickY: number,
    callback: (clickX: number, clickY: number, isOverLapping: boolean, targetId: number | null) => void
  ) => {
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
    callback(clickX, clickY, overlapInfo.isOverLapping, overlapInfo.targetId);
    return overlapInfo;
  };

  const makeOrVote = (clickX: number, clickY: number, isOverLapping: boolean, targetId: number | null) => {
    if (!isOverLapping || targetId === null) {
      setPendingPosition({ x: clickX, y: clickY });
      setModalVisible(true);
    } else {
      // 원 클릭하면
      const targetBall = candidatesRef.current[targetId];
      publishVoteCount(targetBall);
      // subscribeVoted();
    }
  };

  const handleMouseConstraints = (mouseConstraint: MouseConstraint, event: Matter.IMouseEvent<MouseConstraint>) => {
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
  };

  const makeNewBall = (newBallObj: NewBall, ballId: number, Bordered: boolean, isLimited: boolean) => {
    const {
      coordinates: { x, y },
      count,
      color,
      text,
    } = newBallObj;

    console.log("isLimited =>", isLimited);

    const newBall = Bodies.circle(x, y, BASERADIUS, {
      restitution: 0.8,
      render: {
        fillStyle: color,
        lineWidth: Bordered ? 8 : 0,
        strokeStyle: Bordered ? chooseBorderColor(color) || "black" : "",
      },
      collisionFilter: {
        category: isLimited ? 0x0001 : 0x0002, // ✅ 제한이면 드래그 가능 (0x0001), 무제한이면 드래그 불가 (0x0002)
        mask: isLimited ? 0x0001 | 0x0008 : 0x0002 | 0x0008, // ✅  충돌 허용
      },
    });
    if (ballId) newBall.id = ballId;
    World.add(world, newBall);

    candidatesRef.current.push({ count, ball: newBall, text: text });
    return newBall;
  };

  const handleFillText = () => {
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
  };

  // prevBalls
  const getRandomCoordinates = () => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const boxWidth = containerRef.current.clientWidth;
    const boxTop = containerRef.current.clientHeight;
    const margin = BASERADIUS; // 공 반지름만큼 여유

    const x = Math.random() * (boxWidth - margin * 2) + margin;
    const y = Math.random() * (boxTop - margin * 2) + margin;

    return { x, y };
  };

  const organizeBalls = (payload: InitialResponse) => {
    const { previousVotes: prevVotes, voteLimit } = payload;
    if (!candidatesRef.current) return;
    const selectedBall = storage.getItem(`${voteUuid}`);
    console.log("selectedBall =>", selectedBall);
    const parsedBalls = selectedBall ? JSON.parse(selectedBall) : [];
    console.log("parsedBalls =>", parsedBalls);
    prevVotes.forEach((prev) => {
      if (!candidatesRef.current.some((candidate) => candidate.ball.id === prev.optionId)) {
        const alreadyBordered = parsedBalls.some((id: number) => id === prev.optionId);
        console.log("alreadyBordered =>", alreadyBordered);
        makeNewBall(
          {
            coordinates: getRandomCoordinates(),
            count: prev.voteCount,
            color: prev.voteColor,
            text: prev.optionName,
          },
          prev.optionId,
          alreadyBordered,
          voteLimit !== null
        );
      }
    });
  };

  const renderPrevBalls = (payload: InitialResponse) => {
    organizeBalls(payload);
    updateBallsize();
    updateUsedPercentage();
    updateZoom();
  };

  const renderCountedBalls = (targetBall: TargetBall, voteCount: number) => {
    const { ball } = targetBall;
    updateCount(ball, voteCount);
    updateBallsize();
    updateZoom();
  };

  // 웹소켓 요청
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
    const randomColor = chooseColor();
    const newOptionObj = {
      optionText: inputText,
      optionColor: randomColor,
    };
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

  // 투표 publish
  const sendMessageToWorker = (type: string, destination: string, body?: any) => {
    if (workerRef?.current) {
      workerRef?.current.port.postMessage({
        type,
        payload: {
          destination,
          body,
        },
      });
    }
  };

  const sendNewOption = (optionObj: OptionObj) => {
    try {
      if (workerRef?.current) {
        sendMessageToWorker("SEND", "/app/vote/addOption", optionObj);
      } else if (client?.connected) {
        client.publish({
          destination: "/app/vote/addOption",
          body: JSON.stringify(optionObj),
        });
      }
    } catch (error) {
      console.error("Failed to send a new message:", error);
    }
  };

  const publishVoteCount = (targetBall: TargetBall) => {
    const targetOption = {
      optionId: targetBall.ball.id,
    };

    try {
      if (workerRef?.current) {
        sendMessageToWorker("VOTE", "/app/vote", targetOption);
      } else if (client?.connected) {
        if (voteUuid) {
          client.publish({
            destination: "/app/vote",
            body: JSON.stringify(targetOption),
          });
        }
      }
    } catch (error) {
      console.error("Failed to subscribe a new message:", error);
    }
  };

  const publishVoteClose = () => {
    try {
      if (workerRef?.current) {
        sendMessageToWorker("CLOSE", "/app/vote/close");
      } else if (client?.connected) {
        if (voteUuid) {
          client.publish({
            destination: "/app/vote/close",
          });
        }
      }
    } catch (error) {
      console.error("Failed to publish a close message:", error);
    }
  };

  // 구독
  // const subscribeAll = (currentVoteLimit: number | null) => {
  //   subscribeNewOption(currentVoteLimit);
  //   subscribeVoted();
  //   subscribeCloseVote();
  //   subscribeError();
  // };

  const onSubscribeAction = () => {
    const latestEvent = eventQueue[0];
    const { type, payload } = latestEvent as SubDataUnion;

    switch (type) {
      case "INITIAL_RESPONSE":
        setMatterJs(payload);
        break;
      case "NEW_OPTION_RECEIVED":
        onNewOption(payload, voteLimit);
        break;
      case "I_VOTED":
        onMyVote(payload);
        console.log("I_VOTED", "eventQueue =>", eventQueue);
        break;
      case "SOMEONE_VOTED":
        onSomeoneVote(payload);
        console.log("SOMEONE_VOTED");
        break;
      case "VOTE_CLOSED":
        onVoteClose(payload);
        console.log("SOMEONE_VOTED");
        break;
      case "VOTE_ERROR":
        console.warn("VOTE_ERROR", payload);
        break;
      default:
        console.log("default");
    }
  };

  // const subscribeNewOption = (currentVoteLimit: number | null) => {
  //   try {
  //     if (workerRef?.current) {
  //       registerListener("onNewOption", (payload: RecievedMsg) => {
  //         onNewOption(payload, currentVoteLimit);
  //       });
  //     } else if (client?.connected) {
  //       if (voteUuid) {
  //         client.subscribe(`/topic/vote/${voteUuid}/addOption`, (message: { body: string }) => {
  //           console.log("Received: 추가한 뒤 응답", JSON.parse(message.body));
  //           onNewOption(JSON.parse(message.body), voteLimit);
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to subscribe a new message:", error);
  //   }
  // };

  const onNewOption = (payload: RecievedMsg, currentVoteLimit: number | null) => {
    const { optionId, optionName, voteColor } = payload;
    const newBall = {
      coordinates: pendingPosition ?? getRandomCoordinates(),
      color: voteColor,
      count: 0,
      text: optionName,
    };
    console.log("voteLimittted =>", currentVoteLimit);
    makeNewBall(newBall, optionId, false, currentVoteLimit !== null);
  };

  // 투표 카운트 구독
  // const subscribeVoted = () => {
  //   try {
  //     let countedBall: TargetBall | undefined;
  //     if (workerRef?.current) {
  //       registerListener("onSomeoneVoted", (payload: VotedEvent<"someone">) => {
  //         countedBall = onSomeoneVote(payload);
  //       });
  //       registerListener("onMyVoteResult", (payload: VotedEvent<"me">) => {
  //         if (countedBall) onMyVote(payload, countedBall);
  //       });
  //     } else if (client?.connected) {
  //       if (voteUuid) {
  //         client.subscribe(`/topic/vote/${voteUuid}`, (message: { body: string }) => {
  //           countedBall = onSomeoneVote(JSON.parse(message.body));
  //         });
  //         client.subscribe(`/user/queue/vote/${voteUuid}`, (message: { body: string }) => {
  //           if (countedBall) onMyVote(JSON.parse(message.body), countedBall);
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to subscribe a voted message:", error);
  //   }
  // };

  const onSomeoneVote = (payload: VotedEvent<"someone">) => {
    const {
      changedOption: { optionId, voteCount },
    } = payload;
    const countedBall = candidatesRef.current.find((candidate) => candidate.ball.id === Number(optionId));
    if (countedBall) renderCountedBalls(countedBall, voteCount);
  };

  const onMyVote = (payload: VotedEvent<"me">) => {
    const {
      result: {
        totalVoteCount,
        changedOption: { isVotedByUser, optionId },
      },
    } = payload;
    const countedBall = candidatesRef.current.find((candidate) => candidate.ball.id === Number(optionId));
    updateBallBorder(countedBall as TargetBall, isVotedByUser ?? false);
    setTotalVoteCount(totalVoteCount);
  };

  // const subscribeCloseVote = () => {
  //   try {
  //     if (workerRef?.current) {
  //       registerListener("onVoteClosed", (payload: any) => {
  //         onVoteClose(payload);
  //       });
  //     } else if (client?.connected) {
  //       if (voteUuid) {
  //         client.subscribe(`/topic/vote/${voteUuid}/closed`, (message: { body: string }) => {
  //           console.log("Received: 투표 종료 응답", JSON.parse(message.body));
  //           onVoteClose(message.body);
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to subscribe a close message:", error);
  //   }
  // };

  const onVoteClose = (payload: any) => {
    storage.setItem("voteData", payload);
    navigate(`/votes/${voteUuid}/results`);
  };

  // const subscribeError = () => {
  //   if (workerRef?.current) {
  //     registerListener("onVoteError", (payload: any) => {
  //       console.error("에러 수신:", payload);
  //       setError("투표 중 문제가 발생했어요.");
  //     });
  //   } else if (client?.connected) {
  //     client.subscribe(`/user/queue/errors`, (message: { body: string }) => {
  //       console.log("message =>", message);
  //       console.log("Received: 투표한 뒤 에러", JSON.parse(message.body));
  //     });
  //   }
  // };

  // 투표 UI
  const updateCount = (ball: Body, voteCount: number) => {
    candidatesRef.current.map((candidate) => {
      if (candidate.ball.id === ball.id) {
        candidate.count = voteCount;
      }
    });
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

  // 보더
  const updateBorder = (ball: Body, isVotedByUser: boolean) => {
    ball.render.lineWidth = isVotedByUser ? 8 : 0;
    ball.render.strokeStyle = isVotedByUser ? chooseBorderColor(ball) || "black" : "";
  };

  const updateBallBorder = (targetBall: TargetBall, isVotedByUser: boolean) => {
    const { ball } = targetBall;
    console.log("업데이트 보더", "voteLimit =>", voteLimit, "isVotedByUser =>", isVotedByUser);
    const selectedBall = storage.getItem(`${voteUuid}`);
    const parsedBalls: number[] = selectedBall ? JSON.parse(selectedBall) : [];
    if (voteLimit !== null) {
      updateBorder(ball, isVotedByUser);
      if (isVotedByUser) {
        // 투표 시
        console.log("들어오나요");
        parsedBalls.push(ball.id);
        storage.setItem(`${voteUuid}`, JSON.stringify([...new Set(parsedBalls)]));
      } else {
        // 투표 해제 시
        const renewedBalls = parsedBalls.filter((id: number) => id !== ball.id);
        storage.setItem(`${voteUuid}`, JSON.stringify(renewedBalls));
      }
    } else {
      // 무제한일 때
      if (isVotedByUser) {
        if (!parsedBalls.some((id: number) => id === ball.id)) {
          // 새로 투표하는 애면
          ball.render.lineWidth = 8;
          ball.render.strokeStyle = chooseBorderColor(ball) || "black";
          parsedBalls.push(ball.id);
          storage.setItem(`${voteUuid}`, JSON.stringify([...new Set(parsedBalls)]));
        }
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
    // console.log("사용된 면적 비율=>", usedPercentageRef.current.percentage.toFixed(2));
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

  const chooseBorderColor = (targetBallOrColor: Body | string) => {
    const targetColor = typeof targetBallOrColor === "string" ? targetBallOrColor : targetBallOrColor.render.fillStyle;
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
      <HeaderSection>
        <VoteInfo voteEndTime={voteEndTime!} voteLimit={voteLimit} totalVoteCount={totalVoteCount} />
        <CloseButton onClick={publishVoteClose}>투표 종료</CloseButton>
      </HeaderSection>
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

export default DoVote;

type TargetBall = { count: number; ball: Body; text: string };
type NewBall = { coordinates: { x: number; y: number }; count: number; color: string; text: string };
type UsedPercentage = { percentage: number; time: number; count: number };

type OptionObj = {
  optionText: string;
  optionColor: string;
};

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

const HeaderSection = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  position: relative;
  background-color: black;
  color: white;
  border-radius: 20px;
  font-size: 24px;
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../common";
import GreenLogo from "@/assets/GreenLogo.svg";
import Request from "@/services/requests";
import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";

const sampleVoteResult = {
  title: "오늘 뭐 먹지?",
  voteResult: [
    {
      ranking: 1,
      optionId: 101,
      optionName: "치킨",
      voteCount: 120,
      voteColor: "#F7DF1E",
    },
    {
      ranking: 2,
      optionId: 102,
      optionName: "떡볶이",
      voteCount: 95,
      voteColor: "#3572A5",
    },
    {
      ranking: 3,
      optionId: 103,
      optionName: "초밥",
      voteCount: 80,
      voteColor: "#3178C6",
    },
    {
      ranking: 4,
      optionId: 104,
      optionName: "피자",
      voteCount: 60,
      voteColor: "#00ADD8",
    },
    {
      ranking: 5,
      optionId: 105,
      optionName: "돈까스",
      voteCount: 40,
      voteColor: "#DEA584",
    },
  ],
};

interface VoteResult {
  ranking: number;
  optionId: number;
  optionName: string;
  voteCount: number;
  voteColor: string;
}

const storage = new StorageController("session");

const initialVoteData: VoteResult[] | null = storage.getItem("voteData")
  ? JSON.parse(storage.getItem("voteData")!)
  : null;

const VoteResults = () => {
  const [voteData, setVoteData] = useState<VoteResult[]>([]);
  const [maxVotes, setMaxVotes] = useState(1);
  const voteIdx = storage.getItem("voteIdx");
  const navigate = useNavigate();
  const request = Request();

  const getResultFromAPI = async () => {
    const response = await request.get<APIResponse<{ title: string; voteResult: VoteResult[] }>>(
      `/api/votes/${voteIdx}result`
    );
    if (response.isSuccess) {
      setVoteData(response.result.voteResult);
      setMaxVotes(Math.max(...response.result.voteResult.map((v: VoteResult) => v.voteCount)));
    }
  };

  useEffect(() => {
    if (!initialVoteData) {
      if (!sampleVoteResult) getResultFromAPI();
      else {
        setVoteData(sampleVoteResult.voteResult);
        setMaxVotes(Math.max(...sampleVoteResult.voteResult.map((v) => v.voteCount)));
      }
    } else {
      setMaxVotes(Math.max(...initialVoteData.map((v) => v.voteCount)));
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll(".bar").forEach((el) => {
        (el as HTMLElement).style.width = el.getAttribute("data-width") || "0%";
      });
    }, 200);
  }, [voteData]);

  return (
    <Container>
      <Title>{sampleVoteResult.title}</Title>
      {voteData.map((vote) => (
        <VoteItem key={vote.optionId}>
          <VoteText>
            {vote.ranking}. {vote.optionName} {vote.voteCount}표
          </VoteText>
          <BarContainer>
            <Bar className="bar" data-width={`${(vote.voteCount / maxVotes) * 100}%`} color={vote.voteColor} />
          </BarContainer>
        </VoteItem>
      ))}
      <Button
        type="button"
        style={{ position: "absolute", bottom: 20, zIndex: 100 }}
        onClick={() => {
          storage.clear();
          navigate("/");
        }}
      >
        투표 입장하기
      </Button>
      <GreenLogo />
    </Container>
  );
};

export default VoteResults;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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

const VoteItem = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 20px;
  padding: 0 20px;
`;

const VoteText = styled.span`
  flex: 1;
  font-size: 18px;
  font-weight: bold;
`;

const BarContainer = styled.div`
  flex: 2;
  height: 25px;
  border-radius: 18px;
  overflow: hidden;
`;

const Bar = styled.div<{ color: string }>`
  height: 100%;
  width: 0%;
  background: ${(props) => props.color};
  border-radius: 10px;
  transition: width 0.8s ease-in-out;
`;

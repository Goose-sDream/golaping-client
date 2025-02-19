import { useState, useEffect } from "react";
import styled from "styled-components";
import Request from "@/services/requests";
import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";

const sampleVoteResult = {
  title: "가장 좋아하는 프로그래밍 언어는?",
  voteResult: [
    {
      ranking: 1,
      optionId: 101,
      optionName: "JavaScript",
      voteCount: 120,
      voteColor: "#F7DF1E", // 노랑색 (JavaScript 대표 색상)
    },
    {
      ranking: 2,
      optionId: 102,
      optionName: "Python",
      voteCount: 95,
      voteColor: "#3572A5", // 파랑색 (Python 대표 색상)
    },
    {
      ranking: 3,
      optionId: 103,
      optionName: "TypeScript",
      voteCount: 80,
      voteColor: "#3178C6", // 연한 파랑 (TypeScript 색상)
    },
    {
      ranking: 4,
      optionId: 104,
      optionName: "Go",
      voteCount: 60,
      voteColor: "#00ADD8", // 하늘색 (Go 대표 색상)
    },
    {
      ranking: 5,
      optionId: 105,
      optionName: "Rust",
      voteCount: 40,
      voteColor: "#DEA584", // 주황빛 브라운 (Rust 색상)
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
    }, 200); // 0.2초 후 애니메이션 시작
  }, [voteData]);

  return (
    <Container>
      <Title>{sampleVoteResult.title}</Title>
      {voteData.map((vote) => (
        <VoteItem key={vote.optionId}>
          <VoteText>
            {vote.optionName} - {vote.voteCount}
          </VoteText>
          <BarContainer>
            <Bar className="bar" data-width={`${(vote.voteCount / maxVotes) * 100}%`} color={vote.voteColor} />
          </BarContainer>
        </VoteItem>
      ))}
    </Container>
  );
};

export default VoteResults;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h3`
  text-align: center;
  margin-bottom: 20px;
`;

const VoteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const VoteText = styled.span`
  flex: 1;
  font-size: 18px;
  font-weight: bold;
`;

const BarContainer = styled.div`
  flex: 2;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
`;

const Bar = styled.div<{ color: string }>`
  height: 100%;
  width: 0%;
  background: ${(props) => props.color};
  border-radius: 10px;
  transition: width 0.8s ease-in-out;
`;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../common";
import Request from "@/services/requests";
// import StorageController from "@/storage/storageController";
import { APIResponse } from "@/types/apiTypes";
import { getStorage } from "@/util";

interface VoteData {
  title: string;
  voteResult: VoteResult[];
}

interface VoteResult {
  ranking: number;
  optionId: number;
  optionName: string;
  voteCount: number;
  voteColor: string;
}

// const storage = new StorageController("session");
const storage = getStorage();

const initialVoteData: VoteResult[] | null = storage.getItem("voteData")
  ? JSON.parse(storage.getItem("voteData")!)
  : null;

const VoteResults = () => {
  const [voteData, setVoteData] = useState<VoteData>({ title: "", voteResult: [] });
  const [maxVotes, setMaxVotes] = useState(1);
  const voteIdx = storage.getItem("voteIdx");
  const navigate = useNavigate();
  const request = Request();

  const getResultFromAPI = async () => {
    const response = await request.get<APIResponse<{ title: string; voteResult: VoteResult[] }>>(
      `/api/votes/${voteIdx}/result`
    );
    if (response.isSuccess) {
      setVoteData({ title: response.result.title, voteResult: response.result.voteResult });
      setMaxVotes(Math.max(...response.result.voteResult.map((v: VoteResult) => v.voteCount)));
    }
  };

  useEffect(() => {
    if (!initialVoteData) {
      getResultFromAPI();
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
      <Title>{voteData.title}</Title>
      {voteData.voteResult.map((vote) => (
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
        투표 만들러 가기
      </Button>
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

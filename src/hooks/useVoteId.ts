import { useRecoilState } from "recoil";
import { voteIdState } from "@/atoms/createAtom";

const useVoteId = () => {
  const [voteId, setVoteId] = useRecoilState(voteIdState);

  return {
    voteId,
    setVoteId,
  };
};

export default useVoteId;

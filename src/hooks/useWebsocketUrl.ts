import { useRecoilState } from "recoil";
import { websocketUrlState } from "@/atoms/createAtom";

const useWebsocketUrl = () => {
  const [websocketUrl, setWebsocketUrl] = useRecoilState(websocketUrlState);

  return {
    websocketUrl,
    setWebsocketUrl,
  };
};

export default useWebsocketUrl;

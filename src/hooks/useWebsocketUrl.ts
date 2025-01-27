import { useRecoilState } from "recoil";
import { websocketUrlAtom } from "@/atoms/createAtom";

const useWebsocketUrl = () => {
  const [websocketUrl, setWebsocketUrl] = useRecoilState(websocketUrlAtom);

  return {
    websocketUrl,
    setWebsocketUrl,
  };
};

export default useWebsocketUrl;

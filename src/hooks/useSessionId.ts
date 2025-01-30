import { useRecoilState } from "recoil";
import useCookies from "./useCookies";
import { sessionIdState } from "@/atoms/createAtom";

const useSessionId = () => {
  const [sessionId, setSessionId] = useRecoilState(sessionIdState);
  const { setCookie } = useCookies();

  const updateSessionId = (newSessionId: string) => {
    setSessionId(newSessionId);
    setCookie("SESSION_ID", newSessionId);
  };

  return { sessionId, updateSessionId };
};

export default useSessionId;

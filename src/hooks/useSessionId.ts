import { useRecoilState } from "recoil";
import { sessionIdState } from "@/atoms/createAtom";
import { saveSessionIdToCookie, getSessionIdFromCookie } from "@/utils/cookieUtils";

const useSessionId = () => {
  const [sessionId, setSessionId] = useRecoilState(sessionIdState);

  const updateSessionId = (newSessionId: string) => {
    setSessionId(newSessionId);
    saveSessionIdToCookie(newSessionId);
  };

  const loadSessionIdFromCookie = () => {
    const savedSessionId = getSessionIdFromCookie();
    if (savedSessionId) setSessionId(savedSessionId);
  };

  return { sessionId, updateSessionId, loadSessionIdFromCookie };
};

export default useSessionId;

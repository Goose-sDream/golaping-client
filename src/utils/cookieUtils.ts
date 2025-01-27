import Cookies from "js-cookie";

export const saveSessionIdToCookie = (sessionId: string) => {
  Cookies.set("sessionId", sessionId, { expires: 7 });
};

export const getSessionIdFromCookie = () => {
  return Cookies.get("sessionId");
};

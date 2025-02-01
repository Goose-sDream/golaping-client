const useCookies = () => {
  const setCookie = (key: string, value: string) => {
    document.cookie = `${key}=${value}; max-age=10000; path=/; SameSite=Lax`;
  };

  const getCookie = (key: string) => {
    return document.cookie
      .split(";")
      .find((cookie) => cookie.startsWith(`${key}=`))
      ?.split("=")[1];
  };

  return { setCookie, getCookie };
};

export default useCookies;

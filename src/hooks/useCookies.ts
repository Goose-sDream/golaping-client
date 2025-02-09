const useCookies = () => {
  const getCookie = (key: string) => {
    return document.cookie
      .split(";")
      .find((cookie) => cookie.startsWith(`${key}=`))
      ?.split("=")[1];
  };

  return { getCookie };
};

export default useCookies;

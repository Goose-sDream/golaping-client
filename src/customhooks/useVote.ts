import { useEffect, useState } from "react";

type RadiusMeta = {
  BASERADIUS: number;
  MAXRADIUS: number;
  MINRADIUS: number;
  BASEGROWTHRATE: number;
};

const calculateRadiusMeta = (): RadiusMeta => {
  const width = window.innerWidth;

  if (width >= 1200) {
    return {
      BASERADIUS: 80,
      MAXRADIUS: 80,
      MINRADIUS: 20,
      BASEGROWTHRATE: 4,
    };
  } else if (width >= 768) {
    return {
      BASERADIUS: 70,
      MAXRADIUS: 70,
      MINRADIUS: 16,
      BASEGROWTHRATE: 3,
    };
  } else {
    return {
      BASERADIUS: 60,
      MAXRADIUS: 60,
      MINRADIUS: 10,
      BASEGROWTHRATE: 2,
    };
  }
};

export const useResponsiveRadius = () => {
  const [radiusMeta, setRadiusMeta] = useState<RadiusMeta>(calculateRadiusMeta());

  useEffect(() => {
    const handleResize = () => {
      setRadiusMeta(calculateRadiusMeta());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return radiusMeta;
};

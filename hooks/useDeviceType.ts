'use client';

import { useEffect, useState } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

export const useDeviceType = (): DeviceType => {
  // Default to "desktop" for SSR — avoids hydration mismatch
  const [device, setDevice] = useState<DeviceType>("desktop");

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDevice("mobile");
      } else if (width < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };

    checkDevice();

    // Debounce resize to avoid re-render storms
    let timer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(checkDevice, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return device;
};

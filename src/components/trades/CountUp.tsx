import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  suffix?: string;
  decimals?: number;
  format?: (value: number) => string;
}

export function CountUp({ value, suffix = "", decimals = 0, format }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const displayValueRef = useRef(0);

  useEffect(() => {
    const startValue = displayValueRef.current;
    const difference = value - startValue;
    if (!difference) return;

    const duration = 500;
    const startTime = performance.now();
    let frameId = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + difference * easedProgress;
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <span>
      {format ? format(displayValue) : `${displayValue.toFixed(decimals)}${suffix}`}
    </span>
  );
}
import { useState, useRef, useEffect } from 'react';

interface CountdownTimerProps {
  timeout: number; // timeout in milliseconds
  onChangeTime?: (time: number) => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeout, onChangeTime, className }) => {
  const [timeLeft, setTimeLeft] = useState<number>(timeout);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tick = () => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1000;
        onChangeTime?.(newTime);
        return newTime;
      });
    };

    timerIdRef.current = setInterval(tick, 1000);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [onChangeTime]);

  useEffect(() => {
    if (timeLeft <= 0 && timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }
  }, [timeLeft]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return <span className={className}>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;

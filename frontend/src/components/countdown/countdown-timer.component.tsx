import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  timeout: number; // timeout in milliseconds
  onChangeTime?: (time: number) => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeout, onChangeTime, className }) => {
  // Counts towards a fixed deadline instead of subtracting a second per tick: browsers throttle
  // timers in background tabs, and the display would fall behind the time actually left.
  const [deadline] = useState(() => Date.now() + timeout);
  const [timeLeft, setTimeLeft] = useState<number>(timeout);

  useEffect(() => {
    if (deadline <= Date.now()) return;

    const timerId = setInterval(() => {
      const newTime = Math.max(deadline - Date.now(), 0);
      setTimeLeft(newTime);
      onChangeTime?.(newTime);
      if (newTime === 0) {
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [deadline, onChangeTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return <span className={className}>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;

import CountdownTimer from '@components/countdown/countdown-timer.component';
import { useConfirm } from '@sk-web-gui/react';
import { useCallback, useEffect, useRef } from 'react';

export const useInactivityTrigger = ({
  trigger,
  timeout = 3 * 1000,
  triggerCondition = true,
}: {
  trigger: (resetTimer: () => void) => void;
  timeout?: number;
  triggerCondition?: boolean;
}) => {
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => triggerCondition && trigger(resetTimer), timeout) as unknown as number;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, timeout]);

  useEffect(() => {
    const handleUserActivity = () => resetTimer();

    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);

    resetTimer();

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
    };
  }, [resetTimer]);

  return null;
};

export const useInactivityAlert = ({
  logoutCallback,
  warningTimeout = process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT
    ? parseInt(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT, 10)
    : 10 * 60 * 1000,
  countdownTimeout = process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT
    ? parseInt(process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT, 10)
    : 5 * 60 * 1000,
  inactivityCondition = true,
}: {
  logoutCallback: () => void;
  warningTimeout?: number;
  countdownTimeout?: number;
  inactivityCondition?: boolean;
}) => {
  const { showConfirmation } = useConfirm();
  const countdownTimerRef = useRef<number | null>(null);
  const alertShownRef = useRef<boolean>(false); // Ref to track if the alert has been shown

  const trigger = useCallback(
    (resetTimer: () => void) => {
      if (alertShownRef.current) {
        return; // If alert has been shown, do not show it again
      }
      alertShownRef.current = true; // Mark that the alert is shown

      if (countdownTimerRef.current !== null) {
        clearTimeout(countdownTimerRef.current);
      }

      countdownTimerRef.current = window.setTimeout(() => {
        logoutCallback();
        countdownTimerRef.current = null; // Clear the timer reference
      }, countdownTimeout) as unknown as number;

      const title = 'Är du kvar?';
      const message = (
        <span>
          Du loggas automatiskt ut om{' '}
          <strong>
            <CountdownTimer timeout={countdownTimeout} />
          </strong>
          . Välj om du vill logga ut eller stanna kvar.
        </span>
      );
      showConfirmation(title, message, 'Stanna kvar', 'Logga ut', 'info').then((confirm: boolean) => {
        if (confirm) {
          if (countdownTimerRef.current !== null) {
            clearTimeout(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          alertShownRef.current = false; // Reset alert shown status
          resetTimer(); // Restart inactivity timer
        } else {
          logoutCallback();
        }
      });
    },
    [showConfirmation, countdownTimeout, logoutCallback]
  );

  useInactivityTrigger({ trigger, timeout: warningTimeout, triggerCondition: inactivityCondition });

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current !== null) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, []);

  return null;
};

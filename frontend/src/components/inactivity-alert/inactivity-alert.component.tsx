import CountdownTimer from '@components/countdown/countdown-timer.component';
import { useInactivityTrigger } from '@utils/use-inactivity-trigger.hook';
import { Button, Dialog } from '@sk-web-gui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const WARNING_TIMEOUT = process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_TIMEOUT, 10)
  : 10 * 60 * 1000;
const COUNTDOWN_TIMEOUT = process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_INACTIVITY_COUNTDOWN_TIMEOUT, 10)
  : 5 * 60 * 1000;

interface InactivityAlertProps {
  onLogout: () => void;
  enabled: boolean;
}

/** Warns after a period of inactivity and logs the user out unless they choose to stay. */
export const InactivityAlert: React.FC<InactivityAlertProps> = ({ onLogout, enabled }) => {
  const [showWarning, setShowWarning] = useState(false);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleLogout = useCallback(() => {
    clearTimeout(countdownTimerRef.current);
    setShowWarning(false);
    onLogout();
  }, [onLogout]);

  const handleInactive = useCallback(() => {
    setShowWarning(true);
    countdownTimerRef.current = setTimeout(handleLogout, COUNTDOWN_TIMEOUT);
  }, [handleLogout]);

  // Activity while the dialog is open must not count; the user has to answer it.
  useInactivityTrigger({ onInactive: handleInactive, timeout: WARNING_TIMEOUT, enabled: enabled && !showWarning });

  const handleStay = () => {
    clearTimeout(countdownTimerRef.current);
    setShowWarning(false);
  };

  useEffect(() => () => clearTimeout(countdownTimerRef.current), []);

  return (
    <Dialog show={showWarning} aria-label="Är du kvar?" hideLabel onClose={handleStay}>
      <Dialog.Content>
        <h1 className="sk-dialog-confirm-heading">Är du kvar?</h1>
        <p>
          Du loggas automatiskt ut om <strong>{showWarning && <CountdownTimer timeout={COUNTDOWN_TIMEOUT} />}</strong>.
          Välj om du vill logga ut eller stanna kvar.
        </p>
      </Dialog.Content>
      <Dialog.Buttons>
        <Button variant="secondary" onClick={handleLogout}>
          Logga ut
        </Button>
        <Button variant="primary" color="info" onClick={handleStay}>
          Stanna kvar
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};

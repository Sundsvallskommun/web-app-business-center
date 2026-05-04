import { Button } from '@sk-web-gui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface StepNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  forwardDisabled?: boolean;
  forwardLoading?: boolean;
  forwardLabel?: string;
  isSubmit?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onNext,
  forwardDisabled = false,
  forwardLoading = false,
  forwardLabel = 'Nästa',
  isSubmit = false,
}) => {
  return (
    <div className="flex flex-col desktop:flex-row gap-x-24 gap-y-20 desktop:items-center mt-40">
      {onBack && (
        <Button
          data-cy="economic-aid-step-back"
          size="lg"
          variant="secondary"
          leftIcon={<ArrowLeft />}
          onClick={onBack}
          type="button"
        >
          Tillbaka
        </Button>
      )}
      <Button
        data-cy="economic-aid-step-forward"
        size="lg"
        color="vattjom"
        rightIcon={<ArrowRight />}
        type={isSubmit ? 'submit' : 'button'}
        onClick={isSubmit ? undefined : onNext}
        disabled={forwardDisabled}
        loading={forwardLoading}
        loadingText="Skickar"
      >
        {forwardLabel}
      </Button>
    </div>
  );
};

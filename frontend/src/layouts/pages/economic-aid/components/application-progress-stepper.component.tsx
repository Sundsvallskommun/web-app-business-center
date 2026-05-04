import { ECONOMIC_AID_STEPS } from '@interfaces/economic-aid';
import { ProgressBar } from '@sk-web-gui/progress-bar';
import { ProgressStepper } from '@sk-web-gui/progress-stepper';

export interface ApplicationProgressStepperProps {
  current: number;
}

export const ApplicationProgressStepper: React.FC<ApplicationProgressStepperProps> = ({ current }) => {
  const stepLabels = ECONOMIC_AID_STEPS.map((step) => step.label);
  const total = stepLabels.length;
  const currentLabel = stepLabels[current];
  const nextLabel = current < total - 1 ? stepLabels[current + 1] : null;

  return (
    <div data-cy="economic-aid-stepper">
      {/*
        Mobil/tablet: kompakt summering. Hela steg-listan finns i sr-only nedan
        så skärmläsare får hela strukturen oavsett breakpoint.
      */}
      <div className="desktop:hidden flex flex-col gap-12" aria-hidden="true">
        <div className="flex items-baseline justify-between gap-12">
          <p className="text-small text-dark-secondary">
            Steg {current + 1} av {total}
          </p>
          {nextLabel && <p className="text-small text-dark-secondary">Nästa: {nextLabel}</p>}
        </div>
        <p className="font-bold">{currentLabel}</p>
        <ProgressBar steps={total} current={current + 1} color="vattjom" size="sm" />
      </div>

      {/* Desktop: full stepper. */}
      <div className="hidden desktop:block">
        <ProgressStepper steps={stepLabels} current={current} labelPosition="bottom" size="sm" />
      </div>

      {/*
        Tillgänglig fallback för skärmläsare på alla viewports — ger samma
        ordnade lista som ProgressStepper utan att duplicera visuellt på desktop.
      */}
      <ol className="sr-only desktop:hidden">
        {stepLabels.map((label, index) => (
          <li key={label} aria-current={index === current ? 'step' : undefined}>
            Steg {index + 1} av {total}: {label}
            {index < current && ' (klart)'}
            {index === current && ' (pågår)'}
          </li>
        ))}
      </ol>
    </div>
  );
};

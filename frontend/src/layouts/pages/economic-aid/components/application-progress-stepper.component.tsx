import { ECONOMIC_AID_STEPS } from '@interfaces/economic-aid';
import { ProgressBar } from '@sk-web-gui/progress-bar';
import { ProgressStepper } from '@sk-web-gui/progress-stepper';
import { useTranslation } from 'react-i18next';

export interface ApplicationProgressStepperProps {
  current: number;
}

export const ApplicationProgressStepper: React.FC<ApplicationProgressStepperProps> = ({ current }) => {
  const { t } = useTranslation('economic-aid');
  const stepLabels = ECONOMIC_AID_STEPS.map((step) => t(`economic-aid:steps.${step.key}`));
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
            {t('economic-aid:stepper.stepOf', { current: current + 1, total })}
          </p>
          {nextLabel && (
            <p className="text-small text-dark-secondary">
              {t('economic-aid:stepper.next', { label: nextLabel })}
            </p>
          )}
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
            {t('economic-aid:stepper.srStep', { number: index + 1, total, label })}
            {index < current && t('economic-aid:stepper.done')}
            {index === current && t('economic-aid:stepper.current')}
          </li>
        ))}
      </ol>
    </div>
  );
};

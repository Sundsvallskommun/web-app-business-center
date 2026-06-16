import { Link } from '@sk-web-gui/react';
import { useTranslation } from 'react-i18next';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

/**
 * Steg 0 — informationssida. All text kommer från locale-namespacet
 * `economic-aid` (locales/sv/economic-aid.json) så innehållet kan redigeras
 * utan kodändring. Sidan samlar inga uppgifter — den leder bara vidare.
 */
export const StepInformation: React.FC<StepProps> = ({ onNext }) => {
  const { t } = useTranslation('economic-aid');

  const processSteps = t('economic-aid:information.processSteps', { returnObjects: true }) as string[];

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-information-heading"
      data-cy="economic-aid-step-information"
    >
      <header className="text-content flex flex-col gap-12">
        <h2 id="economic-aid-step-information-heading">{t('economic-aid:information.heading')}</h2>
        <p>{t('economic-aid:information.ingress')}</p>
        <Link external href={t('economic-aid:information.lankUrl')}>
          {t('economic-aid:information.lankText')}
        </Link>
      </header>

      {/* Skyddade personuppgifter — visuellt avgränsad så den inte missas. */}
      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.skyddadeHeading')}</h3>
        <p role="note" className="bg-warning-background-200 rounded-button px-14 py-12 font-bold">
          {t('economic-aid:information.skyddadeUppgifter')}
        </p>
      </div>

      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.processHeading')}</h3>
        <p>{t('economic-aid:information.processIntro')}</p>
        <ol className="list-decimal flex flex-col gap-4 pl-20">
          {processSteps.map((processStep) => (
            <li key={processStep}>{processStep}</li>
          ))}
        </ol>
        <p>{t('economic-aid:information.processDigital')}</p>
      </div>

      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.stickprovHeading')}</h3>
        <p>{t('economic-aid:information.stickprov')}</p>
      </div>

      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.korrektaHeading')}</h3>
        <p>{t('economic-aid:information.korrekta')}</p>
      </div>

      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.meddelandeHeading')}</h3>
        <p>{t('economic-aid:information.meddelande')}</p>
      </div>

      <div className="text-content flex flex-col gap-8">
        <h3>{t('economic-aid:information.fragorHeading')}</h3>
        <p>{t('economic-aid:information.fragor')}</p>
        <Link external href={t('economic-aid:information.fragorLankUrl')}>
          {t('economic-aid:information.fragorLankText')}
        </Link>
      </div>

      <StepNavigation onNext={onNext} forwardLabel={t('economic-aid:information.start')} />
    </section>
  );
};

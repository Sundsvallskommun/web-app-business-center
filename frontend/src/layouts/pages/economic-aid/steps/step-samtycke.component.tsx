import { EconomicAidApplicationV1 } from '@interfaces/economic-aid';
import { Alert, Checkbox, FormControl } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

export const StepSamtycke: React.FC<StepProps> = ({ onBack, isSubmitting }) => {
  const { register, watch } = useFormContext<EconomicAidApplicationV1>();

  const consentDataFetch = watch('samtycke.consentDataFetch');
  const truthAffirmation = watch('samtycke.truthAffirmation');
  const notifyChanges = watch('samtycke.notifyChanges');
  const allChecked = consentDataFetch && truthAffirmation && notifyChanges;

  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-samtycke-heading"
      data-cy="economic-aid-step-samtycke"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-samtycke-heading">Bekräftelse och skicka in</h2>
        <p>Innan du skickar in ansökan behöver du lämna ditt samtycke.</p>
      </header>

      <Alert type="info">
        <Alert.Icon />
        <Alert.Content>
          <Alert.Content.Description>
            Vi hämtar uppgifter från Försäkringskassan, Skatteverket, CSN, Pensionsmyndigheten och Arbetsförmedlingen via SSBTEK när
            ansökan skickas in. Dina uppgifter behandlas enligt dataskyddsförordningen och Socialtjänstlagen.
          </Alert.Content.Description>
        </Alert.Content>
      </Alert>

      <FormControl className="flex flex-col gap-16">
        <Checkbox
          data-cy="economic-aid-consent-data-fetch"
          {...register('samtycke.consentDataFetch', { required: true })}
        >
          Jag godkänner att Sundsvalls kommun hämtar mina uppgifter från berörda myndigheter via SSBTEK.
        </Checkbox>
        <Checkbox
          data-cy="economic-aid-consent-truth"
          {...register('samtycke.truthAffirmation', { required: true })}
        >
          Jag intygar att de uppgifter jag lämnat är korrekta och fullständiga. Jag är medveten om att oriktiga uppgifter kan leda till
          återkrav och polisanmälan för bidragsbrott.
        </Checkbox>
        <Checkbox
          data-cy="economic-aid-consent-notify"
          {...register('samtycke.notifyChanges', { required: true })}
        >
          Jag förbinder mig att omgående meddela socialtjänsten om förändringar under bidragsperioden (ändrade inkomster, boende eller
          tillgångar).
        </Checkbox>
      </FormControl>

      <StepNavigation
        onBack={onBack}
        isSubmit
        forwardLabel="Skicka in ansökan"
        forwardDisabled={!allChecked}
        forwardLoading={isSubmitting}
      />
    </section>
  );
};

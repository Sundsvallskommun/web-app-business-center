import { StepNavigation } from '../components/step-navigation.component';
import { StepProps } from './step-registry';

/**
 * Renders for steps that have not yet been built out. Lets the applicant
 * advance through the stepper end-to-end during iteration 1 so the submit
 * flow can be exercised without all 10 steps being implemented.
 */
export const StepPlaceholder: React.FC<StepProps> = ({ label, onBack, onNext }) => {
  return (
    <section
      className="flex flex-col gap-24"
      aria-labelledby="economic-aid-step-placeholder-heading"
      data-cy="economic-aid-step-placeholder"
    >
      <header className="text-content">
        <h2 id="economic-aid-step-placeholder-heading">{label}</h2>
      </header>
      <p className="text-content">Det här steget är inte byggt ännu. Fortsätt till nästa steg för att se hur ansökan skickas in.</p>
      <StepNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
};

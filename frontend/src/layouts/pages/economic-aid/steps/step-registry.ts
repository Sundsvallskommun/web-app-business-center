import { EconomicAidStepKey } from '@interfaces/economic-aid';
import { StepCivilstand } from './step-civilstand.component';
import { StepFormular } from './step-formular.component';
import { StepInformation } from './step-information.component';

/**
 * Props every step component must accept. Each step ignores what it does
 * not use (e.g. the first step ignores onBack, the last step ignores
 * onNext and renders only a back button).
 */
export interface StepProps {
  /** Display label like "Steg 2 – Civilstånd", supplied by the container. */
  label: string;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

/**
 * Maps each active step key to the component that renders it. The flow is
 * being rebuilt around caremanagement typeSlugs — see ECONOMIC_AID_STEPS.
 * The dynamic, typeSlug-driven steps replace `formular` once the backend
 * endpoint is ready.
 */
export const STEP_COMPONENTS: Record<EconomicAidStepKey, React.ComponentType<StepProps>> = {
  information: StepInformation,
  civilstand: StepCivilstand,
  formular: StepFormular,
};

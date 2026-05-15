import { EconomicAidStepKey } from '@interfaces/economic-aid';
import { StepBoende } from './step-boende.component';
import { StepHushall } from './step-hushall.component';
import { StepIdentitet } from './step-identitet.component';
import { StepPlaceholder } from './step-placeholder.component';
import { StepSamtycke } from './step-samtycke.component';
import { StepSysselsattning } from './step-sysselsattning.component';
import { StepVagval } from './step-vagval.component';

/**
 * Props every step component must accept. Each step ignores what it does
 * not use (e.g. the first step ignores onBack, the last step ignores
 * onNext and uses isSubmitting + a submit-typed button instead).
 */
export interface StepProps {
  /** Display label like "Steg 3 – Hushåll", supplied by the container. */
  label: string;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

/**
 * Maps each step key to the component that renders it. Steps not yet
 * implemented in iteration 1 point at StepPlaceholder so the stepper
 * still works end-to-end while the form is built out. Replace placeholder
 * entries as each step ships.
 */
export const STEP_COMPONENTS: Record<EconomicAidStepKey, React.ComponentType<StepProps>> = {
  vagval: StepVagval,
  identitet: StepIdentitet,
  hushall: StepHushall,
  boende: StepBoende,
  sysselsattning: StepSysselsattning,
  inkomster: StepPlaceholder,
  utgifter: StepPlaceholder,
  situation: StepPlaceholder,
  utbetalning: StepPlaceholder,
  samtycke: StepSamtycke,
};

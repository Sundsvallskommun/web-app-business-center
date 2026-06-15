import { ApplicationType, FaGroupKey } from '@interfaces/financial-assistance';
import { StepEconomy } from './step-economy.component';
import { StepHouseholdHousing } from './step-household-housing.component';
import { StepPayment } from './step-payment.component';
import { StepPeriodNorm } from './step-period-norm.component';
import { StepPlanning } from './step-planning.component';
import { StepReview } from './step-review.component';

// StepPlaceholder (./step-placeholder.component) is retained for future groups but no longer mapped.

/** Props every financial-assistance step receives from the wizard shell. */
export interface FaStepProps {
  label: string;
  applicationType: ApplicationType;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

/**
 * Maps each wizard group to its component. Milestone 1 implements `period-norm`
 * and `review`; the remaining groups render a placeholder until their milestone.
 */
export const FA_STEP_COMPONENTS: Record<FaGroupKey, React.ComponentType<FaStepProps>> = {
  'period-norm': StepPeriodNorm,
  'household-housing': StepHouseholdHousing,
  economy: StepEconomy,
  planning: StepPlanning,
  payment: StepPayment,
  review: StepReview,
};

import { ApplicationType, FaGroupKey } from '@interfaces/financial-assistance';
import { StepEconomy } from './step-economy.component';
import { StepHouseholdHousing } from './step-household-housing.component';
import { StepIncome } from './step-income.component';
import { StepPayment } from './step-payment.component';
import { StepPlanning } from './step-planning.component';
import { StepReview } from './step-review.component';

/** Props every financial-assistance step receives from the wizard shell. */
export interface FaStepProps {
  label: string;
  applicationType: ApplicationType;
  onBack: () => void;
  onNext: () => void;
  isSubmitting: boolean;
}

/** Maps each wizard group to its component. */
export const FA_STEP_COMPONENTS: Record<FaGroupKey, React.ComponentType<FaStepProps>> = {
  'household-housing': StepHouseholdHousing,
  economy: StepEconomy,
  income: StepIncome,
  planning: StepPlanning,
  payment: StepPayment,
  review: StepReview,
};

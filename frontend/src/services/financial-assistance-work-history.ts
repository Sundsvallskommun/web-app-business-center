import { PersonRole, PlanningForm } from '@interfaces/financial-assistance';

/** Planning entries without a person belong to the applicant (same rule as the planning step). */
export const planningRole =(person: string): PersonRole => (person === 'CO_APPLICANT' ? 'CO_APPLICANT' : 'APPLICANT');

/**
 * Whether "Har du haft arbete under de senaste 12 månaderna?" is asked for a person (nyansökan):
 * only once the person has chosen a planning, and none of the chosen plannings is "Arbete".
 * Shared by the planning step, the payload, the PDF summary and the form snapshot so they agree.
 */
export const asksWorkHistory = (plannings: PlanningForm[], role: PersonRole): boolean => {
  const personPlannings = plannings.filter(
    (planning) => planning.planningType && planningRole(planning.person) === role
  );
  return personPlannings.length > 0 && !personPlannings.some((planning) => planning.planningType === 'WORK');
};

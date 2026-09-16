import { EligibilitySuggestion } from '@interfaces/economic-aid';

/**
 * Unique key for an eligibility suggestion. caremanagement may offer several suggestions of the same
 * type (e.g. supplementary applications for two different months), so the typeSlug alone does not
 * identify one — the target period is part of the key.
 */
export const eligibilitySuggestionKey = (
  suggestion: Pick<EligibilitySuggestion, 'typeSlug' | 'periodYear' | 'periodMonth'>
): string =>
  [suggestion.typeSlug, suggestion.periodYear, suggestion.periodMonth].filter((part) => part != null).join(':');

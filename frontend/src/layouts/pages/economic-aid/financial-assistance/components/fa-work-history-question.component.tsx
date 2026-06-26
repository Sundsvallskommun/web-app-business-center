import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, Input, RadioButton } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FaWorkHistoryQuestionProps {
  /** Index into the `persons` field array (applicant or co-applicant). */
  index: number;
}

/**
 * "Har du haft arbete under de senaste 12 månaderna?" för en person. Visas på planeringssteget
 * (nyansökan) när personen inte valt "Arbete" som planering. Vid "Ja" anges arbetsplats, period
 * och omfattning i fritext. Värdena lagras på persons[index] och skickas vidare av buildPerson.
 */
export const FaWorkHistoryQuestion: React.FC<FaWorkHistoryQuestionProps> = ({ index }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const hadWork = watch(`persons.${index}.hadWorkLast12Months` as const);
  const cy = `fa-person-${index}-had-work`;

  const setHadWork = (value: boolean) =>
    setValue(`persons.${index}.hadWorkLast12Months` as const, value, { shouldDirty: true });

  return (
    <FormControl data-cy={cy} className="w-full">
      <FormLabel className="font-bold">{t('financial-assistance:planning.hadWorkLabel')}</FormLabel>
      <RadioButton.Group inline>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-no`}
          checked={hadWork === false}
          onChange={() => {}}
          onClick={() => setHadWork(false)}
        >
          {t('financial-assistance:common.no')}
        </RadioButton>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-yes`}
          checked={hadWork === true}
          onChange={() => {}}
          onClick={() => setHadWork(true)}
        >
          {t('financial-assistance:common.yes')}
        </RadioButton>
      </RadioButton.Group>
      {hadWork === true ? (
        <div className="mt-12">
          <FormLabel htmlFor={`${cy}-description`}>{t('financial-assistance:planning.hadWorkDescriptionLabel')}</FormLabel>
          <Input id={`${cy}-description`} {...register(`persons.${index}.hadWorkDescription` as const)} />
        </div>
      ) : null}
    </FormControl>
  );
};

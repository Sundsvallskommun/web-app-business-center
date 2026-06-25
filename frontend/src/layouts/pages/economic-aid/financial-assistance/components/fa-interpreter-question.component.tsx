import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, RadioButton } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TolkSprakPicker } from '../../components/tolk-sprak-picker.component';

interface FaInterpreterQuestionProps {
  /** Index into the `persons` field array (applicant or co-applicant). */
  index: number;
}

/**
 * "Behöver du tolk?" för en person (sökande/medsökande). Visas på personuppgifter (steg 1) efter
 * notisvalet. Vid "Ja" väljs språk i en rullista (TolkSprakPicker). En instans per person, så
 * sambos får två frågor. Värdena lagras på persons[index] och skickas vidare av buildPerson.
 */
export const FaInterpreterQuestion: React.FC<FaInterpreterQuestionProps> = ({ index }) => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const needsInterpreter = watch(`persons.${index}.needsInterpreter` as const);
  const language = watch(`persons.${index}.interpreterLanguage` as const);
  const cy = `fa-person-${index}-needs-interpreter`;

  const setNeedsInterpreter = (value: boolean) =>
    setValue(`persons.${index}.needsInterpreter` as const, value, { shouldDirty: true });

  return (
    <FormControl data-cy={cy} className="w-full">
      <FormLabel className="font-bold">{t('financial-assistance:personuppgifter.needsInterpreterLabel')}</FormLabel>
      <RadioButton.Group inline>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-no`}
          checked={needsInterpreter === false}
          onChange={() => {}}
          onClick={() => setNeedsInterpreter(false)}
        >
          {t('financial-assistance:common.no')}
        </RadioButton>
        <RadioButton
          size="sm"
          className="mr-sm"
          name={cy}
          id={`${cy}-yes`}
          checked={needsInterpreter === true}
          onChange={() => {}}
          onClick={() => setNeedsInterpreter(true)}
        >
          {t('financial-assistance:common.yes')}
        </RadioButton>
      </RadioButton.Group>
      {needsInterpreter === true ? (
        <div className="mt-12 max-w-[24rem]">
          <TolkSprakPicker
            id={`fa-person-${index}-interpreter-language`}
            dataCy={`fa-person-${index}-interpreter-language`}
            label={t('financial-assistance:personuppgifter.interpreterLanguageLabel')}
            value={language}
            onValueChange={(next) => setValue(`persons.${index}.interpreterLanguage` as const, next, { shouldDirty: true })}
            invalid={false}
          />
        </div>
      ) : null}
    </FormControl>
  );
};

import { FinancialAssistanceFormData, NormType } from '@interfaces/financial-assistance';
import { Checkbox, FormControl, FormLabel, Textarea } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { selectableBoxClass } from './fa-form-helpers';

const NORM_TYPES: NormType[] = ['NATIONAL_NORM', 'OTHER_NORM'];

const toggle = <T,>(values: T[], value: T): T[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

/**
 * Riksnorm/Annan norm som utgiftsboxar (tilläggsansökan). Renderas under kostnadernas befintliga
 * "Övrigt"-kategori — alltså inte under en egen rubrik — så att det bara finns en "Övrigt". Varje
 * ikryssad norm visar sin infotext och en specifikation (för vem/vilka och vilken period).
 */
export const FaNormBoxes: React.FC = () => {
  const { t } = useTranslation('financial-assistance');
  const { watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const normTypes = watch('normTypes');

  return (
    <>
      {NORM_TYPES.map((type) => {
        const checked = normTypes.includes(type);
        return (
          <div key={type} className={selectableBoxClass(checked)} data-cy={`fa-norm-box-${type}`}>
            <Checkbox
              checked={checked}
              data-cy={`fa-norm-toggle-${type}`}
              onChange={() => setValue('normTypes', toggle(normTypes, type), { shouldDirty: true })}
            >
              <span className="font-bold">{t(`financial-assistance:normType.${type}`)}</span>
            </Checkbox>
            {checked ? (
              <div className="flex flex-col gap-12 mt-12 ml-32">
                <span className="text-small text-dark-secondary">{t(`financial-assistance:normInfo.${type}`)}</span>
                <FormControl className="w-full" data-cy={`fa-norm-specification-${type}`}>
                  <FormLabel className="font-bold">{t('financial-assistance:economy.normSpecificationLabel')}</FormLabel>
                  <Textarea
                    className="w-full min-h-72"
                    value={watch(`normSpecifications.${type}` as const)}
                    onChange={(event) => setValue(`normSpecifications.${type}` as const, event.target.value, { shouldDirty: true })}
                  />
                </FormControl>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

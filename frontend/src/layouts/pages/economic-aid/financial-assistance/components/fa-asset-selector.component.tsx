import { AssetCategory, FinancialAssistanceFormData, emptyAsset } from '@interfaces/financial-assistance';
import { Button, Checkbox, Icon } from '@sk-web-gui/react';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { selectableBoxClass } from './fa-form-helpers';
import { FaAssetFields } from './fa-asset-fields.component';
import { FaRemoveButton } from './fa-remove-button.component';

const ASSET_CATEGORIES: AssetCategory[] = ['BANK_SAVINGS', 'REAL_ESTATE', 'COMPANY', 'VEHICLE', 'OTHER'];

/**
 * Tillgångsväljare — markera en eller flera tillgångskategorier (errand_fa_asset). Varje kategori
 * är en ruta med checkbox; ikryssad ruta expanderar och visar de kategorispecifika fälten. En
 * kategori kan ha flera rader ("Lägg till ny rad"), t.ex. flera fordon. Varje rad blir en post i
 * `assets`.
 */
export const FaAssetSelector: React.FC = () => {
  const { t } = useTranslation('financial-assistance');
  const { control, watch } = useFormContext<FinancialAssistanceFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: 'assets' });
  const assets = watch('assets');

  const indicesOf = (category: AssetCategory): number[] =>
    assets.reduce<number[]>((acc, asset, index) => (asset.assetCategory === category ? [...acc, index] : acc), []);

  return (
    <div className="flex flex-col gap-12" data-cy="fa-asset-selector">
      {ASSET_CATEGORIES.map((category) => {
        const indices = indicesOf(category);
        const checked = indices.length > 0;
        const label = t(`financial-assistance:assetCategory.${category}`);
        const toggle = () => (checked ? remove(indices) : append({ ...emptyAsset(), assetCategory: category }));

        return (
          <div key={category} className={selectableBoxClass(checked)} data-cy={`fa-asset-box-${category}`}>
            <Checkbox checked={checked} onChange={toggle} data-cy={`fa-asset-toggle-${category}`}>
              <span className="font-bold">{label}</span>
            </Checkbox>

            {checked ? (
              <div className="flex flex-col gap-16 mt-12 ml-32">
                {indices.map((index, rowNumber) => (
                  <div
                    key={fields[index]?.id ?? index}
                    className={`flex flex-col gap-12 ${rowNumber > 0 ? 'border-t border-divider pt-12' : ''}`}
                    data-cy={`fa-asset-row-${category}-${rowNumber}`}
                  >
                    <FaAssetFields index={index} category={category} />
                    {/* Första raden tas bort genom att avmarkera rutan. */}
                    {rowNumber > 0 ? (
                      <div className="flex justify-end">
                        <FaRemoveButton
                          dataCy={`fa-asset-remove-${category}-${rowNumber}`}
                          onRemove={() => remove(index)}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}

                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    data-cy={`fa-asset-add-row-${category}`}
                    onClick={() => append({ ...emptyAsset(), assetCategory: category })}
                    leftIcon={<Icon icon={<Plus />} />}
                  >
                    {t('financial-assistance:economy.addRow')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

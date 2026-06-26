import { AssetCategory, FinancialAssistanceFormData, PropertyType, VehicleType } from '@interfaces/financial-assistance';
import { FormControl, FormLabel, Input, Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions } from './fa-form-helpers';

const PROPERTY_TYPES: PropertyType[] = ['CONDOMINIUM', 'HOUSE', 'PROPERTY', 'HOLIDAY_HOME'];
const VEHICLE_TYPES: VehicleType[] = ['CAR', 'BOAT', 'MOTORCYCLE', 'CARAVAN', 'MOPED', 'SNOWMOBILE', 'OTHER'];

interface FaAssetFieldsProps {
  index: number;
  category: AssetCategory;
}

/**
 * Kategorispecifika fält för en tillgångsrad (errand_fa_asset). Kategorin styrs av rutan i
 * tillgångsväljaren, så här renderas bara fälten — ingen kategori-väljare.
 */
export const FaAssetFields: React.FC<FaAssetFieldsProps> = ({ index, category }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const fieldId = `fa-asset-${index}`;

  if (category === 'BANK_SAVINGS' || category === 'OTHER') {
    return (
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-description`}>
            {category === 'OTHER'
              ? t('financial-assistance:economy.asset.whatLabel')
              : t('financial-assistance:economy.asset.descriptionLabel')}
          </FormLabel>
          <Input id={`${fieldId}-description`} {...register(`assets.${index}.description` as const)} />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-value`}>{t('financial-assistance:economy.asset.valueLabel')}</FormLabel>
          <Input
            id={`${fieldId}-value`}
            type="number"
            min={0}
            {...register(`assets.${index}.value` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>
    );
  }

  if (category === 'REAL_ESTATE') {
    return (
      <div className="grid grid-cols-1 desktop:grid-cols-3 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-property-type`}>
            {t('financial-assistance:economy.asset.propertyTypeLabel')}
          </FormLabel>
          <Select
            id={`${fieldId}-property-type`}
            className="w-full"
            value={watch(`assets.${index}.propertyType` as const) || ''}
            onSelectValue={(next) =>
              setValue(`assets.${index}.propertyType` as const, (next as PropertyType | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {PROPERTY_TYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:propertyType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-purchase-year`}>
            {t('financial-assistance:economy.asset.purchaseYearLabel')}
          </FormLabel>
          <Input
            id={`${fieldId}-purchase-year`}
            type="number"
            {...register(`assets.${index}.purchaseYear` as const, numberFieldOptions)}
          />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-purchase-price`}>
            {t('financial-assistance:economy.asset.purchasePriceLabel')}
          </FormLabel>
          <Input
            id={`${fieldId}-purchase-price`}
            type="number"
            min={0}
            {...register(`assets.${index}.purchasePrice` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>
    );
  }

  if (category === 'COMPANY') {
    return (
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-company-name`}>
            {t('financial-assistance:economy.asset.companyNameLabel')}
          </FormLabel>
          <Input id={`${fieldId}-company-name`} {...register(`assets.${index}.companyName` as const)} />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-company-sum`}>
            {t('financial-assistance:economy.asset.companyAssetSumLabel')}
          </FormLabel>
          <Input
            id={`${fieldId}-company-sum`}
            type="number"
            min={0}
            {...register(`assets.${index}.companyAssetSum` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>
    );
  }

  // VEHICLE
  return (
    <>
      <div className="grid grid-cols-1 desktop:grid-cols-3 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-vehicle-type`}>
            {t('financial-assistance:economy.asset.vehicleTypeLabel')}
          </FormLabel>
          <Select
            id={`${fieldId}-vehicle-type`}
            className="w-full"
            value={watch(`assets.${index}.vehicleType` as const) || ''}
            onSelectValue={(next) =>
              setValue(`assets.${index}.vehicleType` as const, (next as VehicleType | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {VEHICLE_TYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:vehicleType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-registration`}>
            {t('financial-assistance:economy.asset.registrationNumberLabel')}
          </FormLabel>
          <Input id={`${fieldId}-registration`} {...register(`assets.${index}.registrationNumber` as const)} />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-purchase-date`}>
            {t('financial-assistance:economy.asset.purchaseDateLabel')}
          </FormLabel>
          <Input id={`${fieldId}-purchase-date`} type="date" {...register(`assets.${index}.purchaseDate` as const)} />
        </FormControl>
      </div>
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-vehicle-price`}>
            {t('financial-assistance:economy.asset.purchasePriceLabel')}
          </FormLabel>
          <Input
            id={`${fieldId}-vehicle-price`}
            type="number"
            min={0}
            {...register(`assets.${index}.purchasePrice` as const, numberFieldOptions)}
          />
        </FormControl>
        <FormControl className="w-full">
          <FormLabel htmlFor={`${fieldId}-vehicle-value`}>
            {t('financial-assistance:economy.asset.valueLabel')}
          </FormLabel>
          <Input
            id={`${fieldId}-vehicle-value`}
            type="number"
            min={0}
            {...register(`assets.${index}.value` as const, numberFieldOptions)}
          />
        </FormControl>
      </div>
    </>
  );
};

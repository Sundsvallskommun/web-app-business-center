import { AssetCategory, FinancialAssistanceFormData, PropertyType, VehicleType } from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { numberFieldOptions } from './fa-form-helpers';

const ASSET_CATEGORIES: AssetCategory[] = ['BANK_SAVINGS', 'REAL_ESTATE', 'COMPANY', 'VEHICLE', 'OTHER'];
const PROPERTY_TYPES: PropertyType[] = ['BOSTADSRATT', 'VILLA', 'FASTIGHET', 'FRITIDSHUS'];
const VEHICLE_TYPES: VehicleType[] = ['BIL', 'BAT', 'MC', 'HUSVAGN', 'MOPED', 'SNOSKOTER', 'ANNAT'];

interface FaAssetCardProps {
  index: number;
  onRemove: () => void;
}

/** One asset (errand_fa_asset). Category-specific fields are shown conditionally. */
export const FaAssetCard: React.FC<FaAssetCardProps> = ({ index, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const category = watch(`assets.${index}.assetCategory` as const);

  return (
    <Card data-cy={`fa-asset-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:economy.asset.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-asset-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:economy.remove')}
        </Button>
      </header>

      <FormControl className="w-full max-w-[28rem]">
        <FormLabel htmlFor={`fa-asset-${index}-category`}>
          {t('financial-assistance:economy.asset.categoryLabel')}
        </FormLabel>
        <Select
          id={`fa-asset-${index}-category`}
          className="w-full"
          value={category || ''}
          onSelectValue={(next) =>
            setValue(`assets.${index}.assetCategory` as const, (next as AssetCategory | '') || '', {
              shouldDirty: true,
            })
          }
        >
          <Select.Option value="" disabled>
            {t('financial-assistance:economy.select')}
          </Select.Option>
          {ASSET_CATEGORIES.map((value) => (
            <Select.Option key={value} value={value}>
              {t(`financial-assistance:assetCategory.${value}`)}
            </Select.Option>
          ))}
        </Select>
      </FormControl>

      {/* Bankmedel/sparande — beskrivning + värde */}
      {category === 'BANK_SAVINGS' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-description`}>
              {t('financial-assistance:economy.asset.descriptionLabel')}
            </FormLabel>
            <Input id={`fa-asset-${index}-description`} {...register(`assets.${index}.description` as const)} />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-value`}>
              {t('financial-assistance:economy.asset.valueLabel')}
            </FormLabel>
            <Input
              id={`fa-asset-${index}-value`}
              type="number"
              min={0}
              {...register(`assets.${index}.value` as const, numberFieldOptions)}
            />
          </FormControl>
        </div>
      ) : null}

      {/* Övriga tillgångar (konst, smycken m.m.) — ange vad + värde */}
      {category === 'OTHER' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-description`}>
              {t('financial-assistance:economy.asset.whatLabel')}
            </FormLabel>
            <Input id={`fa-asset-${index}-description`} {...register(`assets.${index}.description` as const)} />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-value`}>
              {t('financial-assistance:economy.asset.valueLabel')}
            </FormLabel>
            <Input
              id={`fa-asset-${index}-value`}
              type="number"
              min={0}
              {...register(`assets.${index}.value` as const, numberFieldOptions)}
            />
          </FormControl>
        </div>
      ) : null}

      {/* Fastighet — typ, inköpsår, inköpspris (ingen beskrivning/värde) */}
      {category === 'REAL_ESTATE' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-property-type`}>
              {t('financial-assistance:economy.asset.propertyTypeLabel')}
            </FormLabel>
            <Select
              id={`fa-asset-${index}-property-type`}
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
            <FormLabel htmlFor={`fa-asset-${index}-purchase-year`}>
              {t('financial-assistance:economy.asset.purchaseYearLabel')}
            </FormLabel>
            <Input
              id={`fa-asset-${index}-purchase-year`}
              type="number"
              {...register(`assets.${index}.purchaseYear` as const, numberFieldOptions)}
            />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-purchase-price`}>
              {t('financial-assistance:economy.asset.purchasePriceLabel')}
            </FormLabel>
            <Input
              id={`fa-asset-${index}-purchase-price`}
              type="number"
              min={0}
              {...register(`assets.${index}.purchasePrice` as const, numberFieldOptions)}
            />
          </FormControl>
        </div>
      ) : null}

      {/* Företag — namn + summa tillgångar (ingen beskrivning/värde) */}
      {category === 'COMPANY' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-company-name`}>
              {t('financial-assistance:economy.asset.companyNameLabel')}
            </FormLabel>
            <Input id={`fa-asset-${index}-company-name`} {...register(`assets.${index}.companyName` as const)} />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-asset-${index}-company-sum`}>
              {t('financial-assistance:economy.asset.companyAssetSumLabel')}
            </FormLabel>
            <Input
              id={`fa-asset-${index}-company-sum`}
              type="number"
              min={0}
              {...register(`assets.${index}.companyAssetSum` as const, numberFieldOptions)}
            />
          </FormControl>
        </div>
      ) : null}

      {/* Fordon — typ, regnr (ej tvingande), inköpsdatum, inköpspris, värde (ingen beskrivning) */}
      {category === 'VEHICLE' ? (
        <>
          <div className="grid grid-cols-1 desktop:grid-cols-3 gap-16">
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-asset-${index}-vehicle-type`}>
                {t('financial-assistance:economy.asset.vehicleTypeLabel')}
              </FormLabel>
              <Select
                id={`fa-asset-${index}-vehicle-type`}
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
              <FormLabel htmlFor={`fa-asset-${index}-registration`}>
                {t('financial-assistance:economy.asset.registrationNumberLabel')}
              </FormLabel>
              <Input
                id={`fa-asset-${index}-registration`}
                {...register(`assets.${index}.registrationNumber` as const)}
              />
            </FormControl>
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-asset-${index}-purchase-date`}>
                {t('financial-assistance:economy.asset.purchaseDateLabel')}
              </FormLabel>
              <Input
                id={`fa-asset-${index}-purchase-date`}
                type="date"
                {...register(`assets.${index}.purchaseDate` as const)}
              />
            </FormControl>
          </div>
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-asset-${index}-vehicle-price`}>
                {t('financial-assistance:economy.asset.purchasePriceLabel')}
              </FormLabel>
              <Input
                id={`fa-asset-${index}-vehicle-price`}
                type="number"
                min={0}
                {...register(`assets.${index}.purchasePrice` as const, numberFieldOptions)}
              />
            </FormControl>
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-asset-${index}-vehicle-value`}>
                {t('financial-assistance:economy.asset.valueLabel')}
              </FormLabel>
              <Input
                id={`fa-asset-${index}-vehicle-value`}
                type="number"
                min={0}
                {...register(`assets.${index}.value` as const, numberFieldOptions)}
              />
            </FormControl>
          </div>
        </>
      ) : null}
    </Card>
  );
};

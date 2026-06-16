import {
  FinancialAssistanceFormData,
  PlanningType,
  SfiCourse,
  SfiStudyPath,
  SickLeaveLevel,
  WorkExtent,
} from '@interfaces/financial-assistance';
import { Button, Card, FormControl, FormLabel, Icon, Input, Select } from '@sk-web-gui/react';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const PLANNING_TYPES: PlanningType[] = ['WORK', 'JOBSEEKING', 'SICK_LEAVE', 'SFI', 'OTHER'];
const WORK_EXTENTS: WorkExtent[] = ['FULL', 'PART'];
const SICK_LEAVE_LEVELS: SickLeaveLevel[] = ['100', '75', '50', '25'];
const SFI_STUDY_PATHS: SfiStudyPath[] = ['1', '2', '3'];
const SFI_COURSES: SfiCourse[] = ['A', 'B', 'C', 'D'];

const Info: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-small text-dark-secondary">{children}</p>
);

const Warning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p role="note" className="bg-warning-background-200 rounded-button px-14 py-12 text-small">
    {children}
  </p>
);

interface FaPlanningCardProps {
  index: number;
  onRemove: () => void;
}

/**
 * One planning entry (errand_fa_planning). Fields depend on planningType. Vem planeringen avser
 * styrs av sektionen i steget (sökande/medsökande) — därför finns ingen personväljare här.
 */
export const FaPlanningCard: React.FC<FaPlanningCardProps> = ({ index, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const planningType = watch(`plannings.${index}.planningType` as const);
  const workExtent = watch(`plannings.${index}.workExtent` as const);
  const sickLevel = watch(`plannings.${index}.sickLeaveLevel` as const);

  return (
    <Card data-cy={`fa-planning-${index}`} className="flex flex-col gap-16 p-24">
      <header className="flex items-center justify-between gap-8">
        <h4 className="text-h5-md font-bold">
          {t('financial-assistance:planning.planning.heading', { number: index + 1 })}
        </h4>
        <Button
          variant="link"
          size="sm"
          color="error"
          data-cy={`fa-planning-${index}-remove`}
          onClick={onRemove}
          leftIcon={<Icon icon={<X />} />}
        >
          {t('financial-assistance:planning.remove')}
        </Button>
      </header>

      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-planning-${index}-type`}>{t('financial-assistance:planning.typeLabel')}</FormLabel>
          <Select
            id={`fa-planning-${index}-type`}
            className="w-full"
            value={planningType || ''}
            onSelectValue={(next) =>
              setValue(`plannings.${index}.planningType` as const, (next as PlanningType | '') || '', {
                shouldDirty: true,
              })
            }
          >
            <Select.Option value="" disabled>
              {t('financial-assistance:economy.select')}
            </Select.Option>
            {PLANNING_TYPES.map((value) => (
              <Select.Option key={value} value={value}>
                {t(`financial-assistance:planningType.${value}`)}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      </div>

      {planningType === 'WORK' ? (
        <div className="flex flex-col gap-16">
          <FormControl className="w-full max-w-[20rem]">
            <FormLabel htmlFor={`fa-planning-${index}-work-extent`}>
              {t('financial-assistance:planning.workExtentLabel')}
            </FormLabel>
            <Select
              id={`fa-planning-${index}-work-extent`}
              className="w-full"
              value={workExtent || ''}
              onSelectValue={(next) =>
                setValue(`plannings.${index}.workExtent` as const, (next as WorkExtent | '') || '', {
                  shouldDirty: true,
                })
              }
            >
              <Select.Option value="" disabled>
                {t('financial-assistance:economy.select')}
              </Select.Option>
              {WORK_EXTENTS.map((value) => (
                <Select.Option key={value} value={value}>
                  {t(`financial-assistance:workExtent.${value}`)}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
          {/* Heltid behöver ingen beskrivning; deltid ska ange omfattning + varning om heltidsplanering. */}
          {workExtent === 'PART' ? (
            <>
              <Warning>{t('financial-assistance:planning.info.partTimeWarning')}</Warning>
              <FormControl className="w-full">
                <FormLabel htmlFor={`fa-planning-${index}-work-description`}>
                  {t('financial-assistance:planning.workDescriptionLabel')}
                </FormLabel>
                <Input
                  id={`fa-planning-${index}-work-description`}
                  {...register(`plannings.${index}.workDescription` as const)}
                />
              </FormControl>
            </>
          ) : null}
        </div>
      ) : null}

      {planningType === 'JOBSEEKING' ? <Info>{t('financial-assistance:planning.info.jobseeking')}</Info> : null}

      {planningType === 'SICK_LEAVE' ? (
        <div className="flex flex-col gap-16">
          <Info>{t('financial-assistance:planning.info.sickLeave')}</Info>
          <FormControl className="w-full max-w-[20rem]">
            <FormLabel htmlFor={`fa-planning-${index}-sick-level`}>
              {t('financial-assistance:planning.sickLeaveLevelLabel')}
            </FormLabel>
            <Select
              id={`fa-planning-${index}-sick-level`}
              className="w-full"
              value={sickLevel || ''}
              onSelectValue={(next) =>
                setValue(`plannings.${index}.sickLeaveLevel` as const, (next as SickLeaveLevel | '') || '', {
                  shouldDirty: true,
                })
              }
            >
              <Select.Option value="" disabled>
                {t('financial-assistance:economy.select')}
              </Select.Option>
              {SICK_LEAVE_LEVELS.map((value) => (
                <Select.Option key={value} value={value}>
                  {value} %
                </Select.Option>
              ))}
            </Select>
          </FormControl>
          {/* Deltidssjukskrivning (75/50/25 %) kräver ytterligare planering för att nå heltid. */}
          {sickLevel && sickLevel !== '100' ? (
            <Warning>{t('financial-assistance:planning.info.partialSickWarning')}</Warning>
          ) : null}
        </div>
      ) : null}

      {planningType === 'SFI' ? (
        <div className="flex flex-col gap-16">
          <Info>{t('financial-assistance:planning.info.sfi')}</Info>
          <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-planning-${index}-sfi-path`}>
                {t('financial-assistance:planning.sfiStudyPathLabel')}
              </FormLabel>
              <Select
                id={`fa-planning-${index}-sfi-path`}
                className="w-full"
                value={watch(`plannings.${index}.sfiStudyPath` as const) || ''}
                onSelectValue={(next) =>
                  setValue(`plannings.${index}.sfiStudyPath` as const, (next as SfiStudyPath | '') || '', {
                    shouldDirty: true,
                  })
                }
              >
                <Select.Option value="" disabled>
                  {t('financial-assistance:economy.select')}
                </Select.Option>
                {SFI_STUDY_PATHS.map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-planning-${index}-sfi-course`}>
                {t('financial-assistance:planning.sfiCourseLabel')}
              </FormLabel>
              <Select
                id={`fa-planning-${index}-sfi-course`}
                className="w-full"
                value={watch(`plannings.${index}.sfiCourse` as const) || ''}
                onSelectValue={(next) =>
                  setValue(`plannings.${index}.sfiCourse` as const, (next as SfiCourse | '') || '', { shouldDirty: true })
                }
              >
                <Select.Option value="" disabled>
                  {t('financial-assistance:economy.select')}
                </Select.Option>
                {SFI_COURSES.map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      ) : null}

      {planningType === 'OTHER' ? (
        <FormControl className="w-full">
          <FormLabel htmlFor={`fa-planning-${index}-other`}>
            {t('financial-assistance:planning.otherDescriptionLabel')}
          </FormLabel>
          <Input id={`fa-planning-${index}-other`} {...register(`plannings.${index}.otherDescription` as const)} />
        </FormControl>
      ) : null}
    </Card>
  );
};

import {
  FinancialAssistanceFormData,
  PlanningType,
  SfiCourse,
  SfiStudyPath,
  SickLeaveLevel,
  WorkExtent,
} from '@interfaces/financial-assistance';
import { FormControl, FormLabel, Input, Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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

interface FaPlanningFieldsProps {
  index: number;
  planningType: PlanningType;
}

/**
 * Typspecifika fält för en planeringspost (errand_fa_planning). Typen styrs av rutan i
 * planeringsväljaren. JOBSEEKING-typens aktiviteter/sökta jobb hanteras separat i väljaren.
 */
export const FaPlanningFields: React.FC<FaPlanningFieldsProps> = ({ index, planningType }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();
  const fieldId = `fa-planning-${index}`;

  if (planningType === 'WORK') {
    const workExtent = watch(`plannings.${index}.workExtent` as const);
    return (
      <div className="flex flex-col gap-16">
        <FormControl className="w-full max-w-[20rem]">
          <FormLabel htmlFor={`${fieldId}-work-extent`}>{t('financial-assistance:planning.workExtentLabel')}</FormLabel>
          <Select
            id={`${fieldId}-work-extent`}
            className="w-full"
            value={workExtent || ''}
            onSelectValue={(next) =>
              setValue(`plannings.${index}.workExtent` as const, (next as WorkExtent | '') || '', { shouldDirty: true })
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
        {workExtent === 'PART' ? (
          <>
            <Warning>{t('financial-assistance:planning.info.partTimeWarning')}</Warning>
            <FormControl className="w-full">
              <FormLabel htmlFor={`${fieldId}-work-description`}>
                {t('financial-assistance:planning.workDescriptionLabel')}
              </FormLabel>
              <Input id={`${fieldId}-work-description`} {...register(`plannings.${index}.workDescription` as const)} />
            </FormControl>
          </>
        ) : null}
      </div>
    );
  }

  if (planningType === 'JOBSEEKING') {
    return <Info>{t('financial-assistance:planning.info.jobseeking')}</Info>;
  }

  if (planningType === 'SICK_LEAVE') {
    const sickLevel = watch(`plannings.${index}.sickLeaveLevel` as const);
    return (
      <div className="flex flex-col gap-16">
        <Info>{t('financial-assistance:planning.info.sickLeave')}</Info>
        <FormControl className="w-full max-w-[20rem]">
          <FormLabel htmlFor={`${fieldId}-sick-level`}>
            {t('financial-assistance:planning.sickLeaveLevelLabel')}
          </FormLabel>
          <Select
            id={`${fieldId}-sick-level`}
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
        {sickLevel && sickLevel !== '100' ? (
          <Warning>{t('financial-assistance:planning.info.partialSickWarning')}</Warning>
        ) : null}
      </div>
    );
  }

  if (planningType === 'SFI') {
    return (
      <div className="flex flex-col gap-16">
        <Info>{t('financial-assistance:planning.info.sfi')}</Info>
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`${fieldId}-sfi-path`}>{t('financial-assistance:planning.sfiStudyPathLabel')}</FormLabel>
            <Select
              id={`${fieldId}-sfi-path`}
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
            <FormLabel htmlFor={`${fieldId}-sfi-course`}>{t('financial-assistance:planning.sfiCourseLabel')}</FormLabel>
            <Select
              id={`${fieldId}-sfi-course`}
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
    );
  }

  // OTHER
  return (
    <FormControl className="w-full">
      <FormLabel htmlFor={`${fieldId}-other`}>{t('financial-assistance:planning.otherDescriptionLabel')}</FormLabel>
      <Input id={`${fieldId}-other`} {...register(`plannings.${index}.otherDescription` as const)} />
    </FormControl>
  );
};

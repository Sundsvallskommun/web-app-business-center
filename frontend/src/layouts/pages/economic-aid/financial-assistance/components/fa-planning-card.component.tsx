import {
  FinancialAssistanceFormData,
  PersonRole,
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
const PERSON_ROLES: PersonRole[] = ['APPLICANT', 'CO_APPLICANT'];

interface FaPlanningCardProps {
  index: number;
  showPerson: boolean;
  onRemove: () => void;
}

/** One planning entry per person (errand_fa_planning). Fields depend on planningType. */
export const FaPlanningCard: React.FC<FaPlanningCardProps> = ({ index, showPerson, onRemove }) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue } = useFormContext<FinancialAssistanceFormData>();

  const planningType = watch(`plannings.${index}.planningType` as const);

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
        {showPerson ? (
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-person`}>{t('financial-assistance:planning.personLabel')}</FormLabel>
            <Select
              id={`fa-planning-${index}-person`}
              className="w-full"
              value={watch(`plannings.${index}.person` as const) || ''}
              onSelectValue={(next) =>
                setValue(`plannings.${index}.person` as const, (next as PersonRole | '') || '', { shouldDirty: true })
              }
            >
              <Select.Option value="" disabled>
                {t('financial-assistance:economy.select')}
              </Select.Option>
              {PERSON_ROLES.map((value) => (
                <Select.Option key={value} value={value}>
                  {t(`financial-assistance:recipient.${value}`)}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        ) : null}

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
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-work-extent`}>
              {t('financial-assistance:planning.workExtentLabel')}
            </FormLabel>
            <Select
              id={`fa-planning-${index}-work-extent`}
              className="w-full"
              value={watch(`plannings.${index}.workExtent` as const) || ''}
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
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-work-description`}>
              {t('financial-assistance:planning.workDescriptionLabel')}
            </FormLabel>
            <Input
              id={`fa-planning-${index}-work-description`}
              {...register(`plannings.${index}.workDescription` as const)}
            />
          </FormControl>
        </div>
      ) : null}

      {planningType === 'SICK_LEAVE' ? (
        <div className="grid grid-cols-1 desktop:grid-cols-3 gap-16">
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-sick-level`}>
              {t('financial-assistance:planning.sickLeaveLevelLabel')}
            </FormLabel>
            <Select
              id={`fa-planning-${index}-sick-level`}
              className="w-full"
              value={watch(`plannings.${index}.sickLeaveLevel` as const) || ''}
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
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-sick-from`}>
              {t('financial-assistance:planning.sickFromLabel')}
            </FormLabel>
            <Input id={`fa-planning-${index}-sick-from`} type="date" {...register(`plannings.${index}.sickFrom` as const)} />
          </FormControl>
          <FormControl className="w-full">
            <FormLabel htmlFor={`fa-planning-${index}-sick-to`}>
              {t('financial-assistance:planning.sickToLabel')}
            </FormLabel>
            <Input id={`fa-planning-${index}-sick-to`} type="date" {...register(`plannings.${index}.sickTo` as const)} />
          </FormControl>
        </div>
      ) : null}

      {planningType === 'SFI' ? (
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

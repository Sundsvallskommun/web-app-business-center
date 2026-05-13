import { Checkbox, FormControl, FormErrorMessage, Icon, List } from '@sk-web-gui/react';
import { Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SignMandateDetails } from 'src/data-contracts/backend/data-contracts';

export const CreateMandateFormAgreement: React.FC = () => {
  const { t } = useTranslation();

  const {
    register,
    formState: { errors },
  } = useFormContext<SignMandateDetails & { agree: boolean }>();

  return (
    <FormControl
      className="bg-warning-background-200 pt-12 pb-18 px-14 rounded-button flex flex-col gap-12 my-16"
      fieldset
      size="md"
    >
      <List listStyle="bullet">
        <List.Item className="p-0 before:!m-0">
          <List.Text>{t('profile:mandates.agreement.bullets.1')}</List.Text>
        </List.Item>
        <List.Item className="p-0 before:!m-0">
          <List.Text>{t('profile:mandates.agreement.bullets.2')}</List.Text>
        </List.Item>
        <List.Item className="p-0 before:!m-0">
          <List.Text>{t('profile:mandates.agreement.bullets.3')}</List.Text>
        </List.Item>
      </List>
      <Checkbox data-cy="create-mandate-agreement" {...register('agree')}>
        {t('profile:mandates.properties.agree')}
      </Checkbox>
      {errors?.agree && (
        <FormErrorMessage
          data-cy="create-mandate-agreement-error"
          className="text-error flex flex-row items-center justify-start gap-8"
        >
          <Icon icon={<Info />} size="1.6rem" />
          {t(errors.agree.message as string)}
        </FormErrorMessage>
      )}
    </FormControl>
  );
};

import { FA_FIELD_MAX_LENGTH, FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, Input, Modal } from '@sk-web-gui/react';
import { Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type EmailField = 'contactEmail' | 'coApplicantEmail';
type PhoneField = 'contactPhone' | 'coApplicantPhone';

interface FaContactDetailsProps {
  emailField: EmailField;
  phoneField: PhoneField;
  /** Kanalen är vald — uppgiften visas och kan redigeras. */
  showEmail: boolean;
  showPhone: boolean;
}

/**
 * Personens kontaktuppgifter (telefonnummer och e-postadress), förifyllda från Mina sidor
 * (contactsettings). Uppgifterna visas som text; "Ändra kontaktuppgifter" öppnar en dialog där
 * båda kan redigeras. "Spara" stänger dialogen med de nya värdena, "Avbryt" (och krysset)
 * återställer dem. Värdena skrivs tillbaka till personens contactsettings vid inskick.
 */
export const FaContactDetails: React.FC<FaContactDetailsProps> = ({
  emailField,
  phoneField,
  showEmail,
  showPhone,
}) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue, getValues } = useFormContext<FinancialAssistanceFormData>();
  const [isEditing, setIsEditing] = useState(false);
  // Värdena innan dialogen öppnades — "Avbryt" återställer till dessa.
  const valuesBeforeEdit = useRef({ email: '', phone: '' });

  const email = watch(emailField);
  const phone = watch(phoneField);

  const startEditing = () => {
    valuesBeforeEdit.current = { email: getValues(emailField), phone: getValues(phoneField) };
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setValue(emailField, valuesBeforeEdit.current.email, { shouldDirty: true });
    setValue(phoneField, valuesBeforeEdit.current.phone, { shouldDirty: true });
    setIsEditing(false);
  };

  const detail = (label: string, value: string, dataCy: string) => (
    <div className="flex flex-col" data-cy={dataCy}>
      <span className="font-bold">{label}</span>
      <span>{value || '—'}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-16" data-cy={`fa-contact-details-${emailField}`}>
      <div className="flex flex-col gap-4">
        <span className="font-bold">{t('financial-assistance:personuppgifter.contactHeading')}</span>
        <p className="text-small text-dark-secondary">{t('financial-assistance:personuppgifter.contactInfo')}</p>
      </div>

      {showPhone
        ? detail(t('financial-assistance:personuppgifter.phoneLabel'), phone, `fa-${phoneField}-value`)
        : null}
      {showEmail
        ? detail(t('financial-assistance:personuppgifter.emailLabel'), email, `fa-${emailField}-value`)
        : null}

      <div>
        <Button
          variant="secondary"
          size="sm"
          data-cy={`fa-contact-edit-${emailField}`}
          onClick={startEditing}
          leftIcon={<Icon icon={<Pencil />} />}
        >
          {t('financial-assistance:personuppgifter.editContact')}
        </Button>
      </div>

      <Modal
        show={isEditing}
        onClose={cancelEditing}
        label={t('financial-assistance:personuppgifter.editContact')}
        data-cy={`fa-contact-modal-${emailField}`}
      >
        <Modal.Content className="flex flex-col gap-16">
          <p className="text-content">{t('financial-assistance:personuppgifter.contactInfo')}</p>

          {showPhone ? (
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-${phoneField}`}>
                {t('financial-assistance:personuppgifter.phoneLabel')}
              </FormLabel>
              <Input
                id={`fa-${phoneField}`}
                inputMode="tel"
                maxLength={FA_FIELD_MAX_LENGTH.phone}
                data-cy={`fa-${phoneField}`}
                {...register(phoneField)}
              />
            </FormControl>
          ) : null}

          {showEmail ? (
            <FormControl className="w-full">
              <FormLabel htmlFor={`fa-${emailField}`}>
                {t('financial-assistance:personuppgifter.emailLabel')}
              </FormLabel>
              <Input
                id={`fa-${emailField}`}
                type="email"
                maxLength={FA_FIELD_MAX_LENGTH.email}
                data-cy={`fa-${emailField}`}
                {...register(emailField)}
              />
            </FormControl>
          ) : null}
        </Modal.Content>
        <Modal.Footer className="flex flex-col md:flex-row">
          <Button variant="secondary" onClick={cancelEditing} data-cy={`fa-contact-cancel-${emailField}`}>
            {t('financial-assistance:personuppgifter.cancelEdit')}
          </Button>
          <Button color="vattjom" onClick={() => setIsEditing(false)} data-cy={`fa-contact-save-${emailField}`}>
            {t('financial-assistance:personuppgifter.save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

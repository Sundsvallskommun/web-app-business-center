import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type ContactFieldName = 'contactEmail' | 'coApplicantEmail' | 'contactPhone' | 'coApplicantPhone';

interface FaEditableContactFieldProps {
  name: ContactFieldName;
  label: string;
  maxLength: number;
  type?: 'email' | 'text';
  inputMode?: 'tel';
}

/**
 * Kontaktuppgift som förifylls från Mina sidor (contactsettings) och visas låst. "Ändra" låser upp
 * fältet och sätter fokus i det; när fältet tappar fokus låses det igen och värdet ligger kvar i
 * ansökan. Ändringen skrivs tillbaka till personens contactsettings när ansökan skickas in.
 */
export const FaEditableContactField: React.FC<FaEditableContactFieldProps> = ({
  name,
  label,
  maxLength,
  type,
  inputMode,
}) => {
  const { t } = useTranslation('financial-assistance');
  const { register, setFocus } = useFormContext<FinancialAssistanceFormData>();
  const [isEditing, setIsEditing] = useState(false);
  // onBlur tas ut ur register så att vi kan låsa fältet och ändå köra react-hook-forms egen hantering.
  const { onBlur, ...field } = register(name);

  useEffect(() => {
    if (isEditing) setFocus(name);
  }, [isEditing, name, setFocus]);

  return (
    <FormControl className="w-full">
      <FormLabel htmlFor={`fa-${name}`}>{label}</FormLabel>
      <div className="flex items-end gap-8">
        <Input
          id={`fa-${name}`}
          className="grow"
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          readOnly={!isEditing}
          data-cy={`fa-${name}`}
          {...field}
          onBlur={(event) => {
            setIsEditing(false);
            return onBlur(event);
          }}
        />
        {!isEditing ? (
          <Button
            variant="secondary"
            size="sm"
            data-cy={`fa-${name}-edit`}
            aria-label={t('financial-assistance:personuppgifter.editFieldLabel', { field: label })}
            onClick={() => setIsEditing(true)}
            leftIcon={<Icon icon={<Pencil />} />}
          >
            {t('financial-assistance:personuppgifter.edit')}
          </Button>
        ) : null}
      </div>
    </FormControl>
  );
};

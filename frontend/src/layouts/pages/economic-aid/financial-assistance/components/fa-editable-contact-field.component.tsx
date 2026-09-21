import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { Button, FormControl, FormLabel, Icon, Input } from '@sk-web-gui/react';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
 * Kontaktuppgift som förifylls från Mina sidor (contactsettings). Uppgiften visas som vanlig text
 * tills man trycker "Ändra" — då byts den mot ett inmatningsfält med knapparna "Spara" och
 * "Avbryt". Värdet behålls när man sparar eller lämnar fältet (blur); "Avbryt" återställer det
 * tidigare värdet. Ändringen skrivs tillbaka till personens contactsettings vid inskick.
 */
export const FaEditableContactField: React.FC<FaEditableContactFieldProps> = ({
  name,
  label,
  maxLength,
  type,
  inputMode,
}) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue, getValues, setFocus } = useFormContext<FinancialAssistanceFormData>();
  const [isEditing, setIsEditing] = useState(false);
  // Värdet innan redigeringen började — "Avbryt" återställer till detta.
  const valueBeforeEdit = useRef('');
  const value = watch(name);
  // onBlur tas ut ur register så att vi kan låsa fältet och ändå köra react-hook-forms egen hantering.
  const { onBlur, ...field } = register(name);

  useEffect(() => {
    if (isEditing) setFocus(name);
  }, [isEditing, name, setFocus]);

  const startEditing = () => {
    valueBeforeEdit.current = getValues(name);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setValue(name, valueBeforeEdit.current, { shouldDirty: true });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-8" data-cy={`fa-${name}-value`}>
        <div className="flex flex-col">
          <span className="text-small text-dark-secondary">{label}</span>
          <span className="font-bold">{value || '—'}</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          data-cy={`fa-${name}-edit`}
          aria-label={t('financial-assistance:personuppgifter.editFieldLabel', { field: label })}
          onClick={startEditing}
          leftIcon={<Icon icon={<Pencil />} />}
        >
          {t('financial-assistance:personuppgifter.edit')}
        </Button>
      </div>
    );
  }

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
          data-cy={`fa-${name}`}
          {...field}
          onBlur={(event) => {
            setIsEditing(false);
            return onBlur(event);
          }}
          onKeyDown={(event) => {
            // Enter sparar (och låser) fältet i stället för att skicka in formuläret; Escape avbryter.
            if (event.key === 'Enter') {
              event.preventDefault();
              setIsEditing(false);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              cancelEditing();
            }
          }}
        />
        {/* onMouseDown hindrar att fältets blur hinner låsa fältet innan klicket når knapparna. */}
        <Button
          variant="primary"
          size="sm"
          data-cy={`fa-${name}-save`}
          aria-label={t('financial-assistance:personuppgifter.saveFieldLabel', { field: label })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsEditing(false)}
        >
          {t('financial-assistance:personuppgifter.save')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          data-cy={`fa-${name}-cancel`}
          aria-label={t('financial-assistance:personuppgifter.cancelEditFieldLabel', { field: label })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEditing}
        >
          {t('financial-assistance:personuppgifter.cancelEdit')}
        </Button>
      </div>
    </FormControl>
  );
};

import { ApplicantProfile } from '@interfaces/economic-aid';
import { FinancialAssistanceFormData } from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { Checkbox, Divider, FormControl, FormErrorMessage, FormLabel } from '@sk-web-gui/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaContactDetails } from './fa-contact-details.component';

type EmailField = 'contactEmail' | 'coApplicantEmail';
type PhoneField = 'contactPhone' | 'coApplicantPhone';
type NotifyEmailField = 'notifyByEmail' | 'coNotifyByEmail';
type NotifySmsField = 'notifyBySms' | 'coNotifyBySms';

interface FaContactSectionProps {
  heading: string;
  notifyLabel: string;
  /** Backend URL for this person's profile (applicant-profile or co-applicant-profile?personnummer=). */
  profileUrl: string;
  emailField: EmailField;
  phoneField: PhoneField;
  notifyEmailField: NotifyEmailField;
  notifySmsField: NotifySmsField;
}

/**
 * Kontaktuppgifter + notisval för en person (sökande eller medsökande). Personnummer och adress
 * visas skrivskyddat; telefonnummer och e-postadress förifylls från Mina sidor, visas som text och
 * redigeras i en dialog (FaContactDetails). Notisvalet (minst en kanal) sparas på personens
 * stakeholder i caremanagement, och ändrade kontaktuppgifter synkas tillbaka till personens
 * contactsettings vid inskick.
 */
export const FaContactSection: React.FC<FaContactSectionProps> = ({
  heading,
  notifyLabel,
  profileUrl,
  emailField,
  phoneField,
  notifyEmailField,
  notifySmsField,
}) => {
  const { t } = useTranslation('financial-assistance');
  const { register, watch, setValue, getValues } = useFormContext<FinancialAssistanceFormData>();

  const profileApi = useApi<ApplicantProfile>({ url: profileUrl, method: 'get' });
  const profile = profileApi.data;
  const address = profile?.folkbokforingsadress ?? null;

  const notifyByEmail = watch(notifyEmailField);
  const notifyBySms = watch(notifySmsField);
  const notifyMissing = !notifyByEmail && !notifyBySms;

  // Förifyll e-post/telefon från personens contactsettings. Bara tomma fält fylls i, så en uppgift
  // som sökanden redan ändrat i ansökan skrivs inte över när profilen laddas om.
  useEffect(() => {
    if (!profile) return;
    if (profile.epost && getValues(emailField) === '') setValue(emailField, profile.epost, { shouldDirty: false });
    if (profile.telefon && getValues(phoneField) === '') setValue(phoneField, profile.telefon, { shouldDirty: false });
  }, [profile, emailField, phoneField, getValues, setValue]);

  return (
    <section className="flex flex-col gap-16 text-content" data-cy={`fa-contact-${emailField}`}>
      <h3 className="text-h4-md font-bold">{heading}</h3>

      <div className="flex flex-col">
        <span className="text-small text-dark-secondary">{t('financial-assistance:personuppgifter.nameLabel')}</span>
        <span className="font-bold">{[profile?.fornamn, profile?.efternamn].filter(Boolean).join(' ') || '—'}</span>
      </div>

      <div className="flex flex-col">
        <span className="text-small text-dark-secondary">{t('financial-assistance:personuppgifter.personnummerLabel')}</span>
        <span className="font-bold">{profile?.personnummer || '—'}</span>
      </div>

      {address ? (
        <div className="flex flex-col">
          <span className="text-small text-dark-secondary">{t('financial-assistance:personuppgifter.addressLabel')}</span>
          <span className="font-bold">
            {[address.gatuadress, [address.postnummer, address.postort].filter(Boolean).join(' ')]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>
      ) : null}

      {/* Notisval — högst upp i kontaktdelen */}
      <FormControl invalid={notifyMissing}>
        <FormLabel className="font-bold">{notifyLabel}</FormLabel>
        <p className="text-small text-dark-secondary mb-8">{t('financial-assistance:personuppgifter.notifyInfo')}</p>
        <div className="flex flex-col gap-8">
          <Checkbox {...register(notifySmsField)}>{t('financial-assistance:personuppgifter.notifySms')}</Checkbox>
          <Checkbox {...register(notifyEmailField)}>{t('financial-assistance:personuppgifter.notifyEmail')}</Checkbox>
        </div>
        {notifyMissing ? (
          <FormErrorMessage className="text-error">
            {t('financial-assistance:personuppgifter.notifyRequired')}
          </FormErrorMessage>
        ) : null}
      </FormControl>

      {/* Kontaktuppgifter — en uppgift visas bara när dess notiskanal är vald. */}
      {notifyByEmail || notifyBySms ? (
        <FaContactDetails
          emailField={emailField}
          phoneField={phoneField}
          showEmail={notifyByEmail}
          showPhone={notifyBySms}
        />
      ) : null}

      <Divider />
    </section>
  );
};

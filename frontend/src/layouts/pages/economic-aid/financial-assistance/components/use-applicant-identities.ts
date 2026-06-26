import { ApplicantAddress, ApplicantProfile } from '@interfaces/economic-aid';
import { useApi } from '@services/api-service';
import { ApplicantIdentities, PersonIdentity } from '@services/financial-assistance-pdf-summary';

const formatAddress = (address: ApplicantAddress | null): string => {
  if (!address) return '';
  const cityLine = [address.postnummer, address.postort].filter(Boolean).join(' ').trim();
  return [address.gatuadress, cityLine].filter(Boolean).join(', ');
};

const toIdentity = (profile?: ApplicantProfile): PersonIdentity | undefined => {
  if (!profile) return undefined;
  return {
    name: [profile.fornamn, profile.efternamn].filter(Boolean).join(' ').trim(),
    personnummer: profile.personnummer ?? '',
    folkbokforing: formatAddress(profile.folkbokforingsadress),
  };
};

/**
 * Citizen-derived identities (name + personnummer + folkbokföringsadress) for the applicant and,
 * when cohabiting, the co-applicant — used to show the same person details in the on-screen preview
 * and the form snapshot that the backend also adds to the PDF. Reuses the same profile endpoints as
 * the contact step, so react-query serves them from cache (no extra requests).
 *
 * Takes the marital state and co-applicant personnummer as arguments (not via useFormContext) so it
 * also works in the wizard shell component that *provides* the form context.
 */
export const useApplicantIdentities = ({
  isCohabiting,
  coApplicantPersonalNumber,
}: {
  isCohabiting: boolean;
  coApplicantPersonalNumber: string;
}): ApplicantIdentities => {
  const coPnr = coApplicantPersonalNumber.trim();

  const applicantApi = useApi<ApplicantProfile>({ url: '/economic-aid/applicant-profile', method: 'get' });
  const coApplicantApi = useApi<ApplicantProfile>({
    url: `/economic-aid/co-applicant-profile?personnummer=${encodeURIComponent(coPnr)}`,
    method: 'get',
    queryOptions: { enabled: isCohabiting && coPnr !== '' },
  });

  const identities: ApplicantIdentities = {};
  const applicant = toIdentity(applicantApi.data);
  if (applicant) identities.APPLICANT = applicant;
  const coApplicant = isCohabiting ? toIdentity(coApplicantApi.data) : undefined;
  if (coApplicant) identities.CO_APPLICANT = coApplicant;
  return identities;
};

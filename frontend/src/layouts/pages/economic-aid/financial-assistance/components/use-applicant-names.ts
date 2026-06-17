import { ApplicantProfile } from '@interfaces/economic-aid';
import { FinancialAssistanceFormData, PersonRole } from '@interfaces/financial-assistance';
import { useApi } from '@services/api-service';
import { useFormContext } from 'react-hook-form';

const fullNameOf = (profile?: ApplicantProfile): string =>
  [profile?.fornamn, profile?.efternamn].filter(Boolean).join(' ').trim();

/**
 * Slår upp namnen på sökande och (när man ansöker tillsammans) medsökande från deras Citizen-
 * profiler. Använder samma profil-URL:er som hushållssteget, så react-query återanvänder cachen
 * och inga extra anrop görs. Profilerna hämtas bara vid gift/sambo — där namnen faktiskt behövs
 * för att skilja personerna åt i UI:t.
 */
export const useApplicantNames = () => {
  const { watch } = useFormContext<FinancialAssistanceFormData>();
  const isCohabiting = watch('maritalStatus') === 'COHABITING';
  const coApplicantPersonalNumber = (
    watch('persons').find((person) => person.role === 'CO_APPLICANT')?.personalNumber ?? ''
  ).trim();

  const applicantApi = useApi<ApplicantProfile>({
    url: '/economic-aid/applicant-profile',
    method: 'get',
    queryOptions: { enabled: isCohabiting },
  });
  const coApplicantApi = useApi<ApplicantProfile>({
    url: `/economic-aid/co-applicant-profile?personnummer=${encodeURIComponent(coApplicantPersonalNumber)}`,
    method: 'get',
    queryOptions: { enabled: isCohabiting && coApplicantPersonalNumber !== '' },
  });

  const nameByRole: Record<PersonRole, string> = {
    APPLICANT: fullNameOf(applicantApi.data),
    CO_APPLICANT: fullNameOf(coApplicantApi.data),
  };

  return {
    isCohabiting,
    /** Personens namn när man ansöker tillsammans och namnet laddats, annars null (fall tillbaka på rollnamn). */
    nameForRole: (role: PersonRole): string | null => (isCohabiting && nameByRole[role] ? nameByRole[role] : null),
  };
};

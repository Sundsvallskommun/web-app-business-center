/**
 * DEV ONLY — testpersonväljare för ansökan om ekonomiskt bistånd.
 *
 * Fyller i hela formuläret med en mockad persona så att alla steg går att
 * gå igenom utan att skriva in 20 fält manuellt varje gång. Tas bort när
 * riktig SSBTEK-prefill är på plats. Hela komponenten är fristående —
 * radera filen och importen i economic-aid-application.component.tsx för
 * att städa bort.
 */
import {
  ECONOMIC_AID_SCHEMA_VERSION,
  EconomicAidApplicationV1,
  emptyEconomicAidApplication,
} from '@interfaces/economic-aid';
import { Select } from '@sk-web-gui/react';
import { useFormContext } from 'react-hook-form';

interface TestPerson {
  id: string;
  label: string;
  description: string;
  data: EconomicAidApplicationV1;
}

const buildPersona = (
  label: string,
  description: string,
  identitet: EconomicAidApplicationV1['identitet'],
  kind: EconomicAidApplicationV1['vagval']['kind'],
): TestPerson => ({
  id: identitet.personnummer,
  label,
  description,
  data: {
    ...emptyEconomicAidApplication(),
    schemaVersion: ECONOMIC_AID_SCHEMA_VERSION,
    vagval: { kind },
    identitet,
  },
});

// Personnummer och telefonnummer är hämtade ur officiellt reserverade
// testserier (Skatteverket / PTS):
// Inga riktiga uppgifter får läggas in i denna fil.
const TEST_PERSONS: TestPerson[] = [
  buildPersona(
    'Anna Andersson',
    'Ny ansökan, ensamstående, kontakt via SMS',
    {
      fornamn: 'Anna',
      efternamn: 'Andersson',
      personnummer: '20260101-2384',
      coAdress: '',
      gatuadress: 'Storgatan 12',
      postnummer: '852 30',
      postort: 'Sundsvall',
      epost: 'anna.andersson@example.se',
      mobiltelefon: '070-174 06 05',
      kontaktViaSms: true,
      ansoktSenaste3Manader: false,
      behoverTolk: false,
      tolkSprak: '',
    },
    'NEW',
  ),
  buildPersona(
    'Erik Eriksson',
    'Återansökan, sökt senaste 3 mån, ingen SMS-kontakt',
    {
      fornamn: 'Erik',
      efternamn: 'Eriksson',
      personnummer: '20260102-2383',
      coAdress: '',
      gatuadress: 'Norrmalmsgatan 5B',
      postnummer: '852 31',
      postort: 'Sundsvall',
      epost: 'erik.eriksson@example.se',
      mobiltelefon: '070-174 06 35',
      kontaktViaSms: false,
      ansoktSenaste3Manader: true,
      behoverTolk: false,
      tolkSprak: '',
    },
    'RETURNING',
  ),
  buildPersona(
    'Maria Karlsson',
    'Ny ansökan, c/o-adress, behöver tolk (arabiska)',
    {
      fornamn: 'Maria',
      efternamn: 'Karlsson',
      personnummer: '20260103-2382',
      coAdress: 'c/o Lindberg',
      gatuadress: 'Bergsgatan 3',
      postnummer: '854 60',
      postort: 'Sundsvall',
      epost: 'maria.karlsson@example.se',
      mobiltelefon: '070-174 06 47',
      kontaktViaSms: true,
      ansoktSenaste3Manader: false,
      behoverTolk: true,
      tolkSprak: 'Arabiska',
    },
    'NEW',
  ),
  buildPersona(
    'Fatima Hassan',
    'Återansökan, behöver tolk (somaliska), familj',
    {
      fornamn: 'Fatima',
      efternamn: 'Hassan',
      personnummer: '20260104-2381',
      coAdress: '',
      gatuadress: 'Skönsbergsvägen 14',
      postnummer: '856 41',
      postort: 'Sundsvall',
      epost: 'fatima.hassan@example.se',
      mobiltelefon: '070-174 06 73',
      kontaktViaSms: true,
      ansoktSenaste3Manader: true,
      behoverTolk: true,
      tolkSprak: 'Somaliska',
    },
    'RETURNING',
  ),
  buildPersona(
    'Bengt Bengtsson',
    'Ny ansökan, äldre sökande, ingen SMS-kontakt',
    {
      fornamn: 'Bengt',
      efternamn: 'Bengtsson',
      personnummer: '20260105-2380',
      coAdress: '',
      gatuadress: 'Trädgårdsgatan 8',
      postnummer: '852 32',
      postort: 'Sundsvall',
      epost: 'bengt.bengtsson@example.se',
      mobiltelefon: '',
      kontaktViaSms: false,
      ansoktSenaste3Manader: false,
      behoverTolk: false,
      tolkSprak: '',
    },
    'NEW',
  ),
];

export const TestPersonPicker: React.FC = () => {
  const { reset } = useFormContext<EconomicAidApplicationV1>();

  const apply = (id: string) => {
    const person = TEST_PERSONS.find((candidate) => candidate.id === id);
    if (!person) return;
    reset(person.data, { keepDefaultValues: false });
  };

  return (
    <aside
      data-cy="economic-aid-test-person-picker"
      aria-label="Dev: testdata"
      className="flex flex-wrap items-center gap-12 rounded-8 border border-dashed border-divider bg-background-200 px-12 py-8"
    >
      <span className="text-small font-bold uppercase tracking-wider text-dark-secondary whitespace-nowrap">
        Dev · testdata
      </span>
      <Select
        size="sm"
        className="min-w-[24rem] max-w-[60rem] flex-1"
        value=""
        onSelectValue={apply}
        data-cy="economic-aid-test-person-select"
      >
        <Select.Option value="" disabled>
          Välj testperson…
        </Select.Option>
        {TEST_PERSONS.map((person) => (
          <Select.Option key={person.id} value={person.id} title={person.description}>
            {person.label} — {person.description}
          </Select.Option>
        ))}
      </Select>
    </aside>
  );
};

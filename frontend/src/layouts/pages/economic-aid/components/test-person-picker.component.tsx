/**
 * DEV ONLY — testpersonväljare för ansökan om ekonomiskt bistånd.
 *
 * Fyller i de fält i formuläret som sökanden själv anger (kontakt, tolk
 * m.m.) så att alla steg går att gå igenom utan att skriva in varje
 * fält manuellt. Identitet/folkbokföring kommer från Citizen-API:t och
 * fylls inte i här. Tas bort när riktig SSBTEK-prefill är på plats —
 * radera filen och importen i economic-aid-application.component.tsx
 * för att städa bort.
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
  id: string,
  label: string,
  description: string,
  identitet: EconomicAidApplicationV1['identitet'],
  hushall: EconomicAidApplicationV1['hushall'],
  kind: EconomicAidApplicationV1['vagval']['kind'],
): TestPerson => ({
  id,
  label,
  description,
  data: {
    ...emptyEconomicAidApplication(),
    schemaVersion: ECONOMIC_AID_SCHEMA_VERSION,
    vagval: { kind },
    identitet,
    hushall,
  },
});

const emptyMedsokande = (): EconomicAidApplicationV1['hushall']['medsokande'] => ({
  fornamn: '',
  efternamn: '',
  personnummer: '',
  epost: '',
  mobiltelefon: '',
  behoverTolk: null,
  tolkSprak: '',
});

// Telefonnummer är hämtade ur officiellt reserverade testserier (PTS).
// Inga riktiga uppgifter får läggas in i denna fil.
const TEST_PERSONS: TestPerson[] = [
  buildPersona(
    'anna',
    'Anna Andersson',
    'Ny ansökan, ensamstående, kontakt via SMS',
    {
      vistelseadressStammer: true,
      alternativVistelseadress: { gatuadress: '', coAdress: '', postnummer: '', postort: '' },
      epost: 'anna.andersson@example.se',
      mobiltelefon: '070-174 06 05',
      kontaktViaSms: true,
      ansoktSenaste3Manader: false,
      behoverTolk: false,
      tolkSprak: '',
    },
    {
      civilstand: 'ensamstaende',
      harBarnUnder21: false,
      barn: [],
      forandringBarnSedanSenasteAnsokan: null,
      forandringBeskrivning: '',
      medsokande: emptyMedsokande(),
    },
    'NEW',
  ),
  buildPersona(
    'erik',
    'Erik Eriksson',
    'Återansökan, gift, barn (oförändrat sedan senast)',
    {
      vistelseadressStammer: true,
      alternativVistelseadress: { gatuadress: '', coAdress: '', postnummer: '', postort: '' },
      epost: 'erik.eriksson@example.se',
      mobiltelefon: '070-174 06 35',
      kontaktViaSms: false,
      ansoktSenaste3Manader: true,
      behoverTolk: false,
      tolkSprak: '',
    },
    {
      civilstand: 'gift',
      harBarnUnder21: true,
      barn: [
        {
          fornamn: 'Elin',
          efternamn: 'Eriksson',
          personnummer: '20140315-1234',
          borIHemmet: 'heltid',
        },
        {
          fornamn: 'Emil',
          efternamn: 'Eriksson',
          personnummer: '20170622-5678',
          borIHemmet: 'heltid',
        },
      ],
      forandringBarnSedanSenasteAnsokan: false,
      forandringBeskrivning: '',
      medsokande: {
        fornamn: 'Eva',
        efternamn: 'Eriksson',
        personnummer: '20260201-2389',
        epost: 'eva.eriksson@example.se',
        mobiltelefon: '070-174 06 36',
        behoverTolk: false,
        tolkSprak: '',
      },
    },
    'RETURNING',
  ),
  buildPersona(
    'maria',
    'Maria Karlsson',
    'Ny ansökan, sambo, behöver tolk (arabiska)',
    {
      vistelseadressStammer: true,
      alternativVistelseadress: { gatuadress: '', coAdress: '', postnummer: '', postort: '' },
      epost: 'maria.karlsson@example.se',
      mobiltelefon: '070-174 06 47',
      kontaktViaSms: true,
      ansoktSenaste3Manader: false,
      behoverTolk: true,
      tolkSprak: 'Arabiska',
    },
    {
      civilstand: 'sambo',
      harBarnUnder21: false,
      barn: [],
      forandringBarnSedanSenasteAnsokan: null,
      forandringBeskrivning: '',
      medsokande: {
        fornamn: 'Linus',
        efternamn: 'Karlsson',
        personnummer: '20260202-2388',
        epost: '',
        mobiltelefon: '',
        behoverTolk: false,
        tolkSprak: '',
      },
    },
    'NEW',
  ),
  buildPersona(
    'fatima',
    'Fatima Hassan',
    'Återansökan, gift, förändring i barnens situation',
    {
      vistelseadressStammer: false,
      alternativVistelseadress: {
        gatuadress: 'Skönsbergsvägen 14',
        coAdress: '',
        postnummer: '856 41',
        postort: 'Sundsvall',
      },
      epost: 'fatima.hassan@example.se',
      mobiltelefon: '070-174 06 73',
      kontaktViaSms: true,
      ansoktSenaste3Manader: true,
      behoverTolk: true,
      tolkSprak: 'Somaliska',
    },
    {
      civilstand: 'gift',
      harBarnUnder21: true,
      barn: [
        {
          fornamn: 'Layla',
          efternamn: 'Hassan',
          personnummer: '20120804-3456',
          borIHemmet: 'deltid',
        },
      ],
      forandringBarnSedanSenasteAnsokan: true,
      forandringBeskrivning: 'Äldsta barnet har flyttat till eget boende sedan förra ansökan.',
      medsokande: {
        fornamn: 'Mohamed',
        efternamn: 'Hassan',
        personnummer: '20260203-2387',
        epost: 'mohamed.hassan@example.se',
        mobiltelefon: '070-174 06 74',
        behoverTolk: true,
        tolkSprak: 'Somaliska',
      },
    },
    'RETURNING',
  ),
  buildPersona(
    'bengt',
    'Bengt Bengtsson',
    'Ny ansökan, ensamstående, äldre sökande',
    {
      vistelseadressStammer: true,
      alternativVistelseadress: { gatuadress: '', coAdress: '', postnummer: '', postort: '' },
      epost: 'bengt.bengtsson@example.se',
      mobiltelefon: '',
      kontaktViaSms: false,
      ansoktSenaste3Manader: false,
      behoverTolk: false,
      tolkSprak: '',
    },
    {
      civilstand: 'ensamstaende',
      harBarnUnder21: false,
      barn: [],
      forandringBarnSedanSenasteAnsokan: null,
      forandringBeskrivning: '',
      medsokande: emptyMedsokande(),
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

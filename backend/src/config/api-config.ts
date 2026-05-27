//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'legalentity',
    version: '2.0',
  },
  {
    name: 'case-data',
    version: '11.13',
  },
  {
    name: 'supportmanagement',
    version: '12.4',
  },
  {
    name: 'webmessagecollector',
    version: '5.1',
  },
  {
    name: 'casestatus',
    version: '4.2',
  },
  {
    name: 'partyassets',
    version: '6.4',
  },
  {
    name: 'contactsettings',
    version: '2.0',
  },
  {
    name: 'citizen',
    version: '3.0',
  },
  {
    name: 'messaging',
    version: '7.3',
  },
  {
    name: 'invoices',
    version: '8.0',
  },
  {
    name: 'employee',
    version: '2.0',
  },
  {
    name: 'simulatorserver',
    version: '2.0',
  },
  {
    name: 'myrepresentatives',
    version: '4.4',
  },
] as const;

export const getApiBase = (name: string) => {
  const api = APIS.find(api => api.name === name);
  return `${api?.name}/${api?.version}`;
};

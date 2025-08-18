//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'businessengagements',
    version: '3.0',
  },
  /** MyRepresentatives api currently disabled */
  // {
  //   name: 'myrepresentatives',
  //   version: '3.0',
  // },
  {
    name: 'case-data',
    version: '11.5',
  },
  {
    name: 'supportmanagement',
    version: '10.5',
  },
  {
    name: 'webmessagecollector',
    version: '5.1',
  },
  {
    name: 'casestatus',
    version: '4.1',
  },
  {
    name: 'partyassets',
    version: '3.0',
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
] as const;

export const getApiBase = (name: string) => {
  const api = APIS.find(api => api.name === name);
  return `${api?.name}/${api?.version}`;
};

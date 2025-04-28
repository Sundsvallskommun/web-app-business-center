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
    version: '11.1',
  },
  {
    name: 'supportmanagement',
    version: '10.1',
  },
  {
    name: 'webmessagecollector',
    version: '5.1',
  },
  {
    name: 'casestatus',
    version: '4.0',
  },
  {
    name: 'partyassets',
    version: '2.0',
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
    version: '7.0',
  },
  {
    name: 'invoices',
    version: '8.0',
  },
] as const;

export const getApiBase = (name: string) => {
  const api = APIS.find(api => api.name === name);
  return `${api?.name}/${api?.version}`;
};

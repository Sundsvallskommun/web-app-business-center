//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'businessengagements',
    version: '2.0',
  },
  /** MyRepresentatives api currently disabled */
  // {
  //   name: 'myrepresentatives',
  //   version: '3.0',
  // },
  {
    name: 'case-data',
    version: '9.0',
  },
  {
    name: 'casestatus',
    version: '3.1',
  },
  {
    name: 'contactsettings',
    version: '2.0',
  },
  {
    name: 'citizen',
    version: '2.0',
  },
  {
    name: 'messaging',
    version: '6.0',
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

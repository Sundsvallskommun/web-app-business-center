//Subscribed APIS as lowercased
export const APIS = [
  {
    name: 'businessengagements',
    version: '2.0',
  },
  /** MyRepresentatives api Currently not working as intended */
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
    version: '3.0',
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
    version: '5.1',
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

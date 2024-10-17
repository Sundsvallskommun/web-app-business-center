import { getCases } from '@services/case-service';
import { getInvoices } from '@services/invoice-service';
import { getBusinessEngagements, getRepresenting } from '@services/organisation-service';
import { getMe, getUserMeta } from '@services/user-service';

import { businessEngagements, cases, invoices, representingEntity, user, userMeta } from './data.mock.js';

jest.mock('@services/user-service', () => {
  const originalModule = jest.requireActual('@services/user-service');
  return {
    // __esModule: true,
    ...originalModule,
    getMe: jest.fn(),
    getUserMeta: jest.fn(),
  };
});

jest.mock('@services/case-service', () => {
  const originalModule = jest.requireActual('@services/case-service');
  return {
    // __esModule: true,
    ...originalModule,
    getCases: jest.fn(),
  };
});

jest.mock('@services/organisation-service', () => {
  const originalModule = jest.requireActual('@services/organisation-service');
  return {
    // __esModule: true,
    ...originalModule,
    getRepresenting: jest.fn(),
    getBusinessEngagements: jest.fn(),
  };
});

jest.mock('@services/invoice-service', () => {
  const originalModule = jest.requireActual('@services/invoice-service');
  return {
    // __esModule: true,
    ...originalModule,
    getInvoices: jest.fn(),
  };
});

getMe.mockImplementation(() => Promise.resolve(user));
getUserMeta.mockImplementation(() => Promise.resolve(userMeta));
getCases.mockImplementation(() => Promise.resolve(cases));
getRepresenting.mockImplementation(() => Promise.resolve(representingEntity));
getBusinessEngagements.mockImplementation(() => Promise.resolve(businessEngagements));
getInvoices.mockImplementation(() => Promise.resolve(invoices));

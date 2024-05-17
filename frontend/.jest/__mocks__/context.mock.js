import * as AppContext from '@contexts/app.context';
import { representingEntity, user, userMeta, cases, notificationAlerts, invoices } from './data.mock.js';

export const contextValues = {
  isLoggedIn: true,
  setIsLoggedIn: jest.fn(),
  isLoadingCases: false,
  setIsLoadingCases: jest.fn(),
  representingEntity: representingEntity,
  setRepresentingEntity: jest.fn(),
  invoices: invoices,
  setInvoices: jest.fn(),
  user: user,
  setUser: jest.fn(),
  userMeta: userMeta,
  setUserMeta: jest.fn(),
  cases: cases,
  setCases: jest.fn(),
  changedCases: cases.cases,
  setChangedCases: jest.fn(),
  highlightedTableRow: {},
  setHighlightedTableRow: jest.fn(),
  notificationAlerts: notificationAlerts,
  setNotificationAlerts: jest.fn(),
  isCookieConsentOpen: true,
  setIsCookieConsentOpen: jest.fn(),
};

jest.spyOn(AppContext, 'useAppContext').mockImplementation(() => contextValues);

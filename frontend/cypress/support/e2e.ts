import '@cypress/code-coverage/support';

import { getBusinessEngagements } from 'cypress/fixtures/getBusinessEngagements';
import { getCases } from 'cypress/fixtures/getCases';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getInvoices } from 'cypress/fixtures/getInvoices';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { getMe } from '../fixtures/getMe';
import { RepresentingMode } from '@interfaces/app';

const COOKIE_NAME = 'SKCookieConsent';
const COOKIE_VALUE = 'necessary%2Cfunc%2Cstats';

localStorage.clear();

Cypress.on('window:before:load', (window) => {
  window.document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}`;
});

export const representingModeDefault = RepresentingMode.PRIVATE;

export const interceptRepresentingMode = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/representing', getRepresentingEntity({ mode: representingMode })).as(`getRepresenting`);
  cy.intercept('POST', '**/api/representing', getRepresentingEntity({ mode: representingMode })).as(`postRepresenting`);
};

export const setIntercepts = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/me', getMe).as('getUser');
  interceptRepresentingMode(representingMode);
  cy.intercept('GET', '**/api/businessengagements', getBusinessEngagements).as('getBusinessEngagements');
  cy.intercept('GET', '**/api/cases', getCases(representingMode)).as(`getCases`);
  cy.intercept('GET', '**/api/invoices', getInvoices(representingMode)).as('getInvoices');
  cy.intercept('GET', '**/api/contactsettings', getContactSettings(representingMode)).as('getContactSettings');
};

beforeEach(() => {
  cy.viewport('macbook-16');
  setIntercepts(representingModeDefault);
});

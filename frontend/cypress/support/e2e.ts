import '@cypress/code-coverage/support';

import { getBusinessEngagements } from 'cypress/fixtures/getBusinessEngagements';
import { getCases } from 'cypress/fixtures/getCases';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getInvoices } from 'cypress/fixtures/getInvoices';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { getMe } from '../fixtures/getMe';

const COOKIE_NAME = 'SKCookieConsent';
const COOKIE_VALUE = 'necessary%2Cfunc%2Cstats';

localStorage.clear();

Cypress.on('window:before:load', (window) => {
  window.document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}`;
});

beforeEach(() => {
  cy.viewport('macbook-16');
  cy.intercept('GET', '**/api/me', getMe).as('getUser');
  cy.intercept('GET', '**/api/representing', getRepresentingEntity()).as('getRepresenting');
  cy.intercept('POST', '**/api/representing', getRepresentingEntity()).as('postRepresentingPRIVATE');
  cy.intercept('GET', '**/api/businessengagements', getBusinessEngagements).as('getBusinessEngagements');
  cy.intercept('GET', '**/api/cases', getCases).as('getCases');
  cy.intercept('GET', '**/api/invoices', getInvoices).as('getInvoices');
  cy.intercept('GET', '**/api/contactsettings', getContactSettings).as('getContactSettings');
});

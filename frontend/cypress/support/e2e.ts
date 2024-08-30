import '@cypress/code-coverage/support';

import { getMe } from '../fixtures/getMe';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { RepresentingMode } from '@interfaces/app';
import { getCases } from 'cypress/fixtures/getCases';
import { getInvoices } from 'cypress/fixtures/getInvoices';
import { getBusinessEngagements } from 'cypress/fixtures/getBusinessEngagements';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';

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
  cy.intercept('POST', '**/api/representing', getRepresentingEntity(RepresentingMode.PRIVATE)).as(
    'postRepresentingPRIVATE'
  );
  cy.intercept('POST', '**/api/representing', getRepresentingEntity(RepresentingMode.BUSINESS)).as(
    'postRepresentingBUSINESS'
  );
  cy.intercept('GET', '**/api/businessengagements', getBusinessEngagements).as('getBusinessEngagements');
  cy.intercept('GET', '**/api/cases', getCases).as('getCases');
  cy.intercept('GET', '**/api/invoices', getInvoices).as('getInvoices');
  cy.intercept('GET', '**/api/contactsettings', getContactSettings).as('getContactSettings');
});

import { RepresentingMode } from '@interfaces/app';
import { CookieConsentUtils } from '@sk-web-gui/react';
import { getBusinessEngagements } from 'cypress/fixtures/getBusinessEngagements';
import { getCases } from 'cypress/fixtures/getCases';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getInvoices } from 'cypress/fixtures/getInvoices';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { getMe } from '../fixtures/getMe';
import { getAssets } from 'cypress/fixtures/getAssets';
import { getDecisions } from 'cypress/fixtures/getDecisions';

// Ignore React 19 / Next.js 15 dev mode performance measurement errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('cannot have a negative time stamp')) {
    return false;
  }
});

export const DEFAULT_COOKIE_VALUE = 'necessary%2Cstats';

localStorage.clear();

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
  cy.intercept('GET', /(.*)api\/assets$/, getAssets(representingMode)).as('getAssets');
  cy.intercept('GET', '**/api/assets/*', { data: getAssets(representingMode).data[0], message: 'success' }).as(
    'getAsset'
  );
  cy.intercept('GET', '**/api/decisions', getDecisions(representingMode)).as('getDecisions');
};

beforeEach(() => {
  cy.setCookie(CookieConsentUtils.defaultCookieConsentName, DEFAULT_COOKIE_VALUE);
  cy.viewport('macbook-16');
  setIntercepts(representingModeDefault);
});

import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testInvoices, testOngoingCases } from 'cypress/e2e/utils';
import { getRepresentingEntity, representingPrivateDefault } from 'cypress/fixtures/getRepresentingEntity';

describe('Privat', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: representingPrivateDefault, mode: RepresentingMode.PRIVATE })
    ).as('getRepresenting');
    cy.intercept(
      'POST',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: representingPrivateDefault, mode: RepresentingMode.PRIVATE })
    ).as('postRepresenting');
    cy.visit('/privat');
  });
  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
  it('should render /privat/oversikt as default page', () => {
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/privat/oversikt');
      testOngoingCases();
    });
  });
  it('should render Ärenden when clicked', () => {
    cy.contains('[role="menuitem"]', 'Ärenden').click();
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/privat/arenden');
      testCases();
    });
  });
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="menuitem"]', 'Fakturor').click();
    cy.wait('@getInvoices').then(() => {
      cy.url().should('include', '/privat/fakturor');
      testInvoices();
    });
  });
  it('should render Profil och inställningar when clicked', () => {
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();
    cy.wait('@getContactSettings').then(() => {
      cy.url().should('include', '/privat/profil');
      testContactSettings();
    });
  });
});

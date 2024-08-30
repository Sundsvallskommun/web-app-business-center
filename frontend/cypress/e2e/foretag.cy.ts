import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testOngoingCases } from 'cypress/e2e/utils';
import { getRepresentingEntity, representingBusinessDefault } from 'cypress/fixtures/getRepresentingEntity';

describe('Företag', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ BUSINESS: representingBusinessDefault, mode: RepresentingMode.BUSINESS })
    ).as('getRepresenting');
    cy.intercept(
      'POST',
      '**/api/representing',
      getRepresentingEntity({ BUSINESS: representingBusinessDefault, mode: RepresentingMode.BUSINESS })
    ).as('postRepresenting');
    cy.visit('/foretag');
  });
  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
  it('should render /foretag/oversikt as default page', () => {
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/foretag/oversikt');
      testOngoingCases();
    });
  });
  it('should render Ärenden when clicked', () => {
    cy.contains('[role="menuitem"]', 'Ärenden').click();
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/foretag/arenden');
      testCases();
    });
  });
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="menuitem"]', 'Fakturor').click();
    cy.wait('@getInvoices').then(() => {
      cy.url().should('include', '/foretag/fakturor');
    });
  });
  it('should render Profil och inställningar when clicked', () => {
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();
    cy.wait('@getContactSettings').then(() => {
      cy.url().should('include', '/foretag/profil');
      testContactSettings();
    });
  });
});

import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testInvoices } from 'cypress/e2e/utils';
import { setIntercepts } from 'cypress/support/e2e';

describe('Företag', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.BUSINESS);
    cy.visit('/foretag');
  });
  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
  it('should render /foretag/oversikt as default page', () => {
    cy.contains('[role="menuitem"]', 'Översikt').should('exist');
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/foretag/oversikt');
    });
  });
  it('should render Ärenden when clicked', () => {
    cy.contains('[role="menuitem"]', 'Ärenden').click();
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/foretag/arenden');
      testCases(RepresentingMode.BUSINESS);
    });
  });
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="menuitem"]', 'Fakturor').click();
    cy.wait('@getInvoices').then(() => {
      cy.url().should('include', '/foretag/fakturor');
      testInvoices(RepresentingMode.BUSINESS);
    });
  });
  it('should render Profil och inställningar when clicked', () => {
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();
    cy.wait('@getContactSettings').then(() => {
      cy.url().should('include', '/foretag/profil');
      testContactSettings(RepresentingMode.BUSINESS);
    });
  });
});

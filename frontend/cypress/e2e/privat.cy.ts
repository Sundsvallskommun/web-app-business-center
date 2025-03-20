import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testInvoices } from 'cypress/e2e/utils';
import { setIntercepts } from 'cypress/support/e2e';

describe('Privat', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat');
  });
  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
  it('should render /privat/oversikt as default page', () => {
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/privat/oversikt');
    });
  });
  it('should render Ärenden when clicked', () => {
    cy.contains('[role="menuitem"]', 'Ärenden').click();
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/privat/arenden');
      testCases(RepresentingMode.PRIVATE);
    });
  });
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="menuitem"]', 'Fakturor').click();
    cy.wait('@getInvoices').then(() => {
      cy.url().should('include', '/privat/fakturor');
      testInvoices(RepresentingMode.PRIVATE);
    });
  });
  it('should render Profil och inställningar when clicked', () => {
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();
    cy.wait('@getContactSettings').then(() => {
      cy.url().should('include', '/privat/profil');
      testContactSettings(RepresentingMode.PRIVATE);
    });
  });
});

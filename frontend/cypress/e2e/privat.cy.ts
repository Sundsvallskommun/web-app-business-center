import { RepresentingMode } from '@interfaces/app';
import { testAssets, testCases, testContactSettings, testDecisions } from 'cypress/e2e/utils';
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
    cy.contains('[role="navigationitem"]', 'Ärenden').click();
    cy.wait('@getCases').then(() => {
      cy.url().should('include', '/privat/arenden');
      testCases(RepresentingMode.PRIVATE);
    });
  });
  // Temporarily disabled due to the fact that api doesnt provide all invoices
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="navigationitem"]', 'Fakturor').click();
    cy.wait('@getInvoices').then(() => {
      cy.url().should('include', '/privat/fakturor');
      // testInvoices(RepresentingMode.PRIVATE);
    });
  });
  it('should render Profil och inställningar when clicked', () => {
    cy.get('[data-cy="user-menu"]').click();
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();
    cy.wait('@getContactSettings').then(() => {
      cy.url().should('include', '/privat/profil');
      testContactSettings(RepresentingMode.PRIVATE);
    });
  });
  it('should render assets list /privat', () => {
    cy.contains('[role="navigationitem"]', 'Beslut och dokument').click();
    cy.wait('@getAssets').then(() => {
      cy.url().should('include', '/privat/beslut-och-dokument');
      testAssets(RepresentingMode.PRIVATE);
    });
  });
  it('should render decisions list /privat', () => {
    cy.contains('[role="navigationitem"]', 'Beslut och dokument').click();
    cy.wait('@getDecisions').then(() => {
      cy.url().should('include', '/privat/beslut-och-dokument');
      testDecisions();
    });
  });
});

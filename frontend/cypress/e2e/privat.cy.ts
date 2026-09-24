import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testDocuments, testUnlinkedDecisions } from 'cypress/e2e/utils';
import { getDocumentsWithUnavailable } from 'cypress/fixtures/getDocuments';
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
  // Temporarily disabled due to the fact that api doesnt provide all invoices
  it('should render Fakturor when clicked', () => {
    cy.contains('[role="menuitem"]', 'Fakturor').click();
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
  it('should render documents list /privat', () => {
    cy.contains('[role="menuitem"]', 'Beslut och dokument').click();
    cy.wait('@getDocuments').then(() => {
      cy.url().should('include', '/privat/beslut-och-dokument');
      testDocuments(RepresentingMode.PRIVATE);
    });
  });
  it('should render unlinked decisions list /privat', () => {
    cy.contains('[role="menuitem"]', 'Beslut och dokument').click();
    cy.wait('@getDocuments').then(() => {
      cy.url().should('include', '/privat/beslut-och-dokument');
      testUnlinkedDecisions();
    });
  });
  it('should name the unavailable source when one cannot be fetched /privat', () => {
    cy.intercept('GET', '**/api/documents', getDocumentsWithUnavailable(['CASEDATA'])).as('getDocuments');
    cy.contains('[role="menuitem"]', 'Beslut och dokument').click();
    cy.wait('@getDocuments').then(() => {
      cy.get('[data-cy="documents-source-unavailable"]')
        .should('be.visible')
        .and('contain.text', 'Beslut i dina ärenden kunde inte hämtas just nu.');
      // The rest of the page still renders from the sources that answered
      cy.get('ul[aria-label="Dokument"] > li').should('have.length', 1);
    });
  });
});

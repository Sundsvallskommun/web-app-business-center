import { RepresentingMode } from '@interfaces/app';
import {
  BYGGR_CASE_NUMBER,
  BYGGR_DESCRIPTION,
  BYGGR_DOCUMENT_ID,
  getByggrDocument,
  getByggrDocumentWithoutDecisions,
} from 'cypress/fixtures/getDocuments';
import { setIntercepts } from 'cypress/support/e2e';

const ATTACHMENT_BASE64 = btoa('%PDF-1.0 test');

describe('byggR document', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/documents/br-*', getByggrDocument()).as('getByggrDocument');
    cy.intercept('GET', '**/api/documents/decisions/*/attachments/*', {
      data: ATTACHMENT_BASE64,
      message: 'success',
    }).as('getAttachment');

    cy.visit('/privat/beslut-och-dokument', {
      onBeforeLoad: (win) => {
        cy.spy(win.console, 'error').as('consoleError');
      },
    });
    cy.wait('@getDocuments');
  });

  const openByggrDocument = () => {
    cy.get(`ul[aria-label="Dokument"] > li a[aria-label="Visa ${BYGGR_DESCRIPTION}"]`).click();
    cy.wait('@getByggrDocument')
      .its('request.url')
      .should('include', `/api/documents/${encodeURIComponent(BYGGR_DOCUMENT_ID)}`);
    cy.url().should('include', `/beslut-och-dokument/${encodeURIComponent(BYGGR_DOCUMENT_ID)}`);
    cy.get('[data-cy="document-loading"]').should('not.exist');
  };

  it('shows the errand with its case facts, status and decision documents', () => {
    openByggrDocument();

    cy.get('main h1').should('contain.text', BYGGR_DESCRIPTION);
    cy.get('main').contains('Aktiv').should('be.visible');
    cy.get('main')
      .contains(/^Ärendenummer$/)
      .next()
      .should('contain.text', BYGGR_CASE_NUMBER);
    cy.get('main')
      .contains(/^Fastighetsbeteckning$/)
      .next()
      .should('contain.text', 'SUNDSVALL 1:1');
    cy.get('main')
      .contains(/^Beslutad$/)
      .next()
      .should('contain.text', '1 mar 2024');
    cy.get('main')
      .contains(/^Giltig till$/)
      .should('not.exist');

    // Nothing from the partyassets view leaks into the byggR view
    cy.get('main').contains('Kortnummer').should('not.exist');
    cy.get('[data-cy="report-lost-permit-button"]').should('not.exist');

    // Every decision document in one flat list, newest decision first, each naming its decision
    cy.get('[data-cy="document-decisions"]').should('not.exist');
    cy.get('main [data-cy="document-file"]').should('have.length', 3);
    cy.get('main [data-cy="document-file"]')
      .eq(0)
      .within(() => {
        cy.contains('Startbesked.pdf').should('exist');
        cy.contains('Startbesked, 15 maj 2024').should('exist');
        cy.get('button[aria-label="Ladda ner Startbesked.pdf"]').should('exist');
      });
    cy.get('main [data-cy="document-file"]')
      .eq(1)
      .within(() => {
        cy.contains('Beslut.pdf').should('exist');
        cy.contains('Beslut om bygglov, 1 mar 2024').should('exist');
      });
    cy.get('main [data-cy="document-file"]')
      .eq(2)
      .within(() => {
        cy.contains('Ritning.pdf').should('exist');
        cy.contains('Beslut om bygglov, 1 mar 2024').should('exist');
      });
  });

  it('downloads a decision document by its own id, with the case number encoded', () => {
    openByggrDocument();

    cy.get('button[aria-label="Ladda ner Ritning.pdf"]').click();
    cy.wait('@getAttachment').then((interception) => {
      expect(interception.request.url).to.include(
        `/api/documents/decisions/${encodeURIComponent(`br-101:${BYGGR_CASE_NUMBER}`)}/attachments/4712`
      );
    });
    cy.readFile('cypress/downloads/Ritning.pdf', { timeout: 15000 }).should('exist');
  });

  it('shows an errand without decisions', () => {
    cy.intercept('GET', '**/api/documents/br-*', getByggrDocumentWithoutDecisions()).as('getByggrDocument');
    openByggrDocument();

    cy.get('main h1').should('contain.text', BYGGR_CASE_NUMBER);
    cy.get('main')
      .contains(/^Ärendenummer$/)
      .next()
      .should('contain.text', BYGGR_CASE_NUMBER);
    cy.get('[data-cy="document-no-files"]').should('be.visible');
    cy.get('[data-cy="document-file"]').should('not.exist');
    cy.get('main').contains('Okänd').should('not.exist');
  });
});

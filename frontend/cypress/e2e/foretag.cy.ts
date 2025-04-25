import { RepresentingMode } from '@interfaces/app';
import { testAssets, testCases, testContactSettings, testInvoices } from 'cypress/e2e/utils';
import { getBusinessRepresentFromEngagements, getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
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
  it('should switch business', () => {
    cy.contains('Styrbjörns båtar').should('be.visible');
    cy.contains('button', 'Byt organisation')
      .click()
      .then(() => {
        cy.intercept(
          'GET',
          '**/api/representing',
          getRepresentingEntity({ mode: RepresentingMode.BUSINESS, BUSINESS: getBusinessRepresentFromEngagements(1) })
        ).as(`getRepresenting`);
        cy.contains('button', 'Styrbjörns cyklar').click();
        cy.wait('@getRepresenting');
        cy.contains('[data-cy="representingLabel"]', 'Styrbjörns cyklar').should('be.visible');
      });
  });
  it('should render assets list /foretag', () => {
    cy.contains('[role="menuitem"]', 'Beslut och dokument').click();
    cy.wait('@getAssets').then(() => {
      cy.url().should('include', '/foretag/beslut-och-dokument');
      testAssets(RepresentingMode.BUSINESS);
    });
  });
});

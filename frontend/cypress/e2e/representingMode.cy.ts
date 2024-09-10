import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings, testInvoices, testOngoingCases } from 'cypress/e2e/utils';
import { getRepresentingEntity, representingPrivateDefault } from 'cypress/fixtures/getRepresentingEntity';
import { setIntercepts } from 'cypress/support/e2e';

describe('Ändra representationsläge (privat/företag)', () => {
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
  it('should render /privat/oversikt then /foretag/oversikt', () => {
    setIntercepts(RepresentingMode.PRIVATE);

    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getCases', '@getRepresenting']).then(() => {
      testOngoingCases(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="menuitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/oversikt');
      cy.wait(['@getCases', '@getRepresenting']).then(() => {
        testOngoingCases(RepresentingMode.BUSINESS);
      });
    });
  });
  it('should render /privat/arenden then /foretag/arenden', () => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.contains('[role="menuitem"]', 'Ärenden').click();

    cy.url().should('include', '/privat/arenden');
    cy.wait(['@getCases', '@getRepresenting']).then(() => {
      testCases(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="menuitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/arenden');
      cy.wait(['@getCases', '@getRepresenting']).then(() => {
        testCases(RepresentingMode.BUSINESS);
      });
    });
  });
  it('should render /privat/fakturor then /foretag/fakturor', () => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.contains('[role="menuitem"]', 'Fakturor').click();

    cy.url().should('include', '/privat/fakturor');
    cy.wait(['@getInvoices', '@getRepresenting']).then(() => {
      testInvoices(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="menuitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/fakturor');
      cy.wait(['@getInvoices', '@getRepresenting']).then(() => {
        testInvoices(RepresentingMode.BUSINESS);
      });
    });
  });
  it('should render /privat/profil then /foretag/profil', () => {
    setIntercepts(RepresentingMode.PRIVATE);
    cy.contains('[role="menuitem"]', 'Profil och inställningar').click();

    cy.url().should('include', '/privat/profil');
    cy.wait(['@getContactSettings', '@getRepresenting']).then(() => {
      testContactSettings(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="menuitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/profil');
      cy.wait(['@getContactSettings', '@getRepresenting']).then(() => {
        testContactSettings(RepresentingMode.BUSINESS);
      });
    });
  });
});

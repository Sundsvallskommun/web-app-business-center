import { RepresentingMode } from '@interfaces/app';
import { testCases, testContactSettings } from 'cypress/e2e/utils';
import { getMe } from 'cypress/fixtures/getMe';
import { getPrivateRepresentFromGetMe, getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';
import { setIntercepts } from 'cypress/support/e2e';

describe('Ändra representationsläge (privat/företag)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: getPrivateRepresentFromGetMe(), mode: RepresentingMode.PRIVATE })
    ).as('getRepresenting');
    cy.intercept(
      'POST',
      '**/api/representing',
      getRepresentingEntity({ PRIVATE: getPrivateRepresentFromGetMe(), mode: RepresentingMode.PRIVATE })
    ).as('postRepresenting');
    setIntercepts(RepresentingMode.PRIVATE);
    cy.visit('/privat');
  });
  afterEach(() => {
    cy.clearLocalStorage();
  });
  it('should render /privat/oversikt then /foretag/valj-foretag then /foretag/oversikt with no chosen business', () => {
    cy.contains('[data-cy="representingLabel"]', getMe.data.name);
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getCases', '@getRepresenting']).then(() => {
      setIntercepts(RepresentingMode.BUSINESS);
      cy.intercept('GET', '**/api/representing', { statusCode: 400 }).as('getRepresenting');

      // RepresentingSwitchButton
      cy.contains('[role="navigationitem"]', 'Företag').click();
      cy.url().should('include', '/foretag/valj-foretag');

      cy.intercept('GET', '**/api/representing', getRepresentingEntity({ mode: RepresentingMode.BUSINESS })).as(
        'getRepresenting'
      );

      // välj företag
      cy.contains('Styrbjörns båtar').click();
      cy.contains('button', 'Fortsätt').click();
      cy.contains('[data-cy="representingLabel"]', 'Styrbjörns båtar');
      cy.url().should('include', '/foretag/oversikt');
    });
  });

  it('should render /privat/oversikt then /foretag/oversikt then /privat/oversikt', () => {
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getCases', '@getRepresenting'])
      .then(() => {
        setIntercepts(RepresentingMode.BUSINESS);

        // RepresentingSwitchButton
        cy.contains('[role="navigationitem"]', 'Företag').click();
        cy.url().should('include', '/foretag/oversikt');
        cy.contains('Styrbjörns båtar');
      })
      .then(() => {
        setIntercepts(RepresentingMode.PRIVATE);
        cy.contains('[role="navigationitem"]', 'Privat').click();
        cy.url().should('include', '/privat/oversikt');
      });
  });
  it('should render /privat/oversikt then /foretag/oversikt', () => {
    cy.url().should('include', '/privat/oversikt');
    cy.wait(['@getCases', '@getRepresenting']).then(() => {
      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="navigationitem"]', 'Företag').click();
      cy.url().should('include', '/foretag/oversikt');
    });
  });
  it('should render /privat/arenden then /foretag/arenden', () => {
    cy.contains('[role="navigationitem"]', 'Ärenden').click();
    cy.url().should('include', '/privat/arenden');
    cy.wait(['@getCases', '@getRepresenting']).then(() => {
      testCases(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="navigationitem"]', 'Företag').click();
      cy.clearLocalStorage();

      cy.url().should('include', '/foretag/arenden');
      cy.wait(['@getCases', '@getRepresenting']).then(() => {
        testCases(RepresentingMode.BUSINESS);
      });
    });
  });
  // Temporarily disabled due to the fact that api doesnt provide all invoices
  it('should render /privat/fakturor then /foretag/fakturor', () => {
    cy.contains('[role="navigationitem"]', 'Fakturor').click();

    cy.url().should('include', '/privat/fakturor');
    cy.wait(['@getInvoices', '@getRepresenting']).then(() => {
      // testInvoices(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="navigationitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/fakturor');
      cy.wait(['@getInvoices', '@getRepresenting']).then(() => {
        // testInvoices(RepresentingMode.BUSINESS);
      });
    });
  });
  it('should render /privat/profil then /foretag/profil', () => {
    cy.contains('[role="navigationitem"]', 'Profil och inställningar').click();

    cy.url().should('include', '/privat/profil');
    cy.wait(['@getContactSettings', '@getRepresenting']).then(() => {
      testContactSettings(RepresentingMode.PRIVATE);

      setIntercepts(RepresentingMode.BUSINESS);

      // RepresentingSwitchButton
      cy.contains('[role="navigationitem"]', 'Företag').click();

      cy.url().should('include', '/foretag/profil');
      cy.wait(['@getContactSettings', '@getRepresenting']).then(() => {
        testContactSettings(RepresentingMode.BUSINESS);
      });
    });
  });
});

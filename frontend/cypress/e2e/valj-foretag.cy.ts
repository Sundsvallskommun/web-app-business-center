import { RepresentingMode } from '@interfaces/app';
import { getRepresentingEntity } from 'cypress/fixtures/getRepresentingEntity';

describe('Valj företag', () => {
  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/api/representing',
      getRepresentingEntity({ BUSINESS: undefined, mode: RepresentingMode.BUSINESS })
    ).as('getRepresenting');
    cy.visit('/foretag/valj-foretag');
  });
  it('should render #content and h1', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
  it('choosing a businessengagement should redirect', () => {
    cy.contains('Styrbjörns båtar').click();
    cy.contains('button', 'Fortsätt').click();
    cy.url().should('include', '/foretag/oversikt');
    cy.contains('Styrbjörns båtar');
  });
  it('should show norepresent page if no businessengagements', () => {
    cy.intercept('GET', '**/api/businessengagements', { statusCode: 404 }).as('getBusinessEngagements');
    cy.visit('/foretag/valj-foretag');
    cy.contains('h1', 'Hoppsan, vi hittade inget företag som är registrerat på dig');
  });
});

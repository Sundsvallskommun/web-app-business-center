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
  it('should list a businessengagement', () => {
    cy.contains('Styrbjörns båtar');
  });
});

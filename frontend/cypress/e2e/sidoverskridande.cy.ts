import { RepresentingMode } from '@interfaces/app';
import { setIntercepts } from 'cypress/support/e2e';

describe('Sidöverskridande', () => {
  it('Set focus to main', () => {
    cy.visit('/');
    cy.wait('@getCases');
    cy.contains('h1', 'Att göra');
    cy.contains('a', 'Hoppa till innehåll').then(($link) => {
      cy.wrap($link).focus().click({ force: true }); // trigger key Enter seem not to work
    });
    cy.focused().should(($el) => {
      expect($el.prop('tagName')).to.equal('MAIN');
    });
  });

  it('mobile menu can be opened', () => {
    // privat
    cy.viewport('iphone-5');
    cy.visit('/');
    cy.wait('@getCases');

    cy.url().should('include', '/privat/oversikt');

    cy.get('button[aria-label="Meny"]').should('be.visible').click();
    cy.get('button[aria-label="Stäng meny"]').should('be.visible');
    cy.get('ul[aria-label="Undersidor"] li').should('have.length', 5);

    // foretag
    setIntercepts(RepresentingMode.BUSINESS);
    cy.contains('button', 'Till Mina sidor företag').click();
    cy.url().should('include', '/foretag/oversikt');

    cy.get('button[aria-label="Meny"]').should('be.visible').click();
    cy.get('button[aria-label="Stäng meny"]').should('be.visible');

    cy.get('select').contains('option', 'Styrbjörns båtar').should('be.visible').and('be.selected');
    cy.get('select').select('Styrbjörns båtar');
    cy.wait('@postRepresenting').its('response.statusCode').should('eq', 200);
  });
});

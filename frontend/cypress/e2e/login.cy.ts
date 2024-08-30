describe('Login', () => {
  it('should render login page', () => {
    cy.visit('/login');

    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
});

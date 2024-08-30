describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('should render login page', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist');
  });
});

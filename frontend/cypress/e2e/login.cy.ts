describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('should render login page', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Välj hur du vill logga in');
  });
});

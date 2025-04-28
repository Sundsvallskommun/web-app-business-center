describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('should render login page', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Logga in som');
    cy.contains('button', 'Privatperson').should('be.visible');
    cy.contains('button', 'Organisation').should('be.visible');
  });
});

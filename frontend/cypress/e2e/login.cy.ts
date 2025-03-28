describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('should render login page', () => {
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Välj hur du vill logga in');
  });

  it('should trigger API call with redirect to /privat', () => {
    cy.wait('@getRepresenting');
    cy.contains('button', 'Privat').click();
    cy.wait('@getRepresenting');
    cy.contains('button', 'Logga in privat').should('exist').click();
  });

  it('should trigger API call with redirect to /foretag', () => {
    cy.wait('@getRepresenting');
    cy.contains('button', /^Företag/).click();
    cy.wait('@getRepresenting');
    cy.contains('button', /Logga in som företag/).should('exist');
  });
});

describe('Om webbplatsen', () => {
  it('should render om webbplatsen', () => {
    cy.visit('/om-webbplatsen');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Om webbplatsen');
    cy.contains('h2', 'Kakor').should('be.visible');
    cy.contains('h2', 'Tillgänglighet').should('be.visible');
    cy.contains('a', 'Personuppgifter').should('be.visible').and('have.attr', 'target', '_blank');
  });

  it('should render om webbplatsen -> Kakor', () => {
    cy.visit('/om-webbplatsen/kakor');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Kakor');
  });

  it('should render om webbplatsen -> Tillgänglighet', () => {
    cy.visit('/om-webbplatsen/tillganglighet');
    cy.get('#content').should('exist');
    cy.get('h1').should('exist').should('contain.text', 'Tillgänglighet');
  });
});

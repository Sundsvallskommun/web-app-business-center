import { CookieConsentUtils } from '@sk-web-gui/react';

describe('Kakor', () => {
  it('should render and close', () => {
    Cypress.on('window:before:load', (window) => {
      window.document.cookie = `${CookieConsentUtils.defaultCookieConsentName}=`;
    });
    cy.visit('/om-webbplatsen/kakor');
    cy.contains('Vi använder kakor, cookies');
    cy.contains('button', 'Godkänn alla').click();
    cy.contains('Vi använder kakor, cookies').should('not.exist');
  });
});

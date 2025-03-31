/// <reference path="../support/component.d.ts" />

import CountdownTimer from '@components/countdown/countdown-timer.component';

describe('Inactivity alert', () => {
  it('Countdown timer counts down', () => {
    cy.mount(<CountdownTimer timeout={300500} />); // give assertion 500ms
    cy.get('span').should('have.text', '05:00');
    cy.wait(500);
    cy.get('span').should('contain.text', '04:');
  });
});

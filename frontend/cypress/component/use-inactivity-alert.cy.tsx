import CountdownTimer from '@components/countdown/countdown-timer.component';

describe('Inactivity alert', () => {
  it('Countdown timer counts down', () => {
    cy.mount(<CountdownTimer timeout={300000} />);
    cy.get('span').should('have.text', '05:00');
    cy.get('span').should('contain.text', '04:');
  });
});

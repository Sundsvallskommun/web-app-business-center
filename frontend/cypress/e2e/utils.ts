import { RepresentingMode } from '@interfaces/app';
import { statusCodes } from '@interfaces/status-codes';
import { statusMapCases } from '@services/case-service';
import { notPaidInvoices, otherInvoices, paidInvoices, statusMapInvoices } from '@services/invoice-service';
import { getRepresentingModeName } from '@utils/representingModeRoute';
import { getCase } from 'cypress/fixtures/getCase';
import { representingModeDefault } from 'cypress/support/e2e';

export const testContactSettings = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.contains('label', 'test@example.com').should('exist');
  cy.contains('label', '+46701740605').should('exist');
  cy.get('[name="notifications.phone_disabled"]').should('be.checked');
  cy.get('[name="notifications.email_disabled"]').should('be.checked');
};

export const testCase = (
  representingMode: RepresentingMode = representingModeDefault,
  externalCaseId: string = 'externalCaseId-0'
) => {
  cy.url().should(
    'include',
    `${getRepresentingModeName(representingMode, { urlFriendly: true })}/arenden/${externalCaseId}`
  );
  cy.get('#content h1').should('have.text', 'Uppgifter');
  cy.contains('a', 'Meddelanden').should('be.visible').click();
  cy.url().should('include', '/meddelanden');
  cy.contains('h1', 'Meddelanden').should('be.visible');

  cy.go('back');
};

export const testOngoingCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/cases/externalCaseId-0', getCase(representingMode, 'externalCaseId-0')).as(`getCase0`);
  cy.contains('h1, h2', /pågående/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(($elem) => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if (value.code === statusCodes.Ongoing) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });

      // Ärende
      cy.wait(300); // let render happen for table sorting to take place
      cy.wrap($elem)
        .contains('a', `Visa caseType-Inskickat-${RepresentingMode[representingMode]}`, { timeout: 10000 })
        .should('be.visible')
        .click();
    });
  cy.wait('@getCase0');
  testCase(representingMode, 'externalCaseId-0');
  cy.go('back');

  cy.viewport('iphone-5');

  cy.contains('h1, h2', /pågående/i)
    .next()
    .find('article h3')
    .should('have.length', 12);

  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('*', 'Visar 12 av 13')
    .should('be.visible');

  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('button', 'Visa fler')
    .click();

  cy.contains('h1, h2', /pågående/i)
    .next()
    .find('article h3')
    .should('have.length', 13);

  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('*', 'Visar 12 av 13')
    .should('not.exist');

  cy.viewport('macbook-16');
};

export const testClosedCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/cases/externalCaseId-12', getCase(representingMode, 'externalCaseId-12')).as(`getCase12`);
  cy.contains('h1, h2', /avslutade/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(($elem) => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if ([statusCodes.Rejected, statusCodes.Approved].includes(value.code)) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });

      // Ärende
      cy.wait(300); // let render happen for table sorting to take place
      cy.wrap($elem)
        .contains('a', `Visa caseType-Klart-${RepresentingMode[representingMode]}`, { timeout: 10000 })
        .should('be.visible')
        .click();
    });
  cy.wait('@getCase12');
  testCase(representingMode, 'externalCaseId-12');
  cy.go('back');

  cy.viewport('iphone-5');

  cy.contains('h1, h2', /avslutade/i)
    .next()
    .find('article h3')
    .should('have.length', 4);

  cy.contains('h1, h2', /avslutade/i)
    .next()
    .contains('*', /Visar 4 av 4/)
    .should('be.visible');

  cy.viewport('macbook-16');
};

export const testCases = (representingMode: RepresentingMode = representingModeDefault) => {
  testOngoingCases(representingMode);
  testClosedCases(representingMode);
};

export const testPaidInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /^betalda/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      paidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testNotPaidInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /obetalda/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      notPaidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testOtherInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /övriga/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      otherInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testPaidInvoicesMobile = () => {
  cy.viewport('iphone-5');

  cy.contains('h1, h2', /^betalda/i)
    .next()
    .contains('*', /Visar \d+ av \d+/)
    .should('not.exist');

  cy.contains('h1, h2', /^betalda/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('article')
    .find('button')
    .click();

  cy.contains('h1, h2', /^betalda/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('article')
    .contains('strong', 'OCR-nummer');

  cy.viewport('macbook-16');
};

export const testInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  testPaidInvoices(representingMode);
  testNotPaidInvoices(representingMode);
  testOtherInvoices(representingMode);
  testPaidInvoicesMobile();
};

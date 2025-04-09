import { RepresentingMode } from '@interfaces/app';
import { statusCodes } from '@interfaces/status-codes';
import { statusMapCases } from '@services/case-service';
import { notPaidInvoices, otherInvoices, paidInvoices, statusMapInvoices } from '@services/invoice-service';
import { getRepresentingModeName } from '@utils/representingModeRoute';
import { getCase } from 'cypress/fixtures/getCase';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getPdf } from 'cypress/fixtures/getPdf';
import { representingModeDefault } from 'cypress/support/e2e';

export const testContactSettings = (representingMode: RepresentingMode = representingModeDefault) => {
  // Kontaktuppgifter
  cy.intercept('POST', '**/api/contactsettings', getContactSettings(representingMode)).as(`postContactSettings`);
  cy.contains('h2', 'Kontaktuppgifter').next().contains('button', 'Redigera').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.get('input[name="email"]').should('have.value', 'test@example.com');
  cy.get('input[name="phone"]').should('have.value', '+46701740605');
  cy.contains('button:visible', 'Spara').click();
  cy.wait('@postContactSettings');
  cy.get('.sk-snackbar').contains('Uppgifterna sparades.').should('be.visible');
  cy.get('.sk-snackbar').contains('button', 'Stäng').click();
  cy.contains('h2', 'Kontaktuppgifter').next().contains('button', 'Redigera').should('be.visible');

  // Kontaktvägar
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').click();
  cy.get('[name="notifications.phone_disabled"]').should('be.checked');
  cy.get('[name="notifications.email_disabled"]').should('be.checked');
  cy.contains('button:visible', 'Spara').click();
  cy.wait('@postContactSettings');
  cy.get('.sk-snackbar').contains('Uppgifterna sparades.').should('be.visible');
  cy.get('.sk-snackbar').contains('button', 'Stäng').click();
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').should('be.visible');
};

export const testCase = (representingMode: RepresentingMode = representingModeDefault, caseId: string = 'caseId-0') => {
  cy.url().should('include', `${getRepresentingModeName(representingMode, { urlFriendly: true })}/arenden/${caseId}`);
  cy.get('#content h1').should('have.text', 'Uppgifter');
  cy.contains('a', 'Meddelanden').should('be.visible').click();
  cy.url().should('include', '/meddelanden');
  cy.contains('h1', 'Meddelanden').should('be.visible');

  cy.go('back');
};

export const testOngoingCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/cases/caseId-0', getCase(representingMode, 'caseId-0')).as(`getCase0`);
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
  testCase(representingMode, 'caseId-0');
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
  cy.intercept('GET', '**/api/cases/caseId-12', getCase(representingMode, 'caseId-12')).as(`getCase12`);
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
  testCase(representingMode, 'caseId-12');
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

export const testPaidInvoicesPdf = () => {
  cy.intercept('GET', '**/api/invoicepdf/999', getPdf).as('getPdf');
  cy.contains('h1, h2', /^betalda/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody tr:nth-child(1)')
    .contains('button', 'Hämta faktura')
    .click();
  cy.wait('@getPdf').then((interception) => {
    expect(interception.response?.statusCode).to.eq(200);
    cy.readFile('cypress/downloads/999.pdf', { timeout: 15000 }).should('exist');
  });
};

export const testInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  testPaidInvoices(representingMode);
  // testNotPaidInvoices(representingMode);
  // testOtherInvoices(representingMode);
  // testPaidInvoicesMobile();
  testPaidInvoicesPdf();
};

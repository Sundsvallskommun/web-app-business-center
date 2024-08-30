import { statusCodes } from '@interfaces/status-codes';
import { statusMapCases } from '@services/case-service';
import { notPaidInvoices, otherInvoices, paidInvoices, statusMapInvoices } from '@services/invoice-service';

export const testContactSettings = () => {
  cy.contains('label', 'test@example.com').should('exist');
  cy.contains('label', '+46701740605').should('exist');
  cy.get('[name="notifications.phone_disabled"]').should('be.checked');
  cy.get('[name="notifications.email_disabled"]').should('be.checked');
};

export const testOngoingCases = () => {
  cy.contains('h1, h2', /pågående/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if (value.code === statusCodes.Ongoing) {
          cy.contains(key).should('exist');
        }
      });
    });
};

export const testClosedCases = () => {
  cy.contains('h1, h2', /avslutade/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if ([statusCodes.Rejected, statusCodes.Approved].includes(value.code)) {
          cy.contains(key).should('exist');
        }
      });
    });
};

export const testCases = () => {
  testOngoingCases();
  testClosedCases();
};

export const testPaidInvoices = () => {
  cy.contains('h1, h2', /^betalda/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      paidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
      });
    });
};

export const testNotPaidInvoices = () => {
  cy.contains('h1, h2', /obetalda/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      notPaidInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
      });
    });
};

export const testOtherInvoices = () => {
  cy.contains('h1, h2', /övriga/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      otherInvoices.map((key) => {
        cy.contains(statusMapInvoices[key].label).should('exist');
      });
    });
};

export const testInvoices = () => {
  testPaidInvoices();
  testNotPaidInvoices();
  testOtherInvoices();
};

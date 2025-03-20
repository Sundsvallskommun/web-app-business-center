import { RepresentingMode } from '@interfaces/app';
import { statusCodes } from '@interfaces/status-codes';
import { statusMapCases } from '@services/case-service';
import { notPaidInvoices, otherInvoices, paidInvoices, statusMapInvoices } from '@services/invoice-service';
import { representingModeDefault } from 'cypress/support/e2e';

export const testContactSettings = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h2', 'Kontaktvägar').next().contains('button', 'Redigera').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.contains('label', 'test@example.com').should('exist');
  cy.contains('label', '+46701740605').should('exist');
  cy.get('[name="notifications.phone_disabled"]').should('be.checked');
  cy.get('[name="notifications.email_disabled"]').should('be.checked');
};

export const testOngoingCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /pågående/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if (value.code === statusCodes.Ongoing) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });
    });
};

export const testClosedCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /avslutade/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      Object.entries(statusMapCases).map(([key, value]) => {
        if ([statusCodes.Rejected, statusCodes.Approved].includes(value.code)) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });
    });
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

export const testInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  testPaidInvoices(representingMode);
  testNotPaidInvoices(representingMode);
  testOtherInvoices(representingMode);
};

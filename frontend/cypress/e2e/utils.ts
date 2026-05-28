import { RepresentingMode } from '@interfaces/app';
import { statusCodes } from '@interfaces/status-codes';
import { statusMapCases } from '@services/case-service';
import { handledInvoices, notHandledInvoices, statusMapInvoices } from '@services/invoice-service';
import { getRepresentingModeName } from '@utils/representingModeRoute';
import { getCase } from 'cypress/fixtures/getCase';
import { getCaseMessages } from 'cypress/fixtures/getCaseMessages';
import { getContactSettings } from 'cypress/fixtures/getContactSettings';
import { getPdf } from 'cypress/fixtures/getPdf';
import { representingModeDefault } from 'cypress/support/e2e';

export const testContactSettings = (representingMode: RepresentingMode = representingModeDefault) => {
  // Kontaktuppgifter
  cy.intercept('POST', '**/api/contactsettings', getContactSettings(representingMode)).as(`postContactSettings`);
  cy.contains('h4', 'Kontaktuppgifter').click();

  // Edit email
  cy.get('[data-cy="edit-email-button"]').should('be.visible').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.get('[data-cy="cancel-edit-email-button"]').should('be.visible');
  cy.get('input[name="email"]').should('have.value', 'test@example.com');
  cy.get('[data-cy="save-email-button"]').should('be.visible').click();
  cy.wait('@postContactSettings');
  cy.get('[data-cy="form-box-email"]').should('contain', 'test@example.com');
  cy.get('[data-cy="edit-email-button"]').should('be.visible');

  // Edit phone
  cy.get('[data-cy="edit-phone-button"]').should('be.visible').click();
  cy.contains('label', `name-${RepresentingMode[representingMode]}`).should('exist');
  cy.get('[data-cy="cancel-edit-phone-button"]').should('be.visible');
  cy.get('input[name="phone"]').should('have.value', '+46701740605');
  cy.get('[data-cy="save-phone-button"]').should('be.visible').click();
  cy.wait('@postContactSettings');
  cy.get('[data-cy="form-box-phone"]').should('contain', '+46701740605');
  cy.get('[data-cy="edit-phone-button"]').should('be.visible');

  // Aviseringar
  cy.contains('h4', 'Aviseringar').click();
  cy.get('[data-cy="edit-notification-channel-button"]').should('be.visible').click();
  cy.get('[name="notifications.phone_enabled"]').should('be.checked');
  cy.get('[name="notifications.email_enabled"]').should('be.checked');
  cy.contains('button:visible', 'Spara').click();
  cy.wait('@postContactSettings');
  cy.get('[data-cy="edit-notification-channel-button"]').should('be.visible');
};

export const testCase = (representingMode: RepresentingMode = representingModeDefault, caseId: string = 'caseId-0') => {
  cy.url().should('include', `${getRepresentingModeName(representingMode, { urlFriendly: true })}/arenden/${caseId}`, {
    timeout: 10000,
  });
  cy.contains('#content h1', getCase(representingMode, caseId).data.caseType as string).should('be.visible');
  cy.contains('button', 'Meddelanden').should('be.visible').click();
  cy.url().should('include', '/meddelanden');
  cy.contains('#content h1', getCase(representingMode, caseId).data.caseType as string).should('be.visible');
  cy.contains('6 meddelanden').should('be.visible');
  cy.get('ul[aria-label="Ärendemeddelanden"]').find('li').should('have.length', 6);
  cy.go('back');
};

export const testOngoingCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/cases/caseId-0', getCase(representingMode, 'caseId-0')).as(`getCase0`);
  cy.intercept('GET', '**/api/cases/caseId-9', getCase(representingMode, 'caseId-9')).as(`getCase9`);
  cy.intercept('GET', '**/api/cases/*/messages', getCaseMessages()).as(`getCaseMessages`);

  // correct length
  cy.contains('h1, h2', /pågående/i)
    .next()
    .find('ul li')
    .should('have.length', 24);

  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('*', 'Visar 24 av 27')
    .should('be.visible');

  // load more
  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('button', 'Visa fler')
    .click();

  cy.contains('h1, h2', /pågående/i)
    .next()
    .find('ul li')
    .should('have.length', 27);

  cy.contains('h1, h2', /pågående/i)
    .next()
    .contains('*', 'Visar 27 av 27')
    .should('be.visible');

  cy.contains('h1, h2', /pågående/i)
    .next('div')
    .find('ul')
    .within(($elem) => {
      Object.entries(statusMapCases).forEach(([key, value]) => {
        if (value.code === statusCodes.Ongoing) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });

      // Ärende
      cy.wait(300); // let render happen for table sorting to take place
      cy.wrap($elem)
        .find(`a[aria-label="Visa caseType-Inskickat-${RepresentingMode[representingMode]}"]`, { timeout: 10000 })
        .should('be.visible')
        .click();
    });
  testCase(representingMode, 'caseId-0');
  cy.go('back');
};

export const testClosedCases = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.intercept('GET', '**/api/cases/caseId-13', getCase(representingMode, 'caseId-13')).as(`getCase13`);

  // correct length
  cy.contains('h1, h2', /avslutade/i)
    .next()
    .find('ul li')
    .should('have.length', 5);

  cy.contains('h1, h2', /avslutade/i)
    .next()
    .contains('*', /Visar 5 av 5/)
    .should('be.visible');

  cy.contains('h1, h2', /avslutade/i)
    .next('div')
    .find('ul')
    .within(($elem) => {
      Object.entries(statusMapCases).forEach(([key, value]) => {
        if ([statusCodes.Rejected, statusCodes.Approved].includes(value.code)) {
          cy.contains(key).should('exist');
          cy.contains(RepresentingMode[representingMode]).should('exist');
        }
      });

      // Ärende
      cy.wait(300); // let render happen for table sorting to take place
      cy.wrap($elem)
        .find(`a[aria-label="Visa caseType-Avslutat-${RepresentingMode[representingMode]}"]`, { timeout: 10000 })
        .first()
        .should('be.visible')
        .click();
    });
  testCase(representingMode, 'caseId-9');
  cy.go('back');
};

export const testCases = (representingMode: RepresentingMode = representingModeDefault) => {
  testOngoingCases(representingMode);
  testClosedCases(representingMode);
};

export const testHandledInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /^hanterade/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      handledInvoices.forEach((key) => {
        cy.contains(statusMapInvoices[key as keyof typeof statusMapInvoices].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testNotHandledInvoices = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.contains('h1, h2', /^ohanterade/i)
    .next('div')
    .contains('th', 'Status')
    .parents('table')
    .find('tbody')
    .within(() => {
      notHandledInvoices.forEach((key) => {
        cy.contains(statusMapInvoices[key as keyof typeof statusMapInvoices].label).should('exist');
        cy.contains(RepresentingMode[representingMode]).should('exist');
      });
    });
};

export const testHandledInvoicesMobile = () => {
  cy.viewport('iphone-5');

  cy.contains('h1, h2', /^hanterade/i)
    .next()
    .contains('*', /Visar \d+ av \d+/)
    .should('not.exist');

  cy.contains('h1, h2', /^hanterade/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('li')
    .find('button')
    .click();

  cy.contains('h1, h2', /^hanterade/i)
    .next()
    .contains('h3', /PAID/)
    .should('be.visible')
    .parentsUntil('li')
    .contains('Referensnummer/OCR');

  cy.viewport('macbook-16');
};

export const testPaidInvoicesPdf = () => {
  cy.intercept('GET', '**/api/invoicepdf/999', getPdf).as('getPdf');
  cy.contains('h1, h2', /^hanterade/i)
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
  testHandledInvoices(representingMode);
  testNotHandledInvoices(representingMode);
  testHandledInvoicesMobile();
  // Not implemented yet due to third-party service issues
  // testPaidInvoicesPdf();
};

export const testAssetPage = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.wait('@getAsset').its('response.statusCode').should('eq', 200);
  cy.url().should('include', '/beslut-och-dokument/assetId-0');
  cy.get('main').contains('Parkeringstillstånd för funktionshindrad').should('exist');
  cy.get('main').contains(RepresentingMode[representingMode]).should('exist');
  cy.get('main').contains('Ärendenummer').next().should('contain.text', 'case-0').should('be.visible');
  cy.get('main').contains('Kortnummer').next().should('contain.text', 'assetId-0').should('be.visible');
  cy.get('main').contains('Beslutad').next().should('contain.text', '1 jan 2021').should('be.visible');
  cy.get('main')
    .contains(/^Giltighetstid$/)
    .next()
    .should('contain.text', '1 jan 2021 - 31 dec 2025')
    .should('be.visible');
};

export const testAssets = (representingMode: RepresentingMode = representingModeDefault) => {
  cy.get('ul[aria-label="Dokument"] li').should('have.length', 1);
  cy.get('ul[aria-label="Dokument"] li').within(() => {
    cy.contains('Parkeringstillstånd för funktionshindrad').should('exist');
    cy.contains(RepresentingMode[representingMode]).should('exist');
    cy.contains('1 jan 2021').should('exist');
  });
  cy.get('ul[aria-label="Dokument"] li a[aria-label="Visa assetId-0"]')
    .click()
    .then(() => {
      testAssetPage(representingMode);
    });
};

export const testDecisions = () => {
  cy.get('ul[aria-label="Beslut i ärenden"] li').should('have.length', 2);
  cy.get('ul[aria-label="Beslut i ärenden"] li')
    .first()
    .within(() => {
      cy.contains('Beslut').should('exist');
      cy.contains('Beslutad 20 februari 2024').should('exist');
    });
};

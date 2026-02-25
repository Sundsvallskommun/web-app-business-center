import { Asset, Status } from '@data-contracts/partyassets/data-contracts';
import { RepresentingMode } from '@interfaces/app';
import { ApiResponse } from '@services/api-service';
import { getAssets } from 'cypress/fixtures/getAssets';
import { getCases } from 'cypress/fixtures/getCases';
import { setIntercepts } from 'cypress/support/e2e';
import dayjs from 'dayjs';

const getAssetsWithExpiringPermit: (representingMode?: RepresentingMode) => ApiResponse<Asset[]> = (
  representingMode = RepresentingMode.PRIVATE
) => ({
  data: [
    {
      assetId: 'assetId-expiring',
      caseReferenceIds: ['case-expiring'],
      description: `Parkeringstillstånd för funktionshindrad-${RepresentingMode[representingMode]}`,
      issued: '2021-01-01',
      origin: 'CASEDATA',
      status: Status.ACTIVE,
      type: 'PERMIT',
      validTo: dayjs().add(2, 'month').format('YYYY-MM-DD'), // Expires in 2 months (within 3 month window)
    },
  ],
  message: 'success',
});

const getAssetsWithNoExpiringPermit: (representingMode?: RepresentingMode) => ApiResponse<Asset[]> = (
  representingMode = RepresentingMode.PRIVATE
) => ({
  data: [
    {
      assetId: 'assetId-valid',
      caseReferenceIds: ['case-valid'],
      description: `Parkeringstillstånd för funktionshindrad-${RepresentingMode[representingMode]}`,
      issued: '2021-01-01',
      origin: 'CASEDATA',
      status: Status.ACTIVE,
      type: 'PERMIT',
      validTo: dayjs().add(6, 'month').format('YYYY-MM-DD'), // Expires in 6 months (outside 3 month window)
    },
  ],
  message: 'success',
});

const getEmptyAssets: () => ApiResponse<Asset[]> = () => ({
  data: [],
  message: 'success',
});

const getEmptyCases: () => ApiResponse<[]> = () => ({
  data: [],
  message: 'success',
});

describe('Att göra (Todo section)', () => {
  describe('Private mode', () => {
    beforeEach(() => {
      setIntercepts(RepresentingMode.PRIVATE);
    });

    it('should render the Att göra section on overview page', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.PRIVATE)).as('getAssets');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);
      cy.contains('h1', 'Att göra').should('be.visible');
      cy.contains('p', 'Här visas ärenden där du har något att hantera.').should('be.visible');
    });

    it('should show cases needing completion', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getEmptyAssets()).as('getAssets');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      // Cases with "Komplettering behövs" status should appear in todo section
      cy.contains('Komplettering behövs på ärende').should('be.visible');
      cy.contains('Du behöver skicka in fler uppgifter').should('be.visible');
      cy.contains('button', 'Till ärendet').should('be.visible');
    });

    it('should show parking permit expiry reminder when permit expires within 3 months', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.PRIVATE)).as('getAssets');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', 'Ditt parkeringstillstånd löper ut').should('be.visible');
      cy.contains('Gå in på tillståndet om du vill förlänga det').should('be.visible');
    });

    it('should not show parking permit expiry reminder when permit expires after 3 months', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithNoExpiringPermit(RepresentingMode.PRIVATE)).as('getAssets');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', 'Ditt parkeringstillstånd löper ut').should('not.exist');
    });

    it('should navigate to permit page when clicking Till ärendet on parking permit expiry', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.PRIVATE)).as('getAssets');
      cy.intercept('GET', '**/api/assets/*', {
        data: getAssetsWithExpiringPermit(RepresentingMode.PRIVATE).data[0],
        message: 'success',
      }).as('getAsset');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', 'Ditt parkeringstillstånd löper ut')
        .parent()
        .parent()
        .parent()
        .within(() => {
          cy.get('a[href*="beslut-och-dokument"]').click();
        });

      cy.url().should('include', '/privat/beslut-och-dokument/assetId-expiring');
    });

    it('should navigate to case page when clicking Till ärendet on case todo', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getEmptyAssets()).as('getAssets');
      cy.intercept('GET', '**/api/cases/*', {
        data: getCases(RepresentingMode.PRIVATE).data.find((c) => c.externalStatus === 'Komplettering behövs'),
        message: 'success',
      }).as('getCase');
      cy.intercept('GET', '**/api/cases/*/messages', { data: [], message: 'success' }).as('getCaseMessages');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', /Komplettering behövs på ärende/)
        .parent()
        .parent()
        .parent()
        .find('a')
        .first()
        .click({ force: true });

      cy.url().should('include', '/privat/arenden/');
    });

    it('should show empty state when no todos exist', () => {
      cy.intercept('GET', '**/api/cases', getEmptyCases()).as('getCases');
      cy.intercept('GET', /(.*)api\/assets$/, getEmptyAssets()).as('getAssets');
      cy.visit('/privat/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('Du har inga ärenden att hantera.').should('be.visible');
    });
  });

  describe('Business mode', () => {
    beforeEach(() => {
      setIntercepts(RepresentingMode.BUSINESS);
    });

    it('should render the Att göra section on overview page', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.BUSINESS)).as('getAssets');
      cy.visit('/foretag/oversikt');
      cy.wait(['@getCases', '@getAssets']);
      cy.contains('h1', 'Att göra').should('be.visible');
    });

    it('should show parking permit expiry reminder in business mode', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.BUSINESS)).as('getAssets');
      cy.visit('/foretag/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', 'Ditt parkeringstillstånd löper ut').should('be.visible');
    });

    it('should navigate to permit page in business mode', () => {
      cy.intercept('GET', /(.*)api\/assets$/, getAssetsWithExpiringPermit(RepresentingMode.BUSINESS)).as('getAssets');
      cy.intercept('GET', '**/api/assets/*', {
        data: getAssetsWithExpiringPermit(RepresentingMode.BUSINESS).data[0],
        message: 'success',
      }).as('getAsset');
      cy.visit('/foretag/oversikt');
      cy.wait(['@getCases', '@getAssets']);

      cy.contains('h2', 'Ditt parkeringstillstånd löper ut')
        .parent()
        .parent()
        .parent()
        .find('a')
        .first()
        .click({ force: true });

      cy.url().should('include', '/foretag/beslut-och-dokument/assetId-expiring');
    });
  });
});

import { RepresentingMode } from '@interfaces/app';
import { getAssets } from 'cypress/fixtures/getAssets';
import { setIntercepts } from 'cypress/support/e2e';

// Create expiring asset fixture
const getExpiringAsset = () => {
  const expiringAsset = getAssets(RepresentingMode.PRIVATE);
  expiringAsset.data[0].validTo = new Date().toISOString().split('T')[0]; // Expired today
  return expiringAsset;
};

describe('Parking Permit Renewal', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);

    const expiringAsset = getExpiringAsset();

    cy.intercept('GET', /(.*)api\/assets$/, expiringAsset).as('getAssets');
    cy.intercept('POST', '**/api/assets/parkingpermit/extend', {
      data: { success: true },
      message: 'ok',
    }).as('extendParkingPermit');

    cy.visit('/privat/beslut-och-dokument');
    cy.wait('@getAssets');
  });

  // Helper to navigate to asset page with fresh intercept
  const navigateToAssetPage = () => {
    const expiringAsset = getExpiringAsset();
    cy.intercept('GET', '**/api/assets/*', { data: expiringAsset.data[0], message: 'success' }).as('getAsset');
    cy.get('ul[aria-label="Dokument"] li a').first().click();
    cy.wait('@getAsset');
  };

  it('should display renewal alert for expiring parking permit', () => {
    navigateToAssetPage();

    // Verify renewal alert is visible
    cy.contains('Giltighetstiden för ditt parkeringstillstånd').should('be.visible');
    cy.contains('button', 'Förläng giltighet').should('be.visible');
  });

  it('should navigate through renewal info page', () => {
    navigateToAssetPage();

    // Click extend button
    cy.contains('button', 'Förläng giltighet').click();

    // Verify info page content
    cy.contains('h1', 'Ansök om att förlänga parkeringstillstånd').should('be.visible');
    cy.contains('h2', 'Innan du ansöker').should('be.visible');
    cy.contains('läkarintyg').should('be.visible');
    cy.contains('h2', 'Har du fått läkarintyget via 1177').should('be.visible');
    cy.contains('h2', 'Vad händer efter din ansökan?').should('be.visible');
    cy.contains('10 arbetsdagar').should('be.visible');

    // Verify navigation buttons
    cy.contains('button', 'Tillbaka').should('be.visible');
    cy.contains('button', 'Påbörja ansökan').should('be.visible');
  });

  it('should go back from info page to asset view', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('h1', 'Ansök om att förlänga parkeringstillstånd').should('be.visible');

    cy.contains('button', 'Tillbaka').click();

    // Should be back on asset page
    cy.contains('Parkeringstillstånd för funktionshindrad').should('be.visible');
    cy.contains('Kortnummer').should('be.visible');
  });

  it('should display renewal form with all fields', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Verify form fields
    cy.contains('Har förutsättningarna för din ansökan förändrats').should('be.visible');
    cy.get('input[type="radio"][value="TRUE"]').should('be.checked');
    cy.get('input[type="radio"][value="FALSE"]').should('not.be.checked');

    cy.contains('Beskriv kort vad som förändrats').should('be.visible');
    cy.contains('Vilket eller vilka hjälpmedel används vid förflyttning').should('be.visible');

    // Verify walking aids checkboxes
    cy.get('[data-cy="walking-aids-checkbox-0"]').should('exist'); // Rullator
    cy.get('[data-cy="walking-aids-checkbox-1"]').should('exist'); // Elrullstol
    cy.get('[data-cy="walking-aids-checkbox-2"]').should('exist'); // Krycka/kryckor/käpp
    cy.get('[data-cy="walking-aids-checkbox-3"]').should('exist'); // Rullstol (manuell)

    cy.contains('När gick ditt nuvarande parkeringstillstånd ut').should('be.visible');
    cy.get('input[type="date"]').should('be.visible');

    // Verify file upload area
    cy.contains('Välj fil eller dra och släpp den här').should('be.visible');

    // Verify form buttons
    cy.contains('button', 'Avbryt').should('be.visible');
    cy.contains('button', 'Skicka in').should('be.visible');
  });

  it('should hide description field when circumstances have not changed', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Description field should be visible when "Ja" is selected
    cy.contains('Beskriv kort vad som förändrats').should('be.visible');

    // Click "Nej" radio button
    cy.get('[data-cy="circumstances-changed-false"]').click();

    // Description and walking aids fields should be hidden
    cy.contains('Beskriv kort vad som förändrats').should('not.exist');
    cy.contains('Vilket eller vilka hjälpmedel används').should('not.exist');
  });

  it('should cancel form and return to info page', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Verify on form page
    cy.contains('Beskriv kort vad som förändrats').should('be.visible');

    // Click cancel
    cy.contains('button', 'Avbryt').click();

    // Should be back on info page
    cy.contains('h2', 'Innan du ansöker').should('be.visible');
  });

  it('should submit renewal form successfully', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Fill out the form
    cy.get('input[name="description"]').type('Försämrad rörlighet i höger ben');
    cy.get('[data-cy="walking-aids-checkbox-0"]').parent().click(); // Rullator
    cy.get('[data-cy="walking-aids-checkbox-3"]').parent().click(); // Rullstol (manuell)
    cy.get('input[type="date"]').type('2025-12-31');

    // Submit the form
    cy.contains('button', 'Skicka in').click();

    // Confirm dialog should appear
    cy.contains('Ansök om förlängning?').should('be.visible');
    cy.contains('Vill skicka in ansökan om förlängning av parkeringstillstånd?').should('be.visible');

    // Confirm submission
    cy.contains('button', 'Ja').click();

    // Wait for API call and verify request body
    cy.wait('@extendParkingPermit').should(({ request }) => {
      // Verify content type
      expect(request.headers['content-type']).to.include('multipart/form-data');

      // Verify form fields are present
      expect(request.body).to.include('name="description"');
      expect(request.body).to.include('Försämrad rörlighet i höger ben');

      expect(request.body).to.include('name="circumstancesChanged"');
      expect(request.body).to.include('TRUE');

      expect(request.body).to.include('name="date"');
      expect(request.body).to.include('2025-12-31');

      expect(request.body).to.include('name="walkingAids"');
      expect(request.body).to.include('Rullator');
      expect(request.body).to.include('Rullstol (manuell)');
    });

    // Verify success page
    cy.contains('h1', 'Ansökan inskickad').should('be.visible');
    cy.contains('Din ansökan om att förlänga ditt parkeringstillstånd är inskickad').should('be.visible');
    cy.contains('Vi handlägger ärendet').should('be.visible');
    cy.contains('button', 'Tillbaka till översikt').should('be.visible');
  });

  it('should submit renewal form with file attachment', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Fill out the form
    cy.get('input[name="description"]').type('Behöver ny bedömning');
    cy.get('input[type="date"]').type('2025-12-31');

    // Upload a medical certificate
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake medical certificate content'),
        fileName: 'lakarintyg.pdf',
        mimeType: 'application/pdf',
      },
      { force: true }
    );

    // Verify file is shown in the list
    cy.contains('lakarintyg.pdf').should('be.visible');

    // Submit the form
    cy.contains('button', 'Skicka in').click();
    cy.contains('button', 'Ja').click();

    // Wait for API call and verify request body
    cy.wait('@extendParkingPermit').should(({ request }) => {
      // Verify content type
      expect(request.headers['content-type']).to.include('multipart/form-data');

      // Verify form fields
      expect(request.body).to.include('name="description"');
      expect(request.body).to.include('Behöver ny bedömning');
      expect(request.body).to.include('name="date"');
      expect(request.body).to.include('2025-12-31');

      // Verify file attachment
      expect(request.body).to.include('name="files"');
      expect(request.body).to.include('filename="lakarintyg.pdf"');
      expect(request.body).to.include('application/pdf');
    });

    // Verify success page
    cy.contains('h1', 'Ansökan inskickad').should('be.visible');
  });

  it('should cancel submission in confirm dialog', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Fill required fields
    cy.get('input[name="description"]').type('Test');
    cy.get('input[type="date"]').type('2025-12-31');

    // Submit the form
    cy.contains('button', 'Skicka in').click();

    // Cancel in confirm dialog
    cy.contains('button', 'Nej').click();

    // Should still be on form page
    cy.contains('Beskriv kort vad som förändrats').should('be.visible');
    cy.get('input[name="description"]').should('have.value', 'Test');
  });

  it('should return to asset view from success page', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Fill and submit form
    cy.get('input[name="description"]').type('Test');
    cy.get('input[type="date"]').type('2025-12-31');
    cy.contains('button', 'Skicka in').click();
    cy.contains('button', 'Ja').click();
    cy.wait('@extendParkingPermit');

    // Click back to overview
    cy.contains('button', 'Tillbaka till översikt').click();

    // Should be back on asset page
    cy.contains('Parkeringstillstånd för funktionshindrad').should('be.visible');
    cy.contains('Kortnummer').should('be.visible');
  });

  it('should validate required fields before submission', () => {
    navigateToAssetPage();

    cy.contains('button', 'Förläng giltighet').click();
    cy.contains('button', 'Påbörja ansökan').click();

    // Try to submit without filling required fields
    cy.contains('button', 'Skicka in').click();

    // Form should show validation errors (form won't submit due to HTML5 validation)
    // The confirm dialog should NOT appear
    cy.contains('Ansök om förlängning?').should('not.exist');
  });
});

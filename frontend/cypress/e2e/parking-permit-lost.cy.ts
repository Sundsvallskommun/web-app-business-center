import { RepresentingMode } from '@interfaces/app';
import { getAssets } from 'cypress/fixtures/getAssets';
import { setIntercepts } from 'cypress/support/e2e';

describe('Report Lost Parking Permit', () => {
  beforeEach(() => {
    setIntercepts(RepresentingMode.PRIVATE);

    cy.intercept('GET', /(.*)api\/assets$/, getAssets(RepresentingMode.PRIVATE)).as('getAssets');
    cy.intercept('POST', '**/api/assets/parkingpermit/lost', {
      data: { success: true },
      message: 'ok',
    }).as('reportLostPermit');

    cy.visit('/privat/beslut-och-dokument');
    cy.wait('@getAssets');
  });

  // Helper to navigate to asset page
  const navigateToAssetPage = () => {
    const assets = getAssets(RepresentingMode.PRIVATE);
    cy.intercept('GET', '**/api/assets/*', { data: assets.data[0], message: 'success' }).as('getAsset');
    cy.get('ul[aria-label="Dokument"] li a').first().click();
    cy.wait('@getAsset');
  };

  it('should display report lost permit button for parking permit', () => {
    navigateToAssetPage();

    // Verify lost permit button is visible
    cy.get('[data-cy="report-lost-permit-button"]').should('be.visible');
    cy.contains('button', 'Anmäl borttappat tillstånd').should('be.visible');
  });

  it('should navigate to info page when clicking report lost permit button', () => {
    navigateToAssetPage();

    // Click report lost permit button
    cy.get('[data-cy="report-lost-permit-button"]').click();

    // Verify info page content
    cy.contains('h1', 'Anmäl borttappat parkeringstillstånd').should('be.visible');
    cy.contains('h2', 'Innan du anmäler').should('be.visible');
    cy.contains('Gör en polisanmälan').should('be.visible');
    cy.contains('kopia av polisanmälan i PDF-format').should('be.visible');
    cy.contains('diarienumret i polisanmälan').should('be.visible');
    cy.contains('h2', 'Vad händer efter din anmälan?').should('be.visible');
    cy.contains('10 arbetsdagar').should('be.visible');

    // Verify navigation buttons
    cy.contains('button', 'Tillbaka').should('be.visible');
    cy.contains('button', 'Påbörja anmälan').should('be.visible');
  });

  it('should go back from info page to asset view', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('h1', 'Anmäl borttappat parkeringstillstånd').should('be.visible');

    cy.contains('button', 'Tillbaka').click();

    // Should be back on asset page
    cy.contains('Parkeringstillstånd för funktionshindrad').should('be.visible');
    cy.contains('Ärendenummer').should('be.visible');
  });

  it('should display form with all required fields', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Verify form header and subtitle
    cy.contains('h1', 'Anmäl borttappat parkeringstillstånd').should('be.visible');
    cy.contains('Bifoga din polisanmälan och ange diarienumret nedan').should('be.visible');

    // Verify police report number field
    cy.contains('Ange diarienummer från polisanmälan').should('be.visible');
    cy.get('[data-cy="police-report-number-input"]').should('be.visible');
    cy.contains('Diarienumret hittar du i din polisanmälan').should('be.visible');

    // Verify file upload field
    cy.contains('Bifoga kopia av polisanmälan').should('be.visible');
    cy.contains('Tillåtna filtyper: PDF, Word, JPEG').should('be.visible');
    cy.contains('Max filstorlek: 25 MB').should('be.visible');

    // Verify form buttons
    cy.contains('button', 'Avbryt').should('be.visible');
    cy.contains('button', 'Skicka in').should('be.visible');
  });

  it('should cancel form and return to info page', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Verify on form page
    cy.get('[data-cy="police-report-number-input"]').should('be.visible');

    // Click cancel
    cy.contains('button', 'Avbryt').click();

    // Should be back on info page
    cy.contains('h2', 'Innan du anmäler').should('be.visible');
  });

  it('should submit lost permit report successfully', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill out the form
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');

    // Submit the form
    cy.get('[data-cy="submit-lost-permit-button"]').click();

    // Confirm dialog should appear
    cy.contains('Skicka in anmälan?').should('be.visible');
    cy.contains('Vill du skicka in anmälan om borttappat parkeringstillstånd?').should('be.visible');

    // Confirm submission
    cy.contains('button', 'Ja').click();

    // Wait for API call and verify request body
    cy.wait('@reportLostPermit').should(({ request }) => {
      // Verify content type is multipart/form-data
      expect(request.headers['content-type']).to.include('multipart/form-data');

      // Verify the form field name and value for police report number
      expect(request.body).to.include('name="policeReportNumber"');
      expect(request.body).to.include('5000-K123456-21');
    });

    // Verify success page
    cy.contains('h1', 'Anmälan inskickad').should('be.visible');
    cy.contains('Din anmälan om borttappat parkeringstillstånd är inskickad').should('be.visible');
    cy.contains('Vi handlägger ärendet').should('be.visible');
    cy.contains('button', 'Tillbaka till översikt').should('be.visible');
  });

  it('should submit with a single file attachment', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill out the form
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');

    // Upload a single file
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake pdf content'),
        fileName: 'polisanmalan.pdf',
        mimeType: 'application/pdf',
      },
      { force: true }
    );

    // Verify file is shown in the list
    cy.contains('polisanmalan.pdf').should('be.visible');

    // Submit the form
    cy.get('[data-cy="submit-lost-permit-button"]').click();
    cy.contains('button', 'Ja').click();

    // Wait for API call and verify request contains the file
    cy.wait('@reportLostPermit').should(({ request }) => {
      // Verify content type
      expect(request.headers['content-type']).to.include('multipart/form-data');

      // Verify police report number field
      expect(request.body).to.include('name="policeReportNumber"');
      expect(request.body).to.include('5000-K123456-21');

      // Verify file attachment field and filename
      expect(request.body).to.include('name="files"');
      expect(request.body).to.include('filename="polisanmalan.pdf"');

      // Verify file content type in the multipart data
      expect(request.body).to.include('application/pdf');
    });

    // Verify success page
    cy.contains('h1', 'Anmälan inskickad').should('be.visible');
  });

  it('should submit with multiple file attachments', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill out the form
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');

    // Upload multiple files at once
    cy.get('input[type="file"]').selectFile(
      [
        {
          contents: Cypress.Buffer.from('fake pdf content 1'),
          fileName: 'polisanmalan1.pdf',
          mimeType: 'application/pdf',
        },
        {
          contents: Cypress.Buffer.from('fake pdf content 2'),
          fileName: 'polisanmalan2.pdf',
          mimeType: 'application/pdf',
        },
      ],
      { force: true }
    );

    // Verify both files are shown in the list
    cy.contains('polisanmalan1.pdf').should('be.visible');
    cy.contains('polisanmalan2.pdf').should('be.visible');

    // Submit the form
    cy.get('[data-cy="submit-lost-permit-button"]').click();
    cy.contains('button', 'Ja').click();

    // Wait for API call and verify request contains both files
    cy.wait('@reportLostPermit').should(({ request }) => {
      expect(request.headers['content-type']).to.include('multipart/form-data');
      expect(request.body).to.include('name="policeReportNumber"');
      expect(request.body).to.include('5000-K123456-21');
      expect(request.body).to.include('filename="polisanmalan1.pdf"');
      expect(request.body).to.include('filename="polisanmalan2.pdf"');
    });

    // Verify success page
    cy.contains('h1', 'Anmälan inskickad').should('be.visible');
  });

  it('should allow removing uploaded files', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Upload a file
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from('fake pdf content'),
        fileName: 'polisanmalan.pdf',
        mimeType: 'application/pdf',
      },
      { force: true }
    );

    // Verify file is shown
    cy.contains('polisanmalan.pdf').should('be.visible');

    // Remove the file
    cy.get('button[aria-label*="Ta bort"]').click();

    // Verify file is removed and upload field is shown again
    cy.contains('polisanmalan.pdf').should('not.exist');
    cy.contains('Välj fil eller dra och släpp').should('be.visible');
  });

  it('should cancel submission in confirm dialog', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill required field
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');

    // Submit the form
    cy.get('[data-cy="submit-lost-permit-button"]').click();

    // Cancel in confirm dialog
    cy.contains('button', 'Nej').click();

    // Should still be on form page with data preserved
    cy.get('[data-cy="police-report-number-input"]').should('have.value', '5000-K123456-21');
  });

  it('should return to asset view from success page', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill and submit form
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');
    cy.get('[data-cy="submit-lost-permit-button"]').click();
    cy.contains('button', 'Ja').click();
    cy.wait('@reportLostPermit');

    // Click back to overview
    cy.contains('button', 'Tillbaka till översikt').click();

    // Should be back on asset page
    cy.contains('Parkeringstillstånd för funktionshindrad').should('be.visible');
    cy.contains('Ärendenummer').should('be.visible');
  });

  it('should validate required police report number field', () => {
    navigateToAssetPage();

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Try to submit without filling required field
    cy.get('[data-cy="submit-lost-permit-button"]').click();

    // Form should show validation - confirm dialog should NOT appear
    cy.contains('Skicka in anmälan?').should('not.exist');
  });

  it('should handle API error gracefully', () => {
    navigateToAssetPage();

    // Override intercept to return error
    cy.intercept('POST', '**/api/assets/parkingpermit/lost', {
      statusCode: 500,
      body: { message: 'Internal server error' },
    }).as('reportLostPermitError');

    cy.get('[data-cy="report-lost-permit-button"]').click();
    cy.contains('button', 'Påbörja anmälan').click();

    // Fill and submit form
    cy.get('[data-cy="police-report-number-input"]').type('5000-K123456-21');
    cy.get('[data-cy="submit-lost-permit-button"]').click();
    cy.contains('button', 'Ja').click();

    // Wait for API call
    cy.wait('@reportLostPermitError');

    // Should show error message (snackbar)
    cy.contains('Något gick fel').should('be.visible');

    // Should still be on form page
    cy.get('[data-cy="police-report-number-input"]').should('be.visible');
  });
});

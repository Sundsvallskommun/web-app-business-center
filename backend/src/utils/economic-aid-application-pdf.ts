import { ApplicationPdfDocument, ApplicationPdfGroup, ApplicationPdfSection, ApplicationPdfSignature } from '@/interfaces/application-pdf.interface';

/**
 * Builds a finished, print-ready HTML document from an {@link ApplicationPdfDocument}. The HTML is
 * self-contained (inline CSS) so the templating service only has to convert it to PDF — no template
 * variables are used. The frontend supplies all labels/values; this module only lays them out as
 * numbered groups (1. Personuppgifter, 2. Boendesituation, …) with sub-sections and a signature block.
 */

const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Preserve line breaks entered in free-text answers / multi-paragraph help texts.
const formatValue = (value: string): string => escapeHtml(value).replace(/\r?\n/g, '<br />');

/**
 * Sentinel the serializer uses for a ticked checkbox (e.g. försäkran). Rendered as a CSS-drawn
 * checkmark rather than the "✓" glyph, which does not render reliably in the PDF font.
 */
const CHECKMARK = '✓';
const renderAnswer = (value: string): string => {
  if (value === CHECKMARK) return '<span class="bock" role="img" aria-label="Ja"></span>';
  return formatValue(value);
};

/**
 * Optional logo as a data URI (e.g. "data:image/png;base64,...."). Left empty for now — the header
 * falls back to a styled wordmark. Drop a base64 logo here to brand the PDF without other changes.
 */
const LOGO_DATA_URI = '';

const renderHeader = (title: string, subtitle?: string): string => {
  const brand = LOGO_DATA_URI
    ? `<img class="brand-logo" src="${LOGO_DATA_URI}" alt="Sundsvalls kommun" />`
    : `<div class="brand-wordmark">Sundsvalls kommun</div>`;
  return `
    <header class="doc-header">
      ${brand}
      <div class="doc-title">
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>` : ''}
      </div>
    </header>`;
};

const renderSection = (section: ApplicationPdfSection): string => {
  const rows = section.rows
    .map(
      row => `
        <div class="row">
          <dt>
            <span class="label">${escapeHtml(row.label)}</span>
            ${row.info ? `<span class="row-info">${formatValue(row.info)}</span>` : ''}
          </dt>
          <dd><span class="answer">${renderAnswer(row.value)}</span></dd>
        </div>`,
    )
    .join('');
  return `
    <section class="section">
      ${section.heading ? `<h3>${escapeHtml(section.heading)}</h3>` : ''}
      ${section.info ? `<p class="section-info">${formatValue(section.info)}</p>` : ''}
      ${rows ? `<dl class="rows">${rows}</dl>` : ''}
    </section>`;
};

const renderGroup = (group: ApplicationPdfGroup): string => `
    <div class="group">
      <h2 class="group-heading">${escapeHtml(group.heading)}</h2>
      ${group.sections.map(renderSection).join('')}
    </div>`;

/**
 * MOCK: BankID-signering. Renderar de mockade signaturerna längst ner. När riktig BankID-signering
 * införs ska name/personnummer/checksum/signedAt komma från BankID-svaret (completionData.user.name,
 * .personalNumber, kontrollsumman av signaturen/ocspResponse och signeringstidpunkten). Byt ut
 * mock-genereringen i controllern (buildMockSignature) — den här layouten kan behållas.
 */
const renderSignatures = (signatures: ApplicationPdfSignature[] | undefined): string => {
  if (!signatures?.length) return '';
  const items = signatures
    .map(
      signature => `
      <div class="signature">
        <div class="sig-name">${escapeHtml(signature.name)}</div>
        <dl class="rows">
          <div class="row"><dt>Personnummer</dt><dd><span class="answer">${escapeHtml(signature.personnummer)}</span></dd></div>
          <div class="row"><dt>Signerad med BankID</dt><dd><span class="answer">Ja</span></dd></div>
          <div class="row"><dt>Datum och tid</dt><dd><span class="answer">${escapeHtml(signature.signedAt)}</span></dd></div>
          <div class="row"><dt>Kontrollsumma (BankID-svar)</dt><dd><span class="answer checksum">${escapeHtml(signature.checksum)}</span></dd></div>
        </dl>
      </div>`,
    )
    .join('');
  return `
    <div class="group signatures">
      <h2 class="group-heading">Underskrift</h2>
      <p class="section-info">Mockad BankID-signering — ersätts med riktig BankID-signatur i framtiden.</p>
      ${items}
    </div>`;
};

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; font-size: 12px; margin: 32px; }
  .doc-header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #0a5564; padding-bottom: 16px; margin-bottom: 24px; }
  .brand-logo { height: 48px; }
  .brand-wordmark { font-size: 18px; font-weight: 700; color: #0a5564; }
  .doc-title h1 { font-size: 20px; margin: 0; }
  .doc-subtitle { margin: 4px 0 0; color: #555; font-size: 12px; }
  .group { margin-bottom: 22px; }
  .group-heading { font-size: 16px; color: #0a5564; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 0 0 10px; }
  .section { margin-bottom: 14px; page-break-inside: avoid; }
  .section h3 { font-size: 13px; margin: 0 0 6px; }
  .section-info { margin: 0 0 8px; color: #555; font-size: 11px; font-style: italic; }
  .rows { margin: 0; }
  .row { display: flex; gap: 12px; padding: 3px 0; border-bottom: 1px solid #eee; align-items: flex-start; }
  .row dt { flex: 0 0 45%; color: #555; margin: 0; display: flex; flex-direction: column; }
  .row dd { flex: 1 1 55%; margin: 0; }
  .row dd .answer { font-weight: 600; }
  .row-info { color: #777; font-size: 10px; font-style: italic; margin-top: 2px; }
  .bock { display: inline-block; width: 7px; height: 12px; border: solid #0a5564; border-width: 0 2.5px 2.5px 0; transform: rotate(45deg); }
  .signatures { margin-top: 24px; border-top: 2px solid #0a5564; padding-top: 16px; }
  .signature { margin-bottom: 12px; }
  .sig-name { font-weight: 700; font-size: 13px; margin-bottom: 4px; }
  .checksum { font-family: "Courier New", monospace; font-weight: 400; word-break: break-all; }
`;

export const buildApplicationPdfHtml = (doc: ApplicationPdfDocument): string => {
  const body = [renderHeader(doc.title, doc.subtitle), ...doc.groups.map(renderGroup), renderSignatures(doc.signatures)].join('\n');

  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)}</title>
  <style>${STYLES}</style>
</head>
<body>
${body}
</body>
</html>`;
};

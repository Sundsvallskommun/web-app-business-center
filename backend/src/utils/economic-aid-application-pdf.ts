import {
  ApplicationPdfDocument,
  ApplicationPdfGroup,
  ApplicationPdfList,
  ApplicationPdfSection,
  ApplicationPdfSignature,
} from '@/interfaces/application-pdf.interface';

/**
 * Builds a finished, print-ready HTML document from an {@link ApplicationPdfDocument}, styled after
 * the municipality's letter template (logo top left, black on white, Arial). Templating renders the
 * HTML as a template, which resolves the {% include %} of the shared logo and letter style; all text
 * is escaped so it is never evaluated as template code. The frontend supplies all labels/values; this
 * module only lays them out as numbered groups (1. Personuppgifter, 2. Kostnader, …) with
 * sub-sections and a signature block.
 */

/** Shared templating resources, pulled in with {% include %} when they are stored in templating. */
export const PDF_LOGO_TEMPLATE = 'resource.image.logo.sundsvallskommun-medium';
export const PDF_LETTER_STYLE_TEMPLATE = 'resource.style.letter.default';

/** Which of the shared resources are stored in templating — an include of a missing one fails the render. */
export interface ApplicationPdfResources {
  logo: boolean;
  letterStyle: boolean;
}

// `{` and `}` are encoded as well: templating renders the document as a (Pebble) template, so text an
// applicant typed, such as "{{ … }}" or "{% … %}", must never be evaluated.
const escapeHtml = (value: string): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');

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

// Logo top left, laid out as in the letter template; a text wordmark where the logo resource is missing.
const renderLogo = (hasLogo: boolean): string => `
    <div class="logo">
      <div class="logo-image">${hasLogo ? `{% include "${PDF_LOGO_TEMPLATE}" %}` : '<span class="wordmark">Sundsvalls kommun</span>'}</div>
    </div>`;

const renderHeader = (title: string, subtitle?: string): string => `
    <header class="doc-header">
      <h1>${escapeHtml(title)}</h1>
      ${subtitle ? `<p class="doc-subtitle">${escapeHtml(subtitle)}</p>` : ''}
    </header>`;

const renderList = (list: ApplicationPdfList): string => `
      ${list.heading ? `<p class="list-heading">${escapeHtml(list.heading)}</p>` : ''}
      <ul class="list">${list.items.map(item => `<li>${formatValue(item)}</li>`).join('')}</ul>`;

const renderSection = (section: ApplicationPdfSection, withDivider: boolean): string => {
  const rows = (section.rows ?? [])
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
      ${(section.lists ?? []).map(renderList).join('')}
      ${rows ? `<dl class="rows">${rows}</dl>` : ''}
      ${section.note ? `<p class="note">${formatValue(section.note)}</p>` : ''}
    </section>
    ${withDivider ? '<hr class="divider" />' : ''}`;
};

const renderGroup = (group: ApplicationPdfGroup): string => {
  const lastIndex = group.sections.length - 1;
  // A divider after the group's last section would sit right on top of the next group heading's rule.
  const sections = group.sections.map((section, index) => renderSection(section, section.divider === true && index < lastIndex));
  return `
    <div class="group">
      <h2 class="group-heading">${escapeHtml(group.heading)}</h2>
      ${sections.join('')}
    </div>`;
};

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

// Styled after the letter template: A4, Arial, black on white, bold headings and thin black rules.
// Comes after the shared letter style, so the layout is the same whether or not that is available.
const STYLES = `
  @page { size: A4; margin: 14mm 18mm 18mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; font-size: 9.5pt; line-height: 1.3; margin: 0; }
  .logo { position: relative; height: 80px; }
  .logo-image { position: absolute; left: 0; }
  .wordmark { font-size: 16pt; font-weight: 700; }
  .doc-header { margin: 16px 0 22px; }
  .doc-header h1 { font-size: 13pt; font-weight: 700; margin: 0; }
  .doc-subtitle { margin: 3px 0 0; font-size: 10pt; }
  .group { margin-bottom: 18px; }
  .group-heading { font-size: 11.5pt; font-weight: 700; border-bottom: 0.75pt solid #000; padding-bottom: 3px; margin: 0 0 8px; }
  .section { margin-bottom: 12px; page-break-inside: avoid; }
  .section h3 { font-size: 10pt; font-weight: 700; margin: 0 0 4px; }
  .section-info { margin: 0 0 6px; color: #444; font-size: 8.5pt; font-style: italic; }
  .rows { margin: 0; }
  .row { display: flex; gap: 12px; padding: 3px 0; border-bottom: 0.5pt solid #d9d9d9; align-items: flex-start; }
  .row dt { flex: 0 0 48%; margin: 0; display: flex; flex-direction: column; }
  .row dd { flex: 1 1 52%; margin: 0; }
  .row dd .answer { font-weight: 700; }
  .row-info { color: #444; font-size: 8pt; font-style: italic; margin-top: 2px; }
  .list-heading { font-weight: 700; margin: 6px 0 3px; }
  .list { margin: 0 0 6px; padding-left: 16px; }
  .list li { margin-bottom: 2px; }
  .note { margin: 8px 0 0; padding: 8px 10px; border: 0.75pt solid #000; }
  .divider { border: 0; border-top: 0.75pt solid #000; margin: 0 0 12px; }
  .bock { display: inline-block; width: 6px; height: 11px; border: solid #000; border-width: 0 2px 2px 0; transform: rotate(45deg); }
  .signatures { margin-top: 20px; }
  .signature { margin-bottom: 12px; page-break-inside: avoid; }
  .sig-name { font-weight: 700; font-size: 10pt; margin-bottom: 4px; }
  .checksum { font-family: "Courier New", monospace; font-weight: 400; word-break: break-all; }
`;

export const buildApplicationPdfHtml = (doc: ApplicationPdfDocument, resources: ApplicationPdfResources): string => {
  const body = [
    renderLogo(resources.logo),
    renderHeader(doc.title, doc.subtitle),
    ...doc.groups.map(renderGroup),
    renderSignatures(doc.signatures),
  ].join('\n');

  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)}</title>
  <style>
    ${resources.letterStyle ? `{% include "${PDF_LETTER_STYLE_TEMPLATE}" %}` : ''}
    ${STYLES}
  </style>
</head>
<body>
${body}
</body>
</html>`;
};

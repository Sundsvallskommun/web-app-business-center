/**
 * Focused-flow shell for multi-step application forms.
 *
 * Strips the Mina-sidor sub-navigation (BannerMenu) so the applicant has
 * one clear task on screen, but keeps the global Sundsvalls kommun header,
 * alert banner and announcement banner from DefaultLayout — those carry
 * status-critical communication and must stay visible mid-flow.
 *
 * The flow column itself runs at max-w-content (128rem) — same width as
 * the announcement banner and BannerMenu — so the page-level header
 * (H1, subtitle, stepper) lines up with the rest of the page chrome.
 * The actual form card is centered to a narrower width inside the flow
 * (see EconomicAidApplication's CardElevated wrapper) so long forms
 * still read in a single comfortable column.
 *
 * The browser back button and the global header already let the
 * applicant exit, and form state autosaves to sessionStorage so a
 * mid-flow exit is non-destructive.
 */
export const ApplicationFlowLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grow w-full flex flex-col items-center my-40 desktop:my-80">
      <div className="w-full max-w-content px-20 desktop:px-0">
        <main id="content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ApplicationFlowLayout;

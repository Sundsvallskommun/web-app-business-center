import CaseLayout from '@layouts/pages/mypages-sections/cases/case/case-layout.component';

export default async function layout({ params, children }) {
  const { externalCaseId } = await params;
  return <CaseLayout externalCaseId={externalCaseId}>{children}</CaseLayout>;
}
